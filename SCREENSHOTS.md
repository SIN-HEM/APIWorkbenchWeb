# Product screenshot provenance

The three PNGs in `dist/assets/` capture the actual API Workbench Avalonia UI:

- `workbench-request.png`: 1440 × 900, request editor and real JSON response.
- `workbench-tests.png`: 1440 × 900, Tests tab and passing assertions.
- `getting-started.png`: 620 × 640, the actual first-run guide.

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
