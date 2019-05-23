library(sf)
readScenarios = function() {
  csvs = list.files("data", pattern = ".csv", full.names = TRUE)
  csv = NULL
  for (file in csvs) {
    csv = rbind(csv, read.csv(file))
  }
  length(levels(factor(csv$GEOGRAPHY_CODE)))
  # 22
  lad = "lad.json"
  if(!file.exists(lad)) {
    download.file("https://github.com/martinjc/UK-GeoJSON/blob/master/json/administrative/gb/lad.json?raw=true",
                  destfile = lad)
  }
  geojson = geojsonsf::geojson_sf(lad)
  geom = geojson[match(csv$GEOGRAPHY_CODE, geojson$LAD13CD), c("geometry")]
  csv$geometry = geom$geometry
  csv = st_as_sf(csv)
  # names(csv_sf)
  # class(csv_sf)
  rm(geojson)
  rm(geom)
  # mapview::mapview(csv_sf[1:10,])
  csv
}

  