# Web VideoMark Project

## Environment

- bash: any
- Node: 20+
- pnpm: latest

## Building the extension

```sh
git clone git@github.com:videomark/videomark.git
cd videomark
corepack enable pnpm
pnpm install
pnpm build
```

## Installing the extension

### Chrome

1. Open the 3-dot menu on the toolbar, select Extensions, then select Manage Extensions
1. Enable developer mode in the Extensions tab
1. Click “Load unpacked”
1. Select the `dist/production-chrome` directory under this project

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
1. Click “Load Temporary Add-on”
1. Select the `dist/production-firefox/manifest.json` file under this project

## Developing the extension

When you run `pnpm build:watch`, local changes to this project will automatically be built into `dist/production-*` in real time. You will need to refresh the page in the browser to see the changes. For some files, you will need to run `pnpm build` again to get them updated.
