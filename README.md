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
4. Optionally edit `pages/routes.json` to add pretty-path URLs.
5. Push to `main` — the workflow builds and deploys automatically.

## Directory layout

```
pages/
  main/
    index.md          ← your home page
    ~/content/
      about.md        ← any other pages
  routes.json         ← optional pretty-path configuration
.github/
  workflows/
    deploy-pages.yml  ← the build + deploy workflow (no changes needed)
```

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
> unreachable as a pretty path. Use a safe namespace like `/main/`, `/blog/`,
> `/docs/`, or any other prefix that doesn't conflict with the above list.

## Default Pinned Page (`/`)

When a visitor loads the root URL (`/`) of your published site, ShadowClaw automatically displays the **default pinned page**.

### How ShadowClaw selects the default page for `/`:

1. Both the static site build pipeline (`prerender-dsd-shell`) and runtime page store (`orchestratorStore`) collect all files in `pages/main/`.
2. `MEMORY.md` is always sorted to the bottom of the list.
3. All other pages are sorted in **reverse alphabetical order** (case-insensitive, Z to A).
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
