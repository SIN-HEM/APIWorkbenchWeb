# Product screenshot provenance

The product PNGs in `dist/assets/` capture the actual API Workbench Avalonia UI:

- `workbench-request.png`: 1440 × 900, request editor and real JSON response.
- `workbench-tests.png`: 1440 × 900, Tests tab and passing assertions.
- `getting-started.png`: 620 × 640, the actual first-run guide.
- `appearance-graphite.png`: 1440 × 900, the actual Graphite theme, with neutral
  charcoal surfaces, muted blue accents, and light text.
- `appearance-daylight.png`: 1440 × 900, the actual Daylight theme, with white
  surfaces, pale-blue secondary surfaces, dark text, and blue accents.
- `appearance-ocean.png`: 1440 × 900, the actual Ocean theme, with dark petrol
  surfaces, teal accents, and a matching turquoise logo.
- `appearance-midnight.png`: 1440 × 900, the actual Midnight theme, with deep
  navy surfaces and blue accents.
- `appearance-warm-paper.png`: 1440 × 900, the actual Warm Paper theme, with
  warm ivory surfaces, brown text, and muted earthy accents.

The five appearance captures were exported together in a single isolated demo
session on 2 November 2026. They show the same request, response, URL, measured
timing, and passing assertions
so the appearance is the only changed variable. The real `AppThemeService`
applied each theme with `persist: false`; no user theme preferences were written.
The existing request, Tests, and getting-started PNGs were retained unchanged.

The app ran with an isolated demonstration SQLite database and a local loopback
HTTP endpoint. The request returned HTTP 200 in 144 ms in this demonstration;
that timing is not a product benchmark. All workspace, product, and request
values are demonstration data. No personal workspaces or credentials were used.

Captures were exported from the running Avalonia windows with RenderTargetBitmap
to exclude unrelated desktop notifications. They are actual app renders, not
AI-generated images or reconstructed UI mockups. The temporary screenshot
harness was kept outside this website and is not included in the deployed site.

`preview-qa/` contains local browser screenshots of the website itself. Those
files are excluded from the website's source repository and deployment.
