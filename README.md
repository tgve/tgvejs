02 December, 2021

# TGVE · [![Node CI](https://github.com/tgve/eAtlas/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/tgve/tgve/actions?query=workflow%3A%22Node+CI%22) [![npm version](https://badge.fury.io/js/eatlas.svg)](https://badge.fury.io/js/eatlas)

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

As of version `1.3.4-beta.1` these API variables can be passed to TGVE:

-   `data`: valid geojson object. If a valid GeoJSON object is provided
    both `defaultURL` and `geographyURL` will be ignored, which also
    means `geographyColumn` would be ignored, too.

-   `defaultURL`: which returns a valid geojson object when `fetched`.
    It can be used to fetch CSVs which is converted to `geojson` by
    eAtlas after fetching.

-   `geographyURL`: which returns a valid `geojson` dataset. If this
    variable is provided, data is fetched separately along with
    `defaultURL`, eAtlas uses the `geographyColumn` to join them. eAtlas
    does this oth on initialization and when `reset` button is pressed.

-   `geographyColumn`: a column name which is shared between data within
    the `defaultURL` and `geographyURL` or a mapping between the two. If
    a mapping is provided it must be in this format:
    `defaultURLColumnName:geographyURLColumnName`. This is the joining
    column that will result in dynamically generating `geojson` data for
    eAtlas to consume. If a valid column name is not provided TGVE will
    fail to load any data to the given geography.

-   `column`: if provided, and if the geometry is of particular type
    which would need a column, it would be used. Defaults on to the
    second column as often first column is an ID of sort.

-   `layerName`: if provided, and if the given name is in the list of
    DeckGL layers supported by eAtlas, will be passed to generate the
    layer with the name given.

-   `dark`: by default `baseui/baseweb` is set to dark, you can change
    the theme to other (e.g. light)

-   `leftSidebarContent`: is based on React standard children. This is
    where users can add their own UI and more, though this requires
    competent React concepts. A simple use would be to pass plain text
    description of data/project etc. Please see TGVE documentations.

-   `viewport`: TGVE’s main functionality is to auto-adjust the viewport
    (see DeckGL docs). However, the initial viewport can be set using
    this JSON parameter. The default values are:
    `{longitude: -1.6362, latitude: 53.8321, zoom: 10, pitch: 55, bearing: 0}`.
    If any of these are missing, they will be populated from these
    default values.

-   `hideChartGenerator` boolean value which would hide the sidebar
    component which generates charts from the data.

-   `hideCharts` boolean value which would hide all charts. This takes
    priority over `hideChartGenerator` parameter.

None of the above is necessary and in the current release “Add data”
button will allow loading data into eAtlas.

See the main repo for more about the project.

## Using github pages

See the main [repo
guide](https://github.com/tgve/eAtlas/blob/master/notes/guide.md) for
more details but you can use a template
([`tgve/eatlas-template`](https://github.com/tgve/eatlas-template)) repo
to publish your data using eAtlas.

## Development

See the main repo for more details but the package is a fork from a
`create-react-app` boilerplate.

## Tests

The package follows `create-react-app` testing kits and uses mainly
`jest`. Run `npm run test`.

## Change log

-   `1.3.5-beta.0`
    -   The TGVE now accepts the API variables as URL query parameters.
-   `1.3.4.beta.4`
    -   Minor issues and post tgver package Tests
    -   Path layer API in
-   `1.3.4.beta.0`
    -   API value `hideChartGenerator` is one of the few from the wider
        and potentially `hideSidebar`.
    -   Added basic version of “screenshot” or save. The future plan for
        this is a full analytic report (PDF) generation.
    -   Minor fixes and changes
-   `1.3.3-beta.0`
    -   More APIs as TGVE is in showcase driven development.
    -   Added `viewport` API JSON variable.
-   `1.3.2-beta.0`
    -   Better history management and respects host paths.
-   `1.3.1-beta.0`
    -   Preparing to remove the `beta` tag.
    -   TGVE has now been migrated to its organisation on github.com
    -   Added two new API variables (`dark`, `leftSidebarContent`)
    -   Lots of improvements and minor fixes
-   `1.3.0-beta.2`
    -   Minor fix for initial analysis of data column name.
-   `1.1.0-beta.0`
    -   support for separating data from geography.
    -   minor improvements elsewhere
