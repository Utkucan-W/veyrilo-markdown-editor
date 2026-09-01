# Changelog

All notable changes to Veyrilo are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/Utkucan-W/veyrilo-markdown-editor/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Utkucan-W/veyrilo-markdown-editor/releases/tag/v1.0.0
