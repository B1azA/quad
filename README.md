# Quad

![quad](https://github.com/B1azA/quad/blob/main/src-tauri/icons/icon.png?raw=true)

## Introduction

Quad is a simple program to create pixel art sprites and animations. Its main goal is to be simple, yet powerful and not overengineered. Quad was created using Rust, Tauri framework and TypeScript.

- Quad supports layers and animation frames.
- Export to PNG, GIF.
- Import PNG, JPG and automatically scale it.
- 18 different tools (Mirror, Bucket, Scissors, Primitive Shapes…)
- Undo/Redo actions.
- RGB, HSL, HEX colors

## Keybindings

![manual](https://github.com/B1azA/quad/blob/main/images/manual.png?raw=true)

## Compilation

You need to have **NPM** (https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and **rustup** (https://rustup.rs/) installed.

1. Choose Rust version and make it default.
   
```
rustup default stable
```

2. Clone the code, change directory.

```
git clone https://github.com/B1azA/quad
cd quad
```

3. Install npm packages.

```
npm install
```

4. Install all dependencies (https://tauri.app/v1/guides/getting-started/prerequisites/).

5. Build the app. The executable is located in "src-tauri/target/release".

```
npm run tauri build
```

6. If you want to start a local development server, run:

```
npm run tauri dev
```
