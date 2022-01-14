
# eAtlas · [![Node CI](https://github.com/layik/eAtlas/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/layik/eAtlas/actions?query=workflow%3A%22Node+CI%22) [![Publish Docker image](https://github.com/layik/eAtlas/actions/workflows/docker.yml/badge.svg)](https://github.com/layik/eAtlas/actions/workflows/docker.yml) [![npm version](https://badge.fury.io/js/eatlas.svg)](https://badge.fury.io/js/eatlas)

> Given the latest developments of the TGVE project, please refer to the `npm` branch and the Wiki entries. This README and `master` branch will go through some chnages soon.

The Turing Geovisualisation Engine (TGVE or eAtlas) is a web-based,
interactive visual analytics tool for geospatial data analysis, built
using R & React. The visual views and interaction mechanisms designed
into the tool is underpinned by empirically-informed guidelines around
visualization design and techniques from Geographic Information Science
(GIScience).

## Using eAtlas

Current documentation is based on Wiki entries in this repository. There
are two template repositories within the `tgve` organisation here on
GitHub: `eatlas-template` and `full-template`. The former is setup so
that data scientists and developers can deploy their own instances
easily and self-contained on GitHub using GitHub pages and actions. The
latter, is a full stack example using R (Plumber), Python (Flask) and
NodeJS (ExpressJS) as backends. Please refer to each respository’s
README file for more.

### npm package

Current release is in beta for testing of the limited functionality and
API offered by the codebase. The package is released under the same name
“eatlas”: <https://www.npmjs.com/package/eatlas>

### Github Template repo

Please see the [Wiki
entry](https://github.com/layik/eAtlas/wiki/Using-TGVE) for details of
how to host your own eAtlas using Github Pages.

### Development

To run the front end only without needs for the backend, having cloned
the repo:

``` js
npm i # or yarn
# and run
npm start
```

The frontend is a
[`create-react-app`](https://create-react-app.dev/docs/getting-started/)
(CRA) so all the standard commands of CRA apply.

### R

The whole application is a
[geoplumber](https://github.com/ATFutures/geoplumber) app, so follow the instructions to install that library. That means it
is an R powered backend API (think Flask in Python) and a ReactJS front
end.

To build the frontend, from the R console (with the eAtlas folder as working directory):

``` r
library(geoplumber)
geoplumber::gp_build()
```

To run the app using `geoplumber`, the front-end is built using
`geoplumber` and therefore:

-   (optional) TGVE will be looking for a Mapbox API key, having
    obtained a Mapbox API key in `.env.local` file using variable name:
    `REACT_APP_MAPBOX_ACCESS_TOKEN = 'API_KEY'`. This is based on
    `react-map-gl` dependency, please see this
    [documentation](https://github.com/visgl/react-map-gl/blob/master/docs/get-started/mapbox-tokens.md)
    for more.

-   change the `PRD_URL` in the `Constants.js` file to `localhost:8000`.
    Default value is `https://layik.github.io/eAtlas` for this repo to
    publish on GitHub pages.

Then you can run

``` r
library(geoplumber)
geoplumber::gp_plumb()
```

visit `localhost:8000`

### Docker for production

Repo contains Dockerfile for production. Again remember to change the
production URL.

``` sh
# Dockerfile manages your npm/React build steps
# REACT_APP_MAPBOX_ACCESS_TOKEN is required but app should run
docker build -t eatlas .
# then bind plumber's default 8000 port to any of your choice
docker run -d -p 8000:8001 --name eatlas eatlas
```

Use your favourite document server (nginx for example) to proxy requests
(watch out for a Wiki entry on this).

## Notes

This README is valid for beta (`1.0.x-beta.x`) releases and updated with
changes.

There are some
[notes](https://github.com/layik/eAtlas/blob/master/notes/project_planning.md)
to read. These are thoughts and background reading material as we take
steps towards understanding what an “interdependent” eAtlas might be.
Would it be “Turing Geovisualization Engine”?

## Funding

The project is led by Dr [Nik
Lomax](https://environment.leeds.ac.uk/geography/staff/1064/dr-nik-lomax)
and Dr [Roger
Beecham](https://environment.leeds.ac.uk/geography/staff/1003/dr-roger-beecham)
and funded by the EPSRC via the Alan Turing Institute AI for Science and
Government Programme, Grant/Award Number: EP/T001569/1.

### Screenshots

<img width="100%" alt="eAtlas screen shot" src="https://user-images.githubusercontent.com/408568/118050552-63b1aa00-b377-11eb-9aa6-8b9f5bef9e13.png">

<!-- build this Rmd with: R -e "rmarkdown::render('README.Rmd')" -->
