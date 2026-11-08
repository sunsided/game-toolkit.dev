# game-toolkit.dev

The website of [game-toolkit](https://github.com/sunsided/game-toolkit) and its add-ons
(platformer, dosvideo, dosaudio): a prerendered SvelteKit site with the crates'
examples playable in the browser, built from pinned releases.

## Running it

Node 26 (`.nvmrc`) with Corepack, [Task](https://taskfile.dev), and for the demos Rust with
the `wasm32-unknown-unknown` target.

```sh
task dev        # checkouts + images, then the dev server (demos only if built)
task demos      # build every demo into static/demos/ (slow once; cached by commit)
task build      # the whole site into build/, every demo required
task ci         # lint, type check, tests, build
task lint:actions  # actionlint + zizmor over .github/
```

## How it fits together

- **`src/lib/registry.ts`** is the one source of truth: each crate's copy, its colour, the
  release it is pinned to (tag and commit), and the demos built from it. Pages read it;
  `scripts/demos.ts` builds from it; `test/registry.test.ts` holds its invariants.
- **`scripts/demos.ts`** fetches each pinned commit into `.cache/src/` (and checks it is that
  commit), copies the registry's images into `static/media/`, and builds each demo:
  `cargo build --release --target wasm32-unknown-unknown` of one binary or example,
  `wasm-bindgen --target web` at the version in that repository's `Cargo.lock` (installed
  into `.cache/tools/` when missing), the asset folder, and a page of our own that gives it a
  canvas. Finished demos are cached in `.cache/demos/`, keyed by commit and build settings.
- **Games made with the toolkit** (Cheesed!, Cookie D'oh!) are `release` demos instead: the
  web zip attached to their GitHub release, pinned by SHA-256 and checked against the
  repository's build-provenance attestation (`gh attestation verify`, required in CI), with
  unsafe zip entries refused. Their posters are read from the repository at the tag, pinned
  by SHA-256 too. Bump one by changing `tag`, `asset` and `sha256` together.
- **Demos run in an iframe** on their own page (`static/demos/<slug>/index.html`), loaded
  only on Run, one at a time: a demo's globals, panics, GPU context and audio stay its own,
  and Stop frees all of it. The page reports `running` / `error` back via `postMessage`.
- **Design**: tokens in `src/lib/design/tokens.css` (primitives, then semantic names that
  components use), components in `src/lib/components/{atoms,molecules,organisms}`. Each
  crate's `accent` becomes `--accent` on whatever belongs to it. Code is highlighted at
  prerender by Shiki (server loads only) with colours from the `--shiki-*` tokens.

## Bumping a crate

Set `pin.tag` and `pin.commit` in `src/lib/registry.ts` (`git rev-list -n1 <tag>`), check
the copy still holds, `task ci`. A demo that does not build fails the build.

## Deploying

Every push to `main` runs `task ci` and publishes `build/` to GitHub Pages
(`.github/workflows/deploy.yml`). One-time setup: Settings → Pages → Source: GitHub Actions,
custom domain `game-toolkit.dev` (also in `static/CNAME`), DNS pointing at GitHub Pages.
Pull requests run the same checks in `ci.yml`; `actions-lint.yml` lints the workflows.
