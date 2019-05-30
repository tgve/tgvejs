library(sf)

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

#' start wip/play.R
#' 
csv = read.csv("wip/ne-other.csv", stringsAsFactors=FALSE)
names(csv) = gsub("X", "", names(csv)) # remove X's make.names
names(csv) = gsub("..b.", "", names(csv)) # remove X's make.names
csv = Filter(function(x)!all(is.na(x)), csv) # efficient
max.trips = max(as.numeric(sapply(csv[,names(csv)[2:24]], max, na.rm = TRUE)))
min.trips = min(as.numeric(sapply(csv[,names(csv)[2:24]], min, na.rm = TRUE)))
# regions including scotland
# https://opendata.arcgis.com/datasets/bafeb380d7e34f04a3cdf1628752d5c3_0.geojson
json = geojsonsf::geojson_sf("https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/eurostat/ew/nuts1.json")
json = json[order(json$NUTS112NM),]
csv$Between.North.East.and[match("Wales - Cymru", csv$Between.North.East.and)] = "Wales"
json$NUTS112NM
csv$Between.North.East.and
# no geometry for scotland
csv = csv[-(match("Scotland", csv$Between.North.East.and)),]
indices = unlist(sapply(csv$Between.North.East.and, 
                        function(x)grep(pattern = x, json$NUTS112NM, 
                                        ignore.case = TRUE)))
# json = json[order(json$NUTS112NM[indices]),] 
# json$NUTS112NM rows should match csv$Between.North.East.and
# then
st_geometry(csv) = json$geometry[indices]
#' 
#' end wip/play.R
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
linestrings <- lapply(cent_others$geometry, 
                     function(x)rbind(st_coordinates(cent_northe$geometry),st_coordinates(x)))
linestrings <- lapply(linestrings, 
                    function(x)st_linestring(x))
lines_sf = st_sf(csv, geometry = st_sfc(linestrings, crs = 4326))
lines_geojson = geojsonsf::sf_geojson(lines_sf)
#' @get /api/lines
trips_target <- function(res, name) {
  res$body <- lines_geojson
  res
}


# csvs = list.files("data", pattern = ".csv", 
#                   full.names = TRUE)
scenarios = read.csv("data/scenario0e.csv")
# for (file in csvs) {
#   scenarios = rbind(scenarios, read.csv(file))
# }
scenarios$JOBS = round(scenarios$JOBS, 3)
lad = "lad.json"
if(!file.exists(lad)) {
  download.file("https://github.com/martinjc/UK-GeoJSON/blob/master/json/administrative/gb/lad.json?raw=true",
                destfile = lad)
}
names(scenarios) = gsub("GEOGRAPHY_", "", names(scenarios))
lad_geojson = geojsonsf::geojson_sf(lad)
geom = lad_geojson[match(levels(factor(scenarios$CODE)), 
                         lad_geojson$LAD13CD), 
               c("LAD13CD", "geometry")]
rm(lad_geojson)
scenarios_json = jsonlite::toJSON(scenarios)
geom = st_centroid(geom)
scenarios_geojson = geojsonsf::sf_geojson(geom)
#' @get /api/scenarios
scenarios <- function(res) {
  res$body <- scenarios_json
  res
}
#' @get /api/geom
geom <- function(res) {
  res$body <- scenarios_geojson
  res
}
#' Tell plumber where our public facing directory is to SERVE.
#' No need to map / to the build or public index.html. This will do.
#'
#' @assets ./build /
list()
