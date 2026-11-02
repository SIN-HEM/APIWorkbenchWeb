# API Workbench website plan

## Purpose
Introduce the Windows offline API workbench and let visitors choose and download a real installer. Show the actual desktop UI with non-private demonstration data. Offer optional support after the installer is ready; never block downloads with a payment.

## Page journey
1. Navigation: product brand, features, screenshots, downloads, and a prominent Windows download action.
2. Hero: precise offline-first promise, version/platform labels, primary download action, and an actual app screenshot.
3. Product tour: request editing and responses, collections/environments/tests, history and portable backups. Screenshot tabs reveal real app views.
4. Local-first explanation: no account or server required, data stays on the computer; internet APIs still require a network.
5. Download chooser: Desktop or Desktop + CLI, exact size, version, Windows requirements, SHA256 checksums, and unsigned-beta notice.
6. Installation FAQ: installation, storage, upgrade/uninstall preservation, future Personal Sync/Collaboration, and known beta limitations.
7. Download follow-up: genuine progress and checksum verification, followed by an optional Buy Me a Coffee link supplied by the owner.

## Design
Graphite canvas, blue brand accents, editorial typography, restrained technical texture, generous whitespace, and large real product imagery. Mobile layouts stack naturally; actions remain keyboard accessible, motion respects reduced-motion preferences, and dialogs restore focus.

## Technical plan
Buildless HTML, CSS, and JavaScript. No analytics, login, forms, or tracking. Installer chunks below the hosting asset-size limit are fetched and SHA256-verified in the browser before an installer is offered. This avoids inventing external download URLs. Capture demo screenshots in an isolated local store, never the owner's saved workspaces or credentials. Save source and deployment configuration in the requested desktop folder.

## Validation
Check content and links, installer hashes, normal and cancelled download flows, support-link safety, responsive rendering, keyboard navigation, and screenshot assets. The owner selected local-only delivery on November 1, 2026. Hosting is out of scope unless newly authorized.

## Creator support
The owner supplied https://buymeacoffee.com/hsrhemant0e. It appears only in the optional follow-up after the verified installer download starts.

## November 2 refresh

Emphasize that Free Local is always free and saves repeated setup through requests, environments and collection runs. Describe six feature groups with practical examples, plus the optional CLI workflow. Avoid unmeasured performance comparisons. Preview all five real appearance themes with keyboard-accessible tabs and an enlarged image viewer. Add the checksum-verified native macOS and Linux installers alongside Windows, with an explicit OS/architecture selector and accurate version/installation notes. Make support@apiworkbench.in the public question/contact route; link the actual private GitHub repository and issues with a clear access note. Keep the site local and the page layout focused, responsive and accessible.
