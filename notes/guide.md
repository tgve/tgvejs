Turing Geovisualization Engine
================

  - [Introduction](#introduction)
  - [Using GitHub pages](#using-github-pages)
  - [Using docker](#using-docker)
  - [Using R package](#using-r-package)
  - [Using npm](#using-npm)
  - [Showcases](#showcases)
  - [Roadmap](#roadmap)

## Introduction

Turing Geovisualization Engine (TGVe or eAtlas for short) is a decoupled
JavaScript and R application that can be used as a complete
server-client application or just as a front-end stand-alone
application. This document outlines the different ways to use the
eAtlas.

The TGVE is a web based interactive visual analytics tool built on
modern web stack of technology. The visual views and interaction
mechanisms designed into the tool is underpinned by empirically-informed
guidelines around visual perception from cognitive science and the
information visualization domain. Additionally, techniques from
geographic information science (GIScience) and related domains is used
to implement tech

Current version of the eAtlas does not provide much customisation out of
the box. However, it is in the planned work to provide configurations
using easy to use techqniues. See [Roadmap](#Roadmap) section for
details.

## Using GitHub pages

1.  Create repo from this [template](https://github.com/layik/eatlas-template):

    <img width="100%" style="border:1px solid" alt="create repo from template" src="https://user-images.githubusercontent.com/408568/109291248-a8ba4b80-7820-11eb-9054-5b8fb6f38f82.png">

2.  Edit the data URL in gh-pages.yml with
    [URL](https://github.com/layik/eatlas-template/blob/main/.github/workflows/gh-pages.yml#L34)
    of your dataset. So replace
    `https://raw.githubusercontent.com/layik/eatlas-data/main/casualties.csv`
    with your data URL.

3.  Once first actions build is finished, a `gh-actions` is built,
    enable gh-pages by assigning branch `gh-pages` and `root` as the
    directorry as shown below:
    <img width="100%" style="border:1px solid" alt="setup github pages" src="https://user-images.githubusercontent.com/408568/109220743-39f1d980-77b1-11eb-9bd0-4b5e183854d5.png">

What did we do? The repo you setup has a branch called `gh-pages` which
github uses to serve. The “actions” in the template generates a
production ready app which pulls data from the link added in step (2).
The following screenshot shows a repo with owner “layik” and repository
name “eAtlas”. Your new instance will replace these two values with your
repository obtained from GitHub APIs.

Examples of how this is done is the `eAtlas` repo itself, a project
called SaferActive web app part of research carried out at ITS,
University of Leeds and the template repo as well.

<img width="100%" alt="guide-shot" src="https://user-images.githubusercontent.com/408568/108049506-44d59d00-7040-11eb-9f4e-0a083829bfa5.png">

## Using docker

This is the method of using the full application. It means you can
update the data served and also add your own backend connections, data
workflows and more by leveraging the power of R langague.

It also means you would need some knowledge of R to be able to write
such data workflows. The `plumber` package (now owned by RStudio) is
rather new and the stable release came out in 2020. The Dockerfile has
gone through few versions and this should be expected as underlying
libraries change and grow.

Currently the ready to use (with default dataset) images are hosted at.

## Using R package

The application is a fully decoupled R + JavaScript two tier application
which is built on top RStudio’s plumber APIs using an R package called
`geoplumber` which is not yet on CRAN. This means in future the R
backend can also be replaced with other choices of backend such as
Python or NodeJS.

Once the dependencies of `geoplumber` and particularly the NodeJS system
dependenices are all in place. An example of visualizing R’s `sf` object
format in `geoplumber` using eAtlas is as simple as following lines:

``` r
# installing the R package from github requires 
# R package devtools
devtools::install_github("ATFutures/geoplumber")
# load the libray
library(geoplumber)
# create new project at temporary directory called `reprex`
p = file.path(tempdir(),"reprex")
gp_create(p)
# making it the working directory
setwd(p)
# build the application (front-end)
gp_build()
# gp_explore uses eAtlas by default
gp_explore()
```

In RStudio you should now be able to see something like following
screenshot:
<img width="100%" alt="RStuio viewer showing eAtlas" src="https://user-images.githubusercontent.com/408568/81685038-9452c100-944f-11ea-946c-795ef70791b3.png">

## Using npm

For an example how to import eAtlas npm package checkout the
[`eatlas-template`](https://github.com/layik/eatlas-template) repo
mentioned above. Following is a snipped of ReactJS from the
`eatlas-template` repo:

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

## Showcases

As researchers at the University of Leeds, we have vast amount of data
which require scalable solutions such as the eAtlas. One of these is
SPENSER `<NIK's help would be great here>`. To dive into the dataset
read this short blogpost [here](https://layik.github.io/spenser).

### SPENSER

The application is served from an 8GB Ubuntu server from Germany on
hosting company Hetzner’s datacenter. The deployment is all done in
Docker and any chance in data can be fully automated.

``` r
knitr::include_url("https://layik.github.com/eAtlas")
```

[![](guide_files/figure-gfm/unnamed-chunk-3-1.png)](https://layik.github.com/eAtlas)<!-- -->

To see SPENSER visit: www.geospenser.com

### SaferActive

`<get text from project>`

## Roadmap

Current version of the app has limited functionality. However, these are
the major funcitonality that the eAtlas is hoped to have:

  - Multiple layers: Currently adding data replaces what is already in
    the application.

  - Configuration settings: changes variety of settings in the app
    should be possible via `yml`, `env` or some other way. This can also
    be sync’ed with browser cookies to make it easier for
    users/analysts. Currently in version 0.21 of the npm package the
    application supports limited settings, allows `defaultURL` to run
    the application.

  - Smarter filting: currently the filtering relies on matching
    key-value pairs, this can be extended to ranges and more. One other
    area of filtering is spatial filtering. The required
    packages/libraries are there and there is already a basic example of
    filtering “lines” implemented.

  - Basic data wrangling: one of the showcases “hard-coded” in the
    application does a simple conversion of seconds to minutes column to
    generate meaningful isochrones.

  - Reconsider `geojson` as the central data format of the application.
