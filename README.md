16 January, 2022

# TGVE · [![Node CI](https://github.com/tgve/eAtlas/workflows/Node%20CI/badge.svg?branch=release)](https://github.com/tgve/tgve/actions?query=workflow%3A%22Node+CI%22) [![npm version](https://badge.fury.io/js/eatlas.svg)](https://badge.fury.io/js/eatlas)

This is a React Component ES Module that can be embedded in your React
applications. This is an npm package output of TGVE (eAtlas) project.

Currently these variables can be passed to the eAtlas app, each (except
objects) can be passed as an environment variable like
`REACT_APP_LAYER_NAME` or when using eAtlas as a component
`<Eatlas layerName="geojson">`. As of version `1.3.5-beta.0`, they can
also be passed to the TGVE as URL query parameters. For instance
`localhost:3000?dark=false`.

The exception is that `leftSidebarContent` cannot be passed as an
environment variable. For more on passing variables to a React app and
the prefix of `REACT_App_` please see React docs
[here](https://create-react-app.dev/docs/adding-custom-environment-variables).

## TGVE in React apps

See the [guide](https://github.com/tgve/eAtlas/wiki/Using-TGVE) for
more details but you can use a template
([`tgve/app`](https://github.com/tgve/app)) repo for
various purposes including publish your data using eAtlas.


## Testing

The package follows `create-react-app` testing kits and uses mainly
`jest`. Run `npm run test`.
