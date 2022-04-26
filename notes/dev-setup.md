# Setting up a development workflow for `tgvejs`

## Preliminaries

1. Clone the `tgvejs` and `app` repositories to your local machine. Install dependencies in each using `yarn install`.
2. In `tgvejs`:
 1. run `yarn link` to register local copy of `@tgve/tgvejs`. If you get a warning "There's already a package called '@tgve/tgvejs' registered", [you can probably ignore it](https://www.xolv.io/blog/dev-notes/dreaded-yarn-link-theres-already-a-package-called-x-registered/).
 2. Run at least one build (see below) to populate `dist`.
4. In `app`, run `yarn link @tgve/tgvejs` to symlink to local copy of `tgvejs`.

## Building and automated testing with tgvejs

1. `yarn dist` (`yarn watch`) will publish (automatically publish) changes to `dist`.
2. `yarn test` will start continuous testing. First, it will reinstall any missing `node_modules` (in particular `react` and `react-dom`, if they have been deleted by `yarn start` in `app`; see below).

## Running and testing via the app

1. `yarn start` will start a development server. First, it will purge `react` and `react-dom` (by deleting them from `node_modules`) in the locally linked `@tgve/tgvejs`, which will have them installed by default as dev dependencies. This avoids the [more than one copy of React in the same app](https://stackoverflow.com/questions/66488492/solve-having-more-than-one-copy-of-react-in-the-same-app) problem.

2. `yarn test` will asynchronously run `yarn start`, wait for the URL to become available, and then run the end-to-end (e2e) tests.
