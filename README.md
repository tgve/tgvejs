[![Node CI](https://github.com/tgve/eAtlas/workflows/Node%20CI/badge.svg?branch=release)](https://github.com/tgve/tgve/actions?query=workflow%3A%22Node+CI%22) 
[![npm version](https://badge.fury.io/js/eatlas.svg)](https://badge.fury.io/js/eatlas)

This is a React Component ES Module that can be embedded in your React applications, as an Node.js package. For an example how to import the `eAtlas` package using `npm`, see the `tgve/app` repo. Following is a snippet of ReactJS from that repo:

``` javascript
import React from 'react';
import Eatlas from 'eatlas';

import './App.css';

function App() {
  return (
    <Eatlas defaultURL={process.env.REACT_APP_DEFAULT_URL}/>
  );
}
```

## Configuration settings

Currently these variables can be passed to the eAtlas app, each (except
objects) can be passed as an environment variable like
`REACT_APP_LAYER_NAME` or when using eAtlas as a component
`<Eatlas layerName="geojson">`. They can
also be passed to the TGVE as URL query parameters. For instance
`localhost:3000?dark=false`.

The exception is that `leftSidebarContent` cannot be passed as an
environment variable. For more on passing variables to a React app and
the prefix of `REACT_App_` please see React docs
[here](https://create-react-app.dev/docs/adding-custom-environment-variables).

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

-   `hideSidebar` boolean value which would hide the left sidebar.

None of the above is necessary and in the current release “Add data”
button will allow loading data into eAtlas.

## Running and testing

To run the front end only without need for the backend, having cloned
the `eAtlas` repo:

``` js
npm i # or yarn
# and run
npm start
```

The frontend is a
[`create-react-app`](https://create-react-app.dev/docs/getting-started/)
(CRA) so all the standard commands of CRA applies.

### Testing

The package follows `create-react-app` testing kits and uses mainly
`jest`. Run `npm run test`.
