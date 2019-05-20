#' plumber 0.4.6

# Enable CORS -------------------------------------------------------------
#' CORS enabled for now. See docs of plumber
#' for disabling it for any endpoint we want in future
#' https://www.rplumber.io/docs/security.html#cross-origin-resource-sharing-cors
#' @filter cors
cors <- function(res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  plumber::forward()
}
# TODO: option to remove above CORS

#'
#' @param msg The message to echo
#' @get /api/helloworld
#' @get /api/helloworld/
function(msg="nothing given"){
  list(msg = paste0("The message is: '", msg, "'"))
}

#' @section TODO:
#' The plugger endpoint should not be there. Currently mapping React build to /
#' at assets causes the swagger endpoint to be 404. Support is limited.
#'
#' @get /__swagger__/
swagger <- function(req, res){
  fname <- system.file("swagger-ui/index.html", package = "plumber") # serve the swagger page.
  plumber::include_html(fname, res)
}

# Below is part of Welcome endpoint:
library(geoplumber)
uol <- rbind(uni_point, uni_poly)
uol <- geojsonsf::sf_geojson(uol, factors_as_string=FALSE)
#' Welcome endpoint. Feel free to remove, relevant line in Welcome.js (line 41)
#' @get /api/uol
uol_geojson <- function(res, grow){
  if(!missing(grow) && !is.na(as.numeric(grow))) {
    # add a buffer around poly for now
    # TODO: further checks for value validity.
    poly <- sf::st_buffer(uni_poly, as.numeric(grow))
    poly <- geojsonsf::sf_geojson(poly)
    res$body <- poly # geojson
    return (res)
  }
  res$body <- uol
  res
}

source("wip/play.R")
geojson <- geojsonsf::sf_geojson(csv)
#' @get /api/trips
trips_geojson <- function(res){
  res$body <- geojson
  res
}

target <- json[grep("North East", json$NUTS112NM), "geometry"]
target_geojson <- geojsonsf::sf_geojson(target)
#' @get /api/target
trips_target <- function(res, name) {
  res$body <- target_geojson
  res
}

cent_others <- st_centroid(csv)
cent_northe <- st_centroid(target) 
lines_sfc <- lapply(cent_others$geometry, 
                     function(x)rbind(st_coordinates(cent_northe$geometry),st_coordinates(x)))
lines_sfc <- lapply(lines_sfc, 
                    function(x)st_linestring(x))
lines = st_sf(csv, geometry = st_sfc(lines_sfc, crs = 4326))
lines_geojson = geojsonsf::sf_geojson(lines)
#' @get /api/lines
trips_target <- function(res, name) {
  res$body <- lines_geojson
  res
}

#' Tell plumber where our public facing directory is to SERVE.
#' No need to map / to the build or public index.html. This will do.
#'
#' @assets ./build /
list()
