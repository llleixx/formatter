# formatter

Website built using [autocorrect](https://github.com/huacnlee/autocorrect) for text formatting.

## Development

Use Node.js 24 LTS (see `.node-version`) and pnpm 10.34.6 (pinned in `package.json`).
Vite requires Node.js 22.12 or newer.

```sh
npm install --global pnpm@10.34.6
pnpm install --frozen-lockfile
pnpm dev
```

## Checks

```sh
pnpm audit
pnpm build
pnpm exec playwright install chromium firefox webkit
pnpm test
```

The browser tests run against the production build and cover WebAssembly loading,
all supported formats, pasting over a selection, dark mode, and failed or delayed
WebAssembly requests. On Linux, use `playwright install --with-deps` to install
browser system dependencies as well.

Tailwind CSS 4 uses the Vite integration and CSS-based configuration in
`src/style.css`. The `dark` variant follows the root element's class, so the
manual theme toggle works independently of the system preference. The build
uses ES2022, including native top-level await for WebAssembly initialization;
use modern browsers compatible with Tailwind CSS 4.

## Deployment and dependency maintenance

Pull requests run a frozen dependency install, a security audit, a production
build, and browser tests. Successful builds on `main` deploy `dist` to GitHub
Pages. Deployment permissions are restricted to the deploy job.

Dependabot checks npm dependencies and GitHub Actions weekly. Vue and Tailwind
packages are grouped with their integrations to reduce incompatible updates.
Commit both `package.json` and `pnpm-lock.yaml` when upgrading dependencies,
and run the checks above before merging. The project uses the official npm
registry so security auditing is available even when a local default registry
is a mirror.
