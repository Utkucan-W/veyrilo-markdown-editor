use rfd::FileDialog;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use url::Url;

#[derive(Serialize)]
struct Document {
    name: String,
    content: String,
    path: String,
}

#[derive(Serialize)]
struct SavedFile {
    name: String,
    path: String,
}

fn document_from_path(path: &Path) -> Result<Document, String> {
    let content = fs::read_to_string(path).map_err(|error| error.to_string())?;
    let name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("document.md")
        .to_owned();

    Ok(Document {
        name,
        content,
        path: path.to_string_lossy().into_owned(),
    })
}

fn startup_document_from_args(
    args: impl IntoIterator<Item = std::ffi::OsString>,
) -> Result<Option<Document>, String> {
    for argument in args.into_iter().skip(1) {
        let path = PathBuf::from(argument);
        if path.is_file() {
            return document_from_path(&path).map(Some);
        }
    }

    Ok(None)
}

#[tauri::command]
fn open_file() -> Result<Option<Document>, String> {
    let Some(path) = FileDialog::new()
        .add_filter("Markdown", &["md", "markdown", "txt"])
        .add_filter("All files", &["*"])
        .pick_file()
    else {
        return Ok(None);
    };

    document_from_path(&path).map(Some)
}

/// Bilinen bir yoldaki belgeyi okur: son açılanlar menüsü ve sürükle-bırak
/// aynı komutu kullanır.
#[tauri::command]
fn open_path(path: String) -> Result<Option<Document>, String> {
    let path = PathBuf::from(path);
    document_from_path(&path).map(Some)
}

#[tauri::command]
fn open_startup_file() -> Result<Option<Document>, String> {
    startup_document_from_args(std::env::args_os())
}

#[tauri::command]
fn save_file(content: String, default_name: String) -> Result<Option<SavedFile>, String> {
    let Some(path) = FileDialog::new()
        .add_filter("Markdown", &["md"])
        .add_filter("Text", &["txt"])
        .set_file_name(&default_name)
        .save_file()
    else {
        return Ok(None);
    };

    fs::write(&path, content).map_err(|error| error.to_string())?;
    let name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("document.md")
        .to_owned();

    Ok(Some(SavedFile {
        name,
        path: path.to_string_lossy().into_owned(),
    }))
}

#[tauri::command]
fn save_file_to_path(content: String, path: String) -> Result<SavedFile, String> {
    let path = PathBuf::from(path);
    fs::write(&path, content).map_err(|error| error.to_string())?;
    let name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("document.md")
        .to_owned();

    Ok(SavedFile {
        name,
        path: path.to_string_lossy().into_owned(),
    })
}

#[tauri::command]
fn open_external(url: String) -> Result<bool, String> {
    let Some(url) = safe_external_url(&url) else {
        return Ok(false);
    };

    open::that(url.as_str()).map_err(|error| error.to_string())?;
    Ok(true)
}

#[tauri::command]
fn quit_app() {
    // `WebviewWindow::destroy()` bu Linux kurulumunda (XWayland + zorlanmış
    // X11 backend) prevent_close sonrası kapatmıyor. Süreci doğrudan
    // sonlandırmak tek güvenilir yol; kullanıcı zaten "kaydetme" dedi.
    std::process::exit(0);
}

fn safe_external_url(value: &str) -> Option<Url> {
    let parsed = Url::parse(value).ok()?;
    matches!(parsed.scheme(), "http" | "https").then_some(parsed)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_file,
            open_path,
            open_startup_file,
            save_file,
            save_file_to_path,
            open_external,
            quit_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running Veyrilo");
}

#[cfg(test)]
mod tests {
    use super::{safe_external_url, startup_document_from_args};
    use std::ffi::OsString;
    use std::fs;

    #[test]
    fn accepts_web_urls_only() {
        assert!(safe_external_url("https://example.com").is_some());
        assert!(safe_external_url("http://localhost:3000").is_some());
        assert!(safe_external_url("javascript:alert(1)").is_none());
        assert!(safe_external_url("file:///etc/passwd").is_none());
        assert!(safe_external_url("data:text/html,test").is_none());
    }

    #[test]
    fn reads_a_document_passed_at_startup() {
        let path = std::env::temp_dir().join(format!("veyrilo-startup-{}.md", std::process::id()));
        fs::write(&path, "# Sağ tıkla açıldı").unwrap();

        let document =
            startup_document_from_args([OsString::from("veyrilo"), path.clone().into_os_string()])
                .unwrap()
                .expect("startup file should be read");

        assert_eq!(
            document.name,
            format!("veyrilo-startup-{}.md", std::process::id())
        );
        assert_eq!(document.content, "# Sağ tıkla açıldı");
        assert_eq!(document.path, path.to_string_lossy());
        fs::remove_file(path).unwrap();
    }
}
