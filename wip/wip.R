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

# drag and drop over eAtlas