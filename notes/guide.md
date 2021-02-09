# Title

1. [Introduction](#introduction)
2. [Using GitHub pages](#Using-GitHub-pages)
3. [Using docker](#Using-docker)
4. [Using R package](#Using-R-package)
5. [Using npm](#Using-npm)
6. [Showcases](#Showcases)
7. [Roadmap](#Roadmap)

## Introduction
Turing Geovisualization Engine (TGVe or eAtlas for short) is a decoupled JavaScript and R application that can be used as a complete server-client application or just as a front-end stand-alone application. This document outlines the different ways to use the eAtlas.

The TGVE  is a web based interactive visual analytics tool built on modern web stack of technology. The visual views and interaction mechanisms designed into the tool is underpinned by empirically-informed guidelines around visual perception from cognitive science and the information visualization domain. Additionally, techniques from geographic information science (GIScience) and related domains is used to implement techniques for automatic aggregation of temporal and spatial data. 

For the technical overview of the project please refer to X.

## Using GitHub pages

## Using docker

## Using R package

## Using npm

## Showcases 

### SPENSER

### SaferActive

## Roadmap

Current version of the app has limited functionality. However, these are the major funcitonality that the eAtlas is hoped to have:

* Multiple layers: Currently adding data replaces what is already in the application.

* Configuration settings: changes variety of settings in the app should be possible via `yml`, `env` or some other way. This can also be sync'ed with browser cookies to make it easier for users/analysts. Currently in version 0.21 of the npm package the application supports limited settings, allows `defaultURL` to run the application.

* Smarter filting: currently the filtering relies on matching key-value pairs, this can be extended to ranges and more. One other area of filtering is spatial filtering. The required packages/libraries are there and there is already a basic example of filtering "lines" implemented.

* Basic data wrangling: one of the showcases "hard-coded" in the application does a simple conversion of seconds to minutes column to generate meaningful isochrones.

* Reconsider `geojson` as the central data format of the application.