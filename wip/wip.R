#### SPENSER
unzip("~/Downloads/oxford.zip", exdir = "~/Downloads/oxford")
dir = "~/Downloads/oxford/oxford"
list.files(dir)
csv = read.csv(file.path(dir, list.files(dir)[1]))
# all_housholds = read.csv("~/Downloads/all_households/all_households.csv")
names(csv)
head(csv)
# see if this would be much different from the scenarios Andrew sent.
# some basic plots
barplot(table(all_housholds$ethnicity),las=2, yaxt = "n")
ticks = axTicks(2)
axis(2, at=ticks, labels=paste0(ticks/1e+06, "M")) # format the scientific numbers

#### QUANT

## download improvedCounts.csv
q = read.csv("~/Downloads/ImprovedCount.csv")
library(sf)
q_sf = st_as_sf(q, coords = c("lon", "lat"))
write(geojsonsf::sf_geojson(q_sf), file = "~/Downloads/improvedcount.geojson")

## download DjDiff.csv
dj = read.csv("~/Downloads/DjDiff.csv")
library(sf)
dj_sf = st_as_sf(dj, coords = c("lon", "lat"))
dj_file_name = "~/Downloads/DjDiff.geojson"
write(geojsonsf::sf_geojson(dj_sf), file = dj_file_name)
file.size(dj_file_name)/1024/1024
# [1] 1.959415 mb

# drag and drop over eAtlas

### msoa polies
# https://opendata.arcgis.com/datasets/02aa733fc3414b0ea4179899e499918d_0.geojson
msoa = geojsonsf::geojson_sf("~/Downloads/msoa.geojson")
names(msoa)
object.size(msoa)
# 260148416 bytes
260148416/1024/1024
# 248.0969 mb
head(msoa$msoa11nmw, 20)
head(msoa$msoa11nm, 20)
# msoa = msoa[, c("msoa11cd", "msoa11nm")]
head(dj)
