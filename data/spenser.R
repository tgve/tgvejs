# get the RDS from github, see below how it was generated.
download.file("https://github.com/layik/eAtlas/releases/download/0.0.1/population.Rds",
              "~/Downloads/population.Rds")
pop = readRDS("~/Downloads/population.Rds")
pop_2011 = pop[pop$Year == '2011', ]
# get UK boundaries from
# http://geoportal.statistics.gov.uk/datasets/f341dcfd94284d58aba0a84daf2199e9_0
dest_file = "~/Downloads/boundaries_2001"
download.file("https://opendata.arcgis.com/datasets/f341dcfd94284d58aba0a84daf2199e9_0.zip?outSR=%7B%22latestWkid%22%3A27700%2C%22wkid%22%3A27700%7D",
              paste0(dest_file, ".zip"))

unzip(paste0(dest_file, ".zip"), exdir = dest_file)
list.files(dest_file)

library(sf)
msoa = st_read(dest_file)
# names(msoa)
# plot(msoa[, 1])
# length(unique(msoa$msoa01cd))
# any(is.na(msoa$geometry))   # FALSE
# any(is.null(msoa$geometry)) # FALSE

# match all pop Area in msoa$msoa01cd
m = match(pop_2011$Area, msoa$msoa01cd)
sfc = st_geometry(msoa)
sfc = sfc[m] # list all boundaries with entries in pop
pop_2011_sf = st_as_sf(pop_2011, sfc)
object.size(pop_2011_sf)

# generate geotiff, sf does not do raster I think 
library(raster)
# 1000 rows
r = fasterize::raster(pop_2011_sf, ncols = 4, nrows = 10000 )# nrow(pop_2011_sf))
r = fasterize::fasterize(sf = pop_2011_sf, raster = r, field = "DC1117EW_C_SEX")
# not sure if it works
# view it on a map
mapview::mapview(r)
object.size(r)
tif_name = "~/Downloads/pop_2011_10krows_sex_sf.tif"
writeRaster(r, filename = tif_name) # * CPU/GPU* alert

# finally tile it.
# There are few ways of doing this, preferred method is this python
# package
# https://gdal.org/programs/gdal2tiles.html
# *********** code from Dr Robin Lovelace et al WHO work 2018
devtools::install_github("leonawicz/tiler")
library(tiler)
r = raster::raster(tif_name)
# create the tiles
tiles_dir = "~/Downloads/pop_2011_part_tiles"
dir.create(tiles_dir)
pal <- colorRampPalette(c("darkblue", "lightblue"))(20)
#' tiler IS using gdal2tile python code 
#' https://github.com/leonawicz/tiler/blob/77ccbf7da1a2077c483a4abb6bc19bad9b9ebdcc/inst/python/gdal2tilesIMG.py
#'So, careful with what Zoom level you use below, here is tiler docs warning.
#'it is recommended to (1) try making tiles for only one zoom level at a time, 
#'starting from zero and then increasing while monitoring your system resources. 
#'(2) If this is not enough, find a better system.
#'
tiler::tile(file = tif_name, tiles = tiles_dir, zoom = "0-3", col = pal)
# create the viewer
tiler::tile_viewer(tiles = "tiles", zoom = "0-3")
browseURL("preview.html")
# ***********
###############################################
# collate csvs into a dataframe
ppp_files = list.files("~/Downloads/data/", full.names = TRUE)[
  grep("ppp", list.files("~/Downloads/data/"))
  ]
spenser = read.csv(ppp_files[2])
names(spenser)
# [1] "PID"                 "Area"               
# [3] "DC1117EW_C_SEX"      "DC1117EW_C_AGE"     
# [5] "DC2101EW_C_ETHPUK11"

# aim
# year  sex age eth area
# 2011  1   1   1   E02001064
spenser_all = data.frame()
for (index in 1:40) {
  spenser = read.csv(ppp_files[index])
  spenser$Year = index + 2010 # cheeky
  # remove PID
  spenser$PID = NULL
  if(index == 1L) {
    spenser_all = data.frame() # reset just for safety
    spenser_all = spenser
  } else {
    spenser_all = rbind(spenser_all, spenser)
  }
}

# object.size(spenser_all)/1024/1024
saveRDS(spenser_all, "~/Desktop/data/spenser/population.Rds")
# released under repo

