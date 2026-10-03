# AGENTS.md — Block Garden Knowledge Hub

> Guidance for AI agents working on this site's content.

## Project Snapshot

Static knowledge hub for [Block Garden](https://kherrick.github.io/block-garden/), built with [ShadowClaw](https://xt-ml.github.io/shadow-claw/) as the build engine. There is no application source in this repo, only content and configuration.

## Layout

- `pages/main/index.html` — hub home page
- `pages/main/~/content/NN-*.md` — numbered chapters; the filename slug becomes the URL (`/main/<slug>`)
- `pages/main/MEMORY.md`, `pages/main/RESET.md` — agent memory and reset prompt
- `pages/main/theme.css` — site theme
- `pages/resources/` — files copied to the site root (`robots.txt`, `llms.txt`, `AGENTS.md`, `README.md`, `manifest.json`, `404.html`, `assets/`)
- `pages/resources/routes.json` — maps source files to pretty URLs and drives `sitemap.xml` generation
- `shadow-claw.config.json` — site, branding, security, and enabled-tool settings
- `.agents/` — skills, declarative tools, and scripts

## Conventions

- Add a chapter by creating the markdown file and adding a matching entry to `pages/resources/routes.json`; `sitemap.xml` is generated from it at build time. Do not hand-edit a sitemap.
- Update `llms.txt` when chapters are added, renamed, or removed.
- Only custom elements listed in `customElements.allowedElements` in `shadow-claw.config.json` may be used in pages.
- Keep external requests within the `security.connectSrc` allow-list.

## Commands

```bash
npx shadow-claw dev --open   # local dev server on http://127.0.0.1:8888
npx shadow-claw build        # build to dist/public
```

## Reference

- [ShadowClaw AGENTS.md](https://xt-ml.github.io/shadow-claw/AGENTS.md)
- [llms.txt](llms.txt)
