# API Workbench website

A responsive, buildless product and download website for the Windows API Workbench beta. The owner requested local-only delivery on November 1, 2026. Do not publish or upload this folder without new authorization.

## Run locally

Install Node.js, open this folder in a terminal, and run:

```text
npm run dev
```

Open the printed local URL. No dependency installation is required. Run `npm run check`
to verify screenshots, page links, installer reconstruction and SHA256, support-link
validation, cancellation, error handling, and absence of private data.

On Windows, double-click `Start Website.cmd`, then open http://127.0.0.1:4173/ in your browser. Keep the terminal open while using the website; press Ctrl+C to stop it. Opening `dist/index.html` directly does not support the download flow.

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
5. Run `npm run check` and preview locally. Publication requires new owner authorization.

The retained Sites manifest records an earlier hosting preparation attempt; it does not mean this website is published. This delivery is local only. This folder includes actual Windows beta installers as verified chunks; no local workspace databases or credentials are included.

## Verification

All six automated checks passed. Desktop and 390px mobile previews were checked, and an actual browser download matched the original desktop installer SHA256. The optional support dialog used the owner's real Buy Me a Coffee URL. The last browser refresh after a whitespace-only mobile copy correction could not run because automatic browser approval review reached its usage limit. Screenshots of the earlier verified previews are in `preview-qa/`.
