# Developer notes

To set up a development workflow for `tgvejs`:

1. clone the `tgvejs` and `app` repositories to your local machine
2. in `tgvejs`, run `yarn link` to register local copy of `@tgve/tgvejs`
3. in `app`, run `yarn link @tgve/tgvejs` to symlink to local copy
4. in `jgvejs`, start `yarn watch` to automatically publish changes to `dist`
5. in `app`, run `yarn start` to start a development server

## WIP

- `yarn add npm-link-shared --dev`
- `yarn npm-link-shared ./node_modules/@tgve/tgvejs/node_modules . react react-dom`
