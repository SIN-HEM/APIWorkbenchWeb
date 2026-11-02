# API Workbench website

A responsive, buildless product and download website for API Workbench on Windows, macOS and Linux. Delivery is local only. Do not publish or upload this folder without new owner authorization.

## Run locally

Install Node.js, open this folder in a terminal, and run `npm run dev`. No dependency installation is required. On Windows, double-click `Start Website.cmd`. Open http://127.0.0.1:4173/ and keep the terminal open; Ctrl+C stops it. Opening `dist/index.html` directly does not support downloads.

Run `npm run check` to verify screenshots, links, all ten installer reconstructions and SHA256 hashes, cancellation, error handling, support-link validation, and absence of private data.

## Contents

- `dist/`: static website, real app captures and verified installer chunks.
- `PLAN.md`: content, design and validation plan.
- `SCREENSHOTS.md`: provenance for actual app screenshots, including five appearances captured with isolated demonstration data.
- `site-settings.json`: default Windows release version and optional creator support URL.
- `scripts/prepare-all-downloads.mjs`: verifies all platform installers against release manifests, splits them into chunks of at most 16 MiB, and generates `dist/release.js`.
- `scripts/check.mjs`: content and download checks.
- `preview-qa/refresh-*.png`: refreshed desktop and mobile browser proof.
- `.openai/hosting.json`: retained Sites identity; it does not mean the site is published.

## Content and downloads

The local app is presented as always free, with faster workflows explained through saved requests, reusable environments, assertions and collection runs. Six feature groups explain what each tool does. Five genuine appearance previews include Daylight, Graphite, Ocean, Midnight and Warm Paper, with keyboard navigation and enlargement.

The platform selector offers Windows x64, macOS Apple Silicon / Intel, and Linux x64 / ARM64. Each has Desktop and Desktop + CLI editions. Windows is beta.3; macOS and Linux are beta.4. Native packages are experimental, unsigned betas. Requirements, sizes, hashes and installation guidance follow the selected platform.

Chunks are fetched only when requested, reconstructed locally, and SHA256 checked before the browser receives the original `.exe`, `.pkg` or `.deb`. Optional Buy Me a Coffee support appears after the verified download starts. Downloads and local features never require payment. A browser cannot confirm whether the visitor saved the file, so the dialog offers a save-again link.

Contact links use support@apiworkbench.in and the real SIN-HEM/ApiCollabPlatform repository and issues page. The repository is private; the website explains that GitHub access is required. Adding the email link does not configure a mailbox or verify mail delivery.

There are no analytics, subscriptions, account forms or third-party font requests. No personal workspace databases, account credentials or keys are shipped.

## Update installers

1. Place verified installers and their `SHA256SUMS.txt` manifests in the project's release tree.
2. Update platform definitions in `scripts/prepare-all-downloads.mjs` when versions change.
3. Run `node scripts/prepare-all-downloads.mjs RELEASES_ROOT`.
4. Run `npm run check`, then preview locally and test platform choices and the download dialog.

The older `prepare-downloads.mjs` is retained for legacy Windows-only preparation; use the all-platform script for this site.

## Verification — November 2, 2026

All 15 automated checks passed, including exact size and SHA256 reconstruction of all ten installers. Browser checks covered the desktop hero, appearance selection, keyboard navigation, screenshot enlargement and all five platform/version/format choices. A real macOS Apple Silicon Desktop download reached the SHA256-verified success state and displayed the optional creator support link. The 390px mobile download and contact layouts were checked with no horizontal overflow; the viewport override was reset afterward.

The navbar also includes an optional Buy Me a Coffee link beside Download Free. The organization feature explains Postman collection/environment import and export, secret-safe environment exports, and OpenAPI transfer.
