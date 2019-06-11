eAtlas
================

<img width="933" alt="Screenshot 2019-05-20 at 18 42 52" src="https://user-images.githubusercontent.com/408568/58041081-18b97f00-7b2f-11e9-941b-cea1b386d0bd.png">

Currently this is just a “WIP” as we explore and gather requirements of
the project. There are some
[notes](https://github.com/layik/eAtlas/blob/master/notes/project_planning.md)
to read.

This is a [geopumber](https://github.com/ATFutures/geoplumber) app. That
means it is an R powered backend API (think Flask in Python) and a
ReactJS front end.

To build, from an R console:

``` r
library(geoplumber)
gp_build()
```

and run

``` r
library(geoplumber)
gp_plumb()
```

visit `localhost:8000`

## deploy with docker

Repo contains Dockerfile for production.
