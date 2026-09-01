<!--
Keep each pull request focused on one change.
Do not include secrets, private documents, generated build output, or local
editor state.
-->

## Summary

<!-- What does this change and why. -->

## User-visible result

<!-- What a user would notice. Note any trade-offs. -->

## Checks run

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `cargo test --manifest-path src-tauri/Cargo.toml`
- [ ] `cargo fmt --manifest-path src-tauri/Cargo.toml --check`
- [ ] `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`

## Notes

- [ ] Tests updated where a behavior change can regress.
- [ ] Turkish and English interface text kept aligned.
