[![Node CI](https://github.com/tgve/tgvejs/workflows/Node%20CI/badge.svg?branch=release)](https://github.com/tgve/tgve/actions?query=workflow%3A%22Node+CI%22)
[![npm version](https://badge.fury.io/js/@tgve%2Ftgvejs.svg)](https://badge.fury.io/js/@tgve%2Ftgvejs)

The Turing Geovisualisation Engine (TGVE) is a web-based,
interactive visual analytics tool for geospatial data analysis, built using R and JavaScript/React, that can be used as a complete server-client application or just as a front-end stand-alone application. The visual views and interaction mechanisms designed into the tool is underpinned by empirically-informed guidelines around
visualization design and techniques from Geographic Information Science (GIScience). Additionally, techniques from geographic information science (GIScience) and related domains are used
to implement automatic aggregation of temporal and
spatial data.

<img width=90% alt="TGVE screen shot" src="https://user-images.githubusercontent.com/408568/76419738-c46edc80-6398-11ea-8bbe-496394f90adc.png">


## npm package

> note: the older versions released under https://www.npmjs.com/package/eatlas is deprecated.

This is a React Component ES Module that can be embedded in your React applications. For an example how to import the TGVE package using `npm`, see the [`tgve/app`](https://github.com/tgve/app) repo. Following is a snippet of ReactJS from that repo:

``` javascript
import React from 'react';
import Tgve from '@tgve/tgvejs';

function App() {
  return (
    <Tgve defaultURL={process.env.REACT_APP_DEFAULT_URL}/>
  );
}
```

### Configuration settings

TGVE supports separately-provided geography (in GeoJSON) and point data sources (in CSV). Other formats are not supported.

The following parameters can be passed to the TGVE app, each (except
objects) can be passed as an environment variable like
`REACT_APP_LAYER_NAME` or when using TGVE as a component
`<Eatlas layerName="geojson">`. The mapping between parameters names and the corresponding REACT_APP environment variables is not entirely consistent; see [here](https://github.com/tgve/tgvejs/blob/release/src/utils/api.js) for the mapping, and note that `leftSidebarContent` cannot be passed as an
environment variable. For more on passing variables to a React app and
the `REACT_APP_` prefix please see [React docs](https://create-react-app.dev/docs/adding-custom-environment-variables).

They can also be passed to the TGVE as URL query parameters. For instance
`localhost:3000?dark=false`.

-   `data`: valid geojson object. If a valid GeoJSON object is provided
    both `defaultURL` and `geographyURL` will be ignored, which also
    means `geographyColumn` would be ignored, too.

-   `defaultURL`: which returns a valid geojson object when `fetched`.
    It can be used to fetch CSVs which is converted to `geojson` by
    TGVE after fetching.

-   `geographyURL`: which returns a valid `geojson` dataset. If this
    variable is provided, data is fetched separately along with
    `defaultURL`, TGVE uses the `geographyColumn` to join them. TGVE
    does this on initialization and when `reset` button is pressed.

-   `geographyColumn`: a column name which is shared between data within
    the `defaultURL` and `geographyURL` or a mapping between the two. If
    a mapping is provided it must be in this format:
    `defaultURLColumnName:geographyURLColumnName`. This is the joining
    column that will result in dynamically generating `geojson` data for
    TGVE to consume. If a valid column name is not provided TGVE will
    fail to load any data to the given geography.

-   `column`: if provided, and if the geometry is of particular type
    which would need a column, it would be used. Defaults on to the
    second column as often first column is an ID of sort.

-   `layerName`: if provided, and if the given name is in the list of
    DeckGL layers supported by TGVE, will be passed to generate the
    layer with the name given.

-   `dark`: by default `baseui/baseweb` is set to dark, you can change
    the theme to other (e.g. light)

-   `leftSidebarContent`: is based on React standard children. This is
    where users can add their own UI and more, though this requires
    competent React concepts. A simple use would be to pass plain text
    description of data/project etc.

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

## External dependenices
The package relies on Plotly to be available as `window.Plotly`. You can satisify this dependency by adding Plotly in your HTML build where the package is used. For instance version `2.6.3` minifed:

```html
<script src="https://cdn.plot.ly/plotly-2.6.3.min.js"></script>
```
If you are not sure, please see the [`app`](https://github.com/tgve/app) repository.


### Testing

The package follows `create-react-app` testing kits and uses mainly
`jest`. Run `npm run test`.

## Contributing
See the TGVE [Contributor Code of Conduct](https://github.com/tgve/tgver/blob/master/CODE_OF_CONDUCT.md).

## Package Status

This package is part of ongoing research at the University of Leeds, is provided “as is” and is likely to be changed without warning to meet the research needs of the University.

## Funding

The project is led by Dr [Nik
Lomax](https://environment.leeds.ac.uk/geography/staff/1064/dr-nik-lomax)
and Dr [Roger
Beecham](https://environment.leeds.ac.uk/geography/staff/1003/dr-roger-beecham)
and funded by the EPSRC via The Alan Turing Institute's AI for Science and
Government Programme, grant number EP/T001569/1.
