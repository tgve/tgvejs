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
