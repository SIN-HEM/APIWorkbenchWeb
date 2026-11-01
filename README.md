# API Workbench website

A responsive, buildless product and download website for the Windows API Workbench beta.

## Run locally

Install Node.js, open this folder in a terminal, and run:

```text
npm run dev
```

Open the printed local URL. No dependency installation is required. Run `npm run check`
to verify screenshots, page links, installer reconstruction and SHA256, support-link
validation, cancellation, error handling, and absence of private data.

## Contents

- `PLAN.md`: content, design, download behavior, and validation plan.
- `dist/`: the deployable static website, screenshot assets, and installer chunks.
- `site-settings.json`: public release version and creator support URL.
- `scripts/prepare-downloads.mjs`: verifies source installers, splits them into
  hosting-compatible chunks, copies branding, and generates `dist/release.js`.
- `scripts/check.mjs`: meaningful download and content checks.
- `.openai/hosting.json`: the existing Sites identity and static hosting configuration.

The website uses actual app screenshots with isolated demonstration data. It has
no analytics, account system, data-collection form, or third-party font requests.
Installer chunks are fetched on demand, reassembled locally, and SHA256-checked
before the browser is offered the original `.exe`. The optional support link is
shown after the verified download starts; downloads never require payment.

The browser cannot confirm whether a visitor saved a file to disk. The follow-up
therefore says the installer is ready, with a manual save-again link when needed.

## Update a release

1. Put the real installer files and `SHA256SUMS.txt` in a local release directory.
2. Update `site-settings.json` and relevant release copy in `dist/index.html`.
3. Run `node scripts/prepare-downloads.mjs INSTALLER_DIRECTORY BRAND_ASSET_DIRECTORY`.
4. Replace screenshots only with current, non-private captures of the real app.
5. Run `npm run check`, preview, then publish through the existing Sites project.

The site is initially owner-private. A public download site requires changing its
audience to public. This folder includes actual Windows beta installers as
verified chunks; no local workspace databases or credentials are included.
