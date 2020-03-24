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
r = st_transform(r, 4326)
w = st_within(covid19,r)
w[127] = 9
w = unlist(w) 
covid19$region = w
a = aggregate(TotalCases ~ region, covid19, sum)
r = r[a$region,]
r$TotalCases = a[,"TotalCases"]
covid19_regions = r[, c("nuts118cd", "nuts118nm", "TotalCases")]
# now geojson
covid19 = geojsonsf::sf_geojson(covid19)
covid19_regions = geojsonsf::sf_geojson(covid19_regions)
# st_write(r[, c("nuts118cd", "nuts118nm", "TotalCases")], 
#          "covid19-regions.geojson")

########### world ###########
csv = read.csv("https://covid.ourworldindata.org/data/full_data.csv", 
               stringsAsFactors = FALSE)
c = read.csv("countries.csv")
library(sf)
names(c)
names(csv)
c = st_as_sf(c, coords = c("longitude","latitude"))
csv = csv[tolower(csv$location) %in% tolower(c$name), ]
m = unlist(lapply(tolower(csv$location), 
                  function(x) grep(x, tolower(c$name))[1]))
sfc = st_geometry(c)
m = m[!is.na(m)]
stopifnot(!any(is.na(m)))
sfc = sfc[m]
csv = st_as_sf(csv, geom = sfc)
covid19_world = geojsonsf::sf_geojson(csv)


#### daily no's
# library(rvest)
# daily = read_html("https://www.arcgis.com/home/item.html?id=23258c605db74e6696e72a65513a1770&view=lis#data")
# daily = html_node(daily, "table")
