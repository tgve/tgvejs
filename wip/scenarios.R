scenario = read.csv("~/Downloads/scenario0e.csv")
names(scenario)
head(scenario)
# https://opendata.arcgis.com/datasets/ae90afc385c04d869bc8cf8890bd1bcd_3.geojson
lads = geojsonsf::geojson_sf("~/Downloads/lads.geojson")
match(scenario$GEOGRAPHY_CODE, lads$lad17cd)
scenarios_sfc = st_geometry(lads[match(scenario$GEOGRAPHY_CODE, lads$lad17cd),])
scenarios_sf = st_sf(scenario, scenarios_sfc)
plot(scenarios_sf[,"GEOGRAPHY_CODE"])
names(scenario)
spenser = "~/Downloads/spenser.geojson"
write(geojsonsf::sf_geojson(scenarios_sf[scenarios_sf$YEAR == 2020, ]), file = spenser)
table(scenarios_sf$YEAR)
