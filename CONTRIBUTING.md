# Contributing to Veyrilo

Thank you for helping improve Veyrilo.

## Before you start

- Search existing issues before opening a new one.
- Keep each pull request focused on one change.
- Describe the user-visible result and any trade-offs.
- Do not include secrets, private documents, generated build output, or local editor state.

## Development setup

Install the Linux dependencies for your distribution, then run:

```bash
npm install
npm run desktop:dev
```

## Before opening a pull request

Run the repository checks:

```bash
npm run check
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

Update tests when a behavior change can regress. Keep translations in Turkish
and English aligned when changing visible interface text.

## Reporting bugs and proposing features

Use a GitHub issue. Include the Linux distribution, application version, steps
to reproduce, expected result, and actual result. Do not put security-sensitive
details in a public issue; use the process in [SECURITY.md](SECURITY.md).
