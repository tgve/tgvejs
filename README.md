[![Node CI](https://github.com/tgve/eAtlas/workflows/Node%20CI/badge.svg?branch=release)](https://github.com/tgve/tgve/actions?query=workflow%3A%22Node+CI%22) 
[![npm version](https://badge.fury.io/js/eatlas.svg)](https://badge.fury.io/js/eatlas)

The Turing Geovisualisation Engine (TGVE or eAtlas) is a web-based,
interactive visual analytics tool for geospatial data analysis, built
using R and JavaScript/React, that can be used as a complete
server-client application or just as a front-end stand-alone
application. The visual views and interaction mechanisms designed
into the tool is underpinned by empirically-informed guidelines around
visualization design and techniques from Geographic Information Science
(GIScience). Additionally, techniques from geographic information science (GIScience) and related domains are used
to implement automatic aggregation of temporal and
spatial data.

<img width=70% alt="eAtlas screen shot" src="https://user-images.githubusercontent.com/408568/76419738-c46edc80-6398-11ea-8bbe-496394f90adc.png">

## Key components

| Component | Repo |
| ---- | ---- |
| Node.js package | [tgve/eAtlas](https://github.com/tgve/eAtlas) |
| R package | [tgve/tgver](https://github.com/tgve/tgver) |
| Application template | [tgve/app](https://github.com/tgve/app) |
| Full-stack application template | [tgve/full-app](https://github.com/tgve/full-app) |

TGVE can also be used from [Python](https://github.com/tgve/app/blob/main/docs/python-flask.md).

## Example applications

As researchers at the University of Leeds, we have vast amount of data
which require scalable solutions such as the eAtlas. One of these is
SPENSER. To dive into the dataset read this short blogpost [here](https://layik.github.io/spenser).

### SPENSER

The application is served from an 8GB Ubuntu server from Germany on
hosting company Hetzner’s datacenter. The deployment is all done in
Docker and any chance in data can be fully automated.

``` r
# knitr::include_url("https://geospenser.com/index.html")
```

To see SPENSER visit: [www.geospenser.com](https://geospenser.com)

### SaferActive

See [SaferActive home page](https://saferactive.github.io/).

## Node.js package

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

### Configuration settings

eAtlas supports separately-provided geography (in GeoJSON) and point data sources (in CSV). Other formats are not supported.

The following parameters can be passed to the eAtlas app, each (except
objects) can be passed as an environment variable like
`REACT_APP_LAYER_NAME` or when using eAtlas as a component
`<Eatlas layerName="geojson">`. The mapping between parameters names and the corresponding REACT_APP environment variables is not entirely consistent; see [here](https://github.com/tgve/eAtlas/blob/release/src/utils/api.js) for the mapping, and note that `leftSidebarContent` cannot be passed as an
environment variable. For more on passing variables to a React app and
the `REACT_APP_` prefix please see [React docs](https://create-react-app.dev/docs/adding-custom-environment-variables).

They can also be passed to the TGVE as URL query parameters. For instance
`localhost:3000?dark=false`.

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

### Testing

The package follows `create-react-app` testing kits and uses mainly
`jest`. Run `npm run test`.

## External dependenices
The package relies on Plotly to be available as `window.Plotly`. You can satisify this dependency by adding Pltly in your HTML build where the package is used. For instance version `2.6.3` minifed:

```html
<script src="https://cdn.plot.ly/plotly-2.6.3.min.js"></script>
```
If you are not sure, please see the [`app`](https://github.com/tgve/app) repository.


## Roadmap

The current version of the app has limited functionality. However, these are
on the horizon:

  - Multiple layers: Currently adding data replaces what is already in
    the application.

  - Smarter filtering: currently the filtering relies on matching
    key-value pairs, this can be extended to ranges and more. One other
    area of filtering is spatial filtering. The required
    packages/libraries are there and there is already a basic example of
    filtering “lines” implemented.

  - Basic data wrangling: one of the showcases “hard-coded” in the
    application does a simple conversion of seconds to minutes column to
    generate meaningful
    [isochrones](https://en.wikipedia.org/wiki/Isochrone_map).

  - Reconsider `geojson` as the central data format of the application
    and how buffer (unit arrays) can boost performance of eAtlas.

  - More configuration options, for disabling the sidebar, defining sidebar contents, and customizing the default visualizations.

## Contributing
See the TGVE [Contributor Code of Conduct](https://github.com/tgve/tgver/blob/master/CODE_OF_CONDUCT.md).

## Package Status

This package is part of ongoing research at the University of Leeds, is provided “as is” and is likely to be changed without
warning to meet the research needs of the University.

## Funding

The project is led by Dr [Nik
Lomax](https://environment.leeds.ac.uk/geography/staff/1064/dr-nik-lomax)
and Dr [Roger
Beecham](https://environment.leeds.ac.uk/geography/staff/1003/dr-roger-beecham)
and funded by the EPSRC via The Alan Turing Institute's AI for Science and
Government Programme, grant number EP/T001569/1.
