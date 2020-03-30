df = read.csv("https://www.arcgis.com/sharing/rest/content/items/b684319181f94875a6879bbc833ca3a6/data")
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
covid19 = st_as_sf(df, geom=sfc)
# top 30 regions
# plot(covid19[order(df$TotalCases, decreasing = T)[1:30],
              # "TotalCases"])
covid19 = st_centroid(covid19)
# plot(covid19)
# st_write(covid19, "covid19.geojson", update=TRUE)

r = st_read("https://opendata.arcgis.com/datasets/01fd6b2d7600446d8af768005992f76a_4.geojson")
# r = st_transform(r, 4326)
w = st_within(covid19,r)
w = as.numeric(as.character(w))
stopifnot(nrow(covid19) == length(w))
covid19$region = w
a = aggregate(TotalCases ~ region, covid19, sum)
r = r[a$region,]
r$TotalCases = a[,"TotalCases"]
covid19_regions = r[, c("nuts118cd", "nuts118nm", "TotalCases")]
# now geojson
names(covid19_regions) = c("code", "name", "TotalCases", "geometry")
names(covid19) = c("code", "name", "TotalCases", "geom", "region")
covid19 = geojsonsf::sf_geojson(covid19)
covid19_regions = geojsonsf::sf_geojson(covid19_regions)
# st_write(covid19_regions, 
#          "covid19-regions-date.geojson")

########### world ###########
# url changed 
# https://www.ecdc.europa.eu/en/publications-data/download-todays-data-geographic-distribution-covid-19-cases-worldwide
csv = read.csv("https://opendata.ecdc.europa.eu/covid19/casedistribution/csv", 
               stringsAsFactors = FALSE)
c = read.csv("countries.csv")
library(sf)
c = st_as_sf(c, coords = c("longitude","latitude"))
csv$countriesAndTerritories = gsub("[^A-Za-z]", "", 
                                   csv$countriesAndTerritories)
# underscores were removed.
csv$countriesAndTerritories = gsub("([a-z])([A-Z])", "\\1 \\2", 
                                   csv$countriesAndTerritories)
csv$countriesAndTerritories = gsub("United Statesof America", 
                                   "United States",
                                   csv$countriesAndTerritories)
csv = csv[tolower(csv$countriesAndTerritories) %in% 
            tolower(c$name), ]
m = unlist(lapply(tolower(csv$countriesAndTerritories), 
                  function(x) grep(x, tolower(c$name))[1]))
sfc = st_geometry(c)
m = m[!is.na(m)]
stopifnot(!any(is.na(m)))
sfc = sfc[m]
csv = st_as_sf(csv, geom = sfc)
covid19_world = geojsonsf::sf_geojson(csv)

#### UK daily
url = "https://www.arcgis.com/sharing/rest/content/items/e5fd11150d274bebaaf8fe2a7a2bda11/data"
daily = list.files(folder, pattern = "xlsx", full.names = TRUE)[1]
if(!file.exists(file.path(folder, daily))) {
  download.file(url, extra = '-L',
                destfile = file.path(folder, "daily.xlsx"))
  daily = list.files(folder, pattern = "xlsx", full.names = TRUE)[1]
}
daily = readxl::read_xlsx(daily)
#### daily no's
# library(rvest)
# daily = read_html("https://www.arcgis.com/home/item.html?id=23258c605db74e6696e72a65513a1770&view=lis#data")
# daily = html_node(daily, "table")
