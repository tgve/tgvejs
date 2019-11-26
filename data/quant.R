library(sf)

csv2 = read.csv("~/Downloads/quant/TPred3.csv")
# base
csv = read.csv("~/Downloads/quant/TPred3_base.csv")
csv2$origin_i = NULL
csv$origin_i = NULL
csv2$destination_j = NULL
csv$destination_j = NULL

# c = 1e6 
# or the whole things 
# c = nrow(csv)
# all = data.frame(base=csv[1:c,"data"], csv2[1:c,])

msoa = geojsonsf::geojson_sf("~/Downloads/quant/msoa.geojson")
length(match(csv$origin_msoacode, msoa$msoa11cd)) == nrow(csv)
# TRUE

# get 50 msoa's from origins.
# c = 50
# s = sample(nrow(msoa), c)
# s = msoa$msoa11cd[s]
# all = data.frame(base=
#                  csv[csv$origin_msoacode %in% s, "data"],
#                  csv2[csv$origin_msoacode %in% s,])
# 
# all_geom = msoa[msoa$msoa11cd %in% s, c("msoa11cd", "geometry")]
# all_gj = geojsonsf::sf_geojson(all_geom)
# write(all_gj, "~/Downloads/quant/sample.geojson")
# write.csv(all, "~/Downloads/quant/sample.csv")

# f = levels(factor(all$origin_msoacode))

# class(all_geom)
# plot(all_geom)

all = st_as_sf(all, st_geometry(m))