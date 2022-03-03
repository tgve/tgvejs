# Developer notes

To set up a development workflow for `tgvejs`:

## Preliminaries

1. clone the `tgvejs` and `app` repositories to your local machine
2. in `tgvejs`, run `yarn link` to register local copy of `@tgve/tgvejs`
3. in `app`, run `yarn link @tgve/tgvejs` to symlink to local copy

## Building and testing tgvejs

1. `yarn watch` will automatically publish changes to `dist`
2. `yarn test` will start a continuous testing process. It will also reinstall any missing `node_modules` (in particular `react` and `react-dom`, if they have been deleted by `yarn start` in `app`; see below)

## Running via the app

1. `yarn start` will start a development server. It will also purge the dev installations of `react` or `react-dom` (by deleting them from `node_modules`) in the locally linked `@tgve/tgvejs`. This avoids the [more than one copy of React in the same app](https://stackoverflow.com/questions/66488492/solve-having-more-than-one-copy-of-react-in-the-same-app) problem.
