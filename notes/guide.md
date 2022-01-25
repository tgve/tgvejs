Turing Geovisualization Engine
================

  - [Introduction](#introduction)
  - [npm package](#npm-package)
  - [Using GitHub pages](#using-github-pages)
  - [Using docker](#using-docker)
  - [Using R package](#using-r-package)
  - [Using npm](#using-npm)
  - [Outside the browser](#outside-the-browser)
  - [Showcases](#showcases)
  - [Roadmap](#roadmap)
  - [References](#references)

## Using docker

This is the method of using the full application. It means you can
update the data served and also add your own backend connections, data
workflows and more by leveraging the power of R langague.

It also means you would need some knowledge of R to be able to write
such data workflows. The
[`plumber`](https://github.com/rstudio/plumber/) package (now owned by
RStudio) is rather new and the stable release came out in
[Sep 2020](https://github.com/rstudio/plumber/releases/tag/v1.0.0). The
Dockerfile has gone through few versions and this should be expected as
underlying libraries change and grow.

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

## Outside the browser

Compiling JS applications to WebAssembly (Haas et al. 2017) is becoming
main stream and there are application which not only facilitate this but
also provide frameworks to run applications like the eAtlas on natively
bypassing browsers. One of these solutions is called Tauri (“What Is
Tauri? Tauri Studio” n.d.), the developers introduce it as “Tauri is a
toolkit that helps developers make applications for the major desktop
platforms - using virtually any frontend framework in existence.”

In our experience, running the application in WebAssembly provided at
least 3x performance boost over Firefox, Chrome and Safari. We were able
to load 3.5m crash points in a Tauri run eAtlas `v.1.0.0-beta.1` `dmg`
app on macOS Big Sur with 16GB RAM. `<TODO: add instructions to
reproduce this somehwere>`

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
# knitr::include_url("https://geospenser.com/index.html")
```

To see SPENSER visit: [www.geospenser.com](https://geospenser.com)

### SaferActive

`<get text from project>`

## Roadmap

Current version of the app has limited functionality. However, these are
the major functionality that the eAtlas is hoped to have:

  - Multiple layers: Currently adding data replaces what is already in
    the application.

  - Configuration settings: changes variety of settings in the app
    should be possible via `yml`, `env` or some other way. This can also
    be synced with browser cookies to make it easier for users/analysts.
    Currently in version `1.1.0-beta.0` of the npm package the
    application supports limited settings.

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

## References

<div id="refs" class="references hanging-indent">

<div id="ref-haas2017bringing">

Haas, Andreas, Andreas Rossberg, Derek L Schuff, Ben L Titzer, Michael
Holman, Dan Gohman, Luke Wagner, Alon Zakai, and JF Bastien. 2017.
“Bringing the Web up to Speed with Webassembly.” In *Proceedings of
the 38th Acm Sigplan Conference on Programming Language Design and
Implementation*, 185–200.

</div>

<div id="ref-tauri">

“What Is Tauri? Tauri Studio.” n.d. Accessed February 27, 2021.
<https://tauri.studio/en/docs/about/intro>.

</div>

</div>
