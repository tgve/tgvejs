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
# size: 12.1mb
# all_geom = msoa[msoa$msoa11cd %in% s, "geometry"] geom only
# with msoa11cdc olumn
# all_geom = msoa[msoa$msoa11cd %in% s, c("msoa11cd", "geometry")]
# size: 
# object.size(all_geom)/1024/1024
# 1.7mb
# class(all_geom)
# plot(all_geom)
# now lets convert it into geojson for easy plotting
# all_gj = geojsonsf::sf_geojson(all_geom)
# write(all_gj, "~/Downloads/quant/sample.geojson")
# write.csv(all, "~/Downloads/quant/sample.csv")
# centroids = st_centroid(st_geometry(all_geom))

# o = levels(factor(all$origin_msoacode))
# d = levels(factor(all$destination_msoacode))
# all_i = data.frame(all$base, hs2 = all$data, o_i, d_i)
# object.size(all_i)/1024/1024
# 9.7 bytes
# write.csv(all_i, "~/Downloads/quant/sample.csv")
# head(all_i)
# that is still 14mb of csv
# the wrong way of doing this would be to 
# replace origin and destination with either a polygon or even a point.
# there would be some 42180 - 8936 repetitions in the df.
