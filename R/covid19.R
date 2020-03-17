# https://www.arcgis.com/sharing/rest/content/items/b684319181f94875a6879bbc833ca3a6/data
# Locked in ArcGIS servers!
df = read.csv("CountyUAs_cases_table.csv")
class(df); names(df)
# get LAs
folder = "Counties_and_UA"
if(!dir.exists(folder)) {
  dir.create(folder)
}
url = "https://opendata.arcgis.com/datasets/658297aefddf49e49dcd5fbfc647769e_1.zip"
las_shape = list.files(folder, pattern = "shp")[1]
if(!file.exists(file.path(folder, las_shape))) {
  download.file(url, destfile = file.path(folder, "data.zip"))
  unzip(file.path(folder, "data.zip"), exdir = folder)
  las_shape = list.files(folder, pattern = "shp")[1]
}
library(sf)
las = st_read(file.path(folder, las_shape))
# las = st_centroid(las)
m = match(tolower(df$GSS_NM), 
          tolower(las$ctyua17nm))
nrow(df) - length(las) # 139
nrow(df) # 150 names
length(which(is.na(m)))
df = df[df$GSS_NM %in% las$ctyua17nm, ]
m = m[!is.na(m)]
stopifnot(!any(is.na(m)))
sfc = st_geometry(las[m,])
covid_sf = st_as_sf(df, geom=sfc)
# top 30 regions
# plot(covid_sf[order(df$TotalCases, decreasing = T)[1:30],
              # "TotalCases"])
covid_sf = st_centroid(covid_sf)
plot(covid_sf)
st_write(covid_sf, "covid19.geojson", update=TRUE)
