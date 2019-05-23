csvs = list.files("data", pattern = ".csv", full.names = TRUE)
csv = NULL
for (file in csvs) {
  csv = rbind(csv, read.csv(file))
}
names(csv)
length(levels(factor(csv$GEOGRAPHY_CODE)))
# 22
lad = "lad.json"
download.file("https://github.com/martinjc/UK-GeoJSON/blob/master/json/administrative/gb/lad.json?raw=true",
              destfile = lad)

geojson = geojsonsf::geojson_sf(lad)

geom = geojson[match(csv$GEOGRAPHY_CODE, geojson$LAD13CD), c("geometry")]
class(st_geometry(geom))
library(sf)

csv_sf = csv
csv_sf$geometry = geom$geometry
csv_sf = st_as_sf(csv_sf)
names(csv_sf)
class(csv_sf)
mapview::mapview(csv_sf[1:10,])
  