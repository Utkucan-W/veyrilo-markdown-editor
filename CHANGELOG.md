# Changelog

All notable changes to Veyrilo are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.2] - 2026-11-10

### Security

- Update DOMPurify to 3.4.17 (GHSA-p98j-92pf-mc4p, GHSA-6688-9rhm-gjv2,
  GHSA-cg2g-xh64-v4q7, GHSA-mrv2-3pqr-j5jr, GHSA-c6gr-qvv4-5v3f). Veyrilo's
  sanitizer does not use the affected `IN_PLACE`, hook, `SAFE_FOR_TEMPLATES`
  or XHTML modes, so exposure was low.

### Fixed

- Replace the yanked `async-executor` 1.14.0 with 1.14.1.

## [1.1.1] - 2026-11-10

Packaging and search fixes. Veyrilo now ships for every major Linux family.

### Added

- RPM and AppImage release assets next to the Debian package.
- An AUR-style `PKGBUILD` in `packaging/aur/` that repackages the release `.deb`.

### Fixed

- Packaged builds no longer exit with a Wayland protocol error on NVIDIA GPUs:
  the X11 and WebKit DMA-BUF defaults from the desktop entry are now applied
  by the application itself, unless the user already set them.
- Search in the full-screen preview layout now highlights matches in the
  preview and scrolls to them.
- Typing in the editor while search is open no longer moves focus or the view.
- `Ctrl+-` and `Ctrl++` work on Turkish Q keyboards.
- Editing shortcuts no longer act on the document while another text field,
  the full-screen preview, or the Markdown Guide is focused.
- `Esc` in search, replace, and the command palette no longer also leaves Zen
  mode.
- `Ctrl+P` from the Markdown Guide returns to the document and shows the
  preview; Outline jumps work in the full-screen preview.
- Opening a dropped file now tracks it for external change warnings.

## [1.1.0] - 2026-09-16

The first Veyrilo v1.1 release improves long-document navigation and protects
work from external file changes or unexpected shutdowns.

### Added

- External file change detection with reload or keep-editor-version actions.
- Recovery drafts that can be restored after an unexpected shutdown.
- Searchable command palette (`Ctrl+Shift+P`).
- Live Outline navigation from Markdown headings.
- Version display in the About dialog.
- Turkish and English translations for the new interface text.

### Fixed

- `Ctrl+F` now scrolls the active match into the visible editor area, including
  matches outside the current viewport.

## [1.0.0] - 2026-09-01

Initial public release. Linux desktop build (Tauri 2), distributed as an
x86_64 Debian package.

### Added

- Markdown editing with a live GitHub Flavored Markdown preview.
- Formatting toolbar with configurable keyboard shortcuts.
- Built-in bilingual (Turkish/English) Markdown Guide.
- In-document search with visible matches and keyboard navigation.
- Find and replace (`Ctrl+H`), replacing either the selected match or every
  match in one undo step.
- Drag and drop a Markdown or text file onto the window to open it.
- Block indent and outdent for the selected lines with `Tab` and `Shift+Tab`.
- Pasting a web address over selected text creates a Markdown link.
- Focus mode and Zen mode.
- Light, Dark, Sepia, Dark Gray, Ocean, Forest, and Rose themes with
  adjustable typography.
- Native open/save dialogs for local Markdown and text files.
- Right-click "open with" support from the Linux file manager.
- HTML export and PDF export through the system print dialog.
- Offline operation: Markdown, sanitization, and highlighting libraries
  are bundled.
- Markdown is sanitized before preview or export; external links are
  limited to `http` and `https`.
- Documentation in English and Turkish (`README.md` and `README.tr.md`).
- The About dialog links to the developer's GitHub profile and to the
  project repository; both open in the system browser.

[Unreleased]: https://github.com/Utkucan-W/veyrilo-markdown-editor/compare/v1.1.2...HEAD
[1.1.2]: https://github.com/Utkucan-W/veyrilo-markdown-editor/releases/tag/v1.1.2
[1.1.1]: https://github.com/Utkucan-W/veyrilo-markdown-editor/releases/tag/v1.1.1
[1.1.0]: https://github.com/Utkucan-W/veyrilo-markdown-editor/releases/tag/v1.1.0
[1.0.0]: https://github.com/Utkucan-W/veyrilo-markdown-editor/releases/tag/v1.0.0
