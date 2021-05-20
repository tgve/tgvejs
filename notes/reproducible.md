Reproducibility
================

As documented elsewhere, TGVE is a `geoplumber` application and
therefore there is a particular directory structure to it. That is R at
the backend based on `plumber` APIs and fronted being a CRA app.

This document shows how TGVE is a fully reproducible using R code. This
markdown document itself is prodcued using Rmarkdown companion document.

``` r
# we need goeplumber
# & curl
library(geoplumber)
library(RCurl)
message("geoplumber v: ", packageVersion("geoplumber"))
```

    ## geoplumber v: 0.1

``` r
# create a geoplumber test app
d <- file.path(tempdir(), "gp")
gp_create(d)
```

    ## Creating directory: /var/folders/z7/l4z5fwqs2ksfv22ghh2n9smh0000gp/T//Rtmp5iVjyL/gp

    ## To build/run app, set working directory to: /var/folders/z7/l4z5fwqs2ksfv22ghh2n9smh0000gp/T//Rtmp5iVjyL/gp

    ## Standard output from create-react-app works.
    ## You can run gp_ functions from directory: /var/folders/z7/l4z5fwqs2ksfv22ghh2n9smh0000gp/T//Rtmp5iVjyL/gp
    ## To build the front end run: gp_build()
    ## To run the geoplumber app: gp_plumb()
    ## Happy coding.

``` r
od <- setwd(d)
stopifnot(gp_is_wd_geoplumber())

# download some data
download.file("https://github.com/saferactive/saferactive/releases/download/0.1/london_junction_point_cas.geojson",
              destfile = "london.geojson")
# pass it to geoplumber's `gp_explore` as an sf object
ps <- gp_explore(sf = sf::st_read("london.geojson"), build = F)
```

    ## WARNING:
    ## Looks like geoplumber was not built, serveing API only.
    ## To serve the front end run gp_build() first.

    ## Reading layer `london_junction_point_cas' from data source `/private/var/folders/z7/l4z5fwqs2ksfv22ghh2n9smh0000gp/T/Rtmp5iVjyL/gp/london.geojson' using driver `GeoJSON'
    ## Simple feature collection with 34071 features and 2 fields
    ## geometry type:  POINT
    ## dimension:      XY
    ## bbox:           xmin: -0.5102564 ymin: 51.29286 xmax: 0.2865577 ymax: 51.68608
    ## geographic CRS: WGS 84

    ## Serving data at http://localhost:8000/api/explore

``` r
# wait for plumber to start
Sys.sleep(2)
ps
```

    ## PROCESS 'R', running, pid 6584.

``` r
# is the API endpoint serving?
gpExploreURL <- "http://localhost:8000/api/explore"
webpage <- getURL(gpExploreURL)
webpage <- readLines(tc <- textConnection(webpage)); close(tc)
# expercting start of geojson object
substr(tail(webpage)[1],start = 1, stop=50)
```

    ## [1] "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"F"

``` r
# navigate to the build (not built)
gpURL <- "http://localhost:8000/"
webpage <- getURL(gpURL)
webpage <- readLines(tc <- textConnection(webpage)); close(tc)
tail(webpage)
```

    ## [1] "    <p>build missing</p>" "  </div>"                
    ## [3] "</div>"                   ""                        
    ## [5] "</body>"                  "</html>"

``` r
# we know first line of the tail is the warning message from geoplumber
all(grepl("build missing", tail(webpage)[1]), ignore.case = TRUE)
```

    ## [1] TRUE

``` r
# cleanup
setwd(od)
ps$kill()
```

    ## [1] TRUE

As we can see from the output of the R chunk, we do the following:

1.  Create a clean geoplumber instance
2.  Download some data
3.  Read (2) and pass it to `gp_explore`
4.  Do some extra checks on the app.

## Front-end

coming …
