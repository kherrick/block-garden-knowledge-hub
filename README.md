# ShadowClaw Template

This is a starter template for publishing your own static site using
[ShadowClaw](https://github.com/xt-ml/shadow-claw) as the build engine.

## How it works

1. You write your content as markdown (`.md`) or HTML (`.html`) files under
   `pages/main/`.
2. When you push to `main`, the included GitHub Actions workflow:
   - Checks out ShadowClaw's source as a **build dependency** (not redistributed).
   - Copies your `pages/` into the build root.
   - Runs `npm run build:prod` with your repo's GitHub Pages URL injected
     automatically.
   - Deploys `dist/public/` to GitHub Pages via `actions/deploy-pages`.

No ShadowClaw source lives in this repo — only your content and the workflow.

## Quick start

1. Click **Use this template** on GitHub (or fork/clone).
2. In your new repo, go to **Settings → Pages → Source** and select
   **GitHub Actions**.
3. Drop your markdown files into `pages/main/`.
4. Optionally configure `pages/resources/site-config.json` for site branding, sidebar navigation visibility, and page sort order.
5. Optionally edit `pages/resources/routes.json` to add pretty-path URLs.
6. Push to `main` — the workflow builds and deploys automatically.

## Directory layout

```txt
pages/
  main/
    index.md          ← your home page
    ~/content/
      about.md        ← any other pages
  resources/          ← root level files & resources (site-config.json, routes.json, 404.html, manifest.json, sitemap.xml / sitemap.txt, favicon.svg, assets/)
.github/
  workflows/
    deploy-pages.yml  ← the build + deploy workflow (no changes needed)
```

## Declarative Site Configuration (`site-config.json`)

Configure your site metadata, branding, navigation visibility, and sorting declaratively without touching source code:

```json
{
  "site": {
    "title": "My Site",
    "description": "Published with ShadowClaw",
    "themeColor": "#121212",
    "lang": "en"
  },
  "branding": {
    "titleText": "My Project",
    "siteUrl": "https://example.com",
    "repoUrl": "https://github.com/my-user/my-project"
  },
  "sidebar": {
    "pagesHidden": false,
    "chatHidden": true,
    "tasksHidden": true,
    "filesHidden": true,
    "defaultPage": "pages"
  },
  "pages": {
    "sortOrder": "desc"
  },
  "customElements": {
    "allowedElements": ["block-garden", "block-garden-select", "x-pwgen"],
    "allowedDomains": ["kherrick.github.io", "xt-ml.github.io"],
    "scripts": [
      "https://kherrick.github.io/block-garden/block-garden-bundle-min.mjs"
    ]
  }
}
```

### Custom Element & Script Security (`customElements`)

ShadowClaw enforces a deny-by-default security stance on custom elements and external scripts rendered within articles and pages. Site authors can declare approved elements and trusted host domains in `customElements`:

- `allowedElements`: List of custom element tag names permitted in page markup and HTML sanitization (e.g. `["block-garden", "block-garden-select"]`). Unapproved custom elements are blocked from registration and stripped from the DOM.
- `allowedDomains`: List of approved domains or wildcard patterns (e.g. `["kherrick.github.io", "*.github.io"]`) permitted to load scripts or custom element bundles.
- `scripts`: Array of approved script URLs (or objects `{ "src": "...", "type": "module" }`) to preload at build time and on boot.

### Version Pinning (`shadowClawVersion`)

You can pin your site to a specific ShadowClaw release tag (e.g. `v1.20.0`) or git commit SHA (e.g. `62253c53`) to ensure reproducible builds over time:

```json
{
  "shadowClawVersion": "v1.20.0"
}
```

Alternatively, you can place a `.shadowclaw-version` file in the root of your content repository or provide the `shadowclaw_ref` parameter when triggering the GitHub Actions workflow manually.

### Sidebar Visibility Options

You can hide or show individual sidebar navigation items (`pagesHidden`, `chatHidden`, `tasksHidden`, `filesHidden`) and set the default landing section (`defaultPage`: `"pages"` | `"chat"` | `"tasks"` | `"files"`). When hidden, the corresponding section is hidden from the sidebar at build time and on first boot.

## Pretty paths (`routes.json`)

Map source files to clean URLs:

```json
{
  "routes": {
    "/pages/main/index.md": { "prettyPath": "/main" },
    "/pages/main/~/content/about.md": { "prettyPath": "/main/about" },
    "/pages/main/MEMORY.md": { "prettyPath": "/main/memory" }
  }
}
```

The prerender pipeline generates a physical `index.html` for every mapped path
so direct links and page refreshes work correctly on GitHub Pages without any
server-side rewrites.

> **Reserved path prefixes** — the following first-path-segments are owned by
> ShadowClaw's own router and **must not** be used as pretty path prefixes:
> `/`, `/chat`, `/files`, `/tasks`, `/pages`, `/settings`, `/tools`, `/channels`.
> Additionally, `/` (root) is reserved as the default pinned page and is
> unreachable as a pretty path. Use a safe namespace like `/main/`, `/articles/`,
> `/docs/`, or any other prefix that doesn't conflict with the above list.

## Default Pinned Page (`/`)

When a visitor loads the root URL (`/`) of your published site, ShadowClaw automatically displays the **default pinned page**.

### How ShadowClaw selects the default page for `/`:

1. Both the static site build pipeline (`prerender-dsd-shell`) and runtime page store (`orchestratorStore`) collect all files in `pages/main/`.
2. `MEMORY.md` is always sorted to the bottom of the list.
3. All other pages are sorted by `pages.sortOrder` from `site-config.json` (`"desc"` by default, natural numeric, or `"asc"`).
4. The first file in this sorted list (`pages[0]`) becomes the **default page** pre-rendered into the DSD shell at `/`.

### How to ensure your home page is at `/`:

Name your primary home page file so it sorts first in reverse-alphabetical order relative to your other page files in `pages/main/`:

- `index.md` or `index.html` will sort ahead of `about.md`, `contact.md`, or `faq.md`.
- If you have files starting with letters after `i` (e.g. `welcome.md` or `z-post.md`), `welcome.md` will sort ahead of `index.md`. Name your landing page accordingly (or use e.g. `index.md` alongside lower-alphabetical files).

## Custom domain

If you use a custom apex domain (e.g. `example.com`), override the two URL env
vars in the workflow:

```yaml
env:
  PAGES_ORIGIN: "https://example.com/"
  PAGES_BASE_PATH: "/"
```

## In-browser automation (optional)

You can drive publishing from inside the ShadowClaw app itself using a
`type: "tools"` task chain — no LLM calls required:

```json
{
  "type": "tools",
  "tools": [
    {
      "name": "write_file",
      "input": {
        "path": "repos/my-site/pages/main/post.md",
        "content": "# Hello\n\nContent."
      }
    },
    {
      "name": "git_add",
      "input": { "repo": "my-site", "files": ["pages/main/post.md"] }
    },
    {
      "name": "git_commit",
      "input": { "repo": "my-site", "message": "publish: new post" }
    },
    { "name": "git_push", "input": { "repo": "my-site" } }
  ]
}
```

Pushing triggers the workflow, which builds and publishes the site automatically.
