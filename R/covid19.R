library(rvest)
h = read_html("https://www.gov.uk/government/publications/coronavirus-covid-19-number-of-cases-in-england/coronavirus-covid-19-number-of-cases-in-england")
h = html_node(h, "table") # or use pipe
df = html_table(h)
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
las = st_centroid(las)
m = match(tolower(df$`Upper Tier Local Authority`), 
          tolower(las$ctyua17nm))
nrow(df) - length(las) # 139
nrow(df) # 150 names
length(which(is.na(m)))
df = df[df$`Upper Tier Local Authority` %in% las$ctyua17nm, ]
m = m[!is.na(m)]
stopifnot(!any(is.na(m)))
sfc = st_geometry(las[m,])
covid_sf = st_as_sf(df, geom=sfc)
# plot(covid_sf[,"Number of confirmed cases"])
st_write(covid_sf, "covid19.geojson", update=TRUE)
