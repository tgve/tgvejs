ppp_files = list.files("~/Downloads/data/", full.names = TRUE)[
  grep("ppp", list.files("~/Downloads/data/"))
  ]
spenser = read.csv(ppp_files[2])
names(spenser)
# [1] "PID"                 "Area"               
# [3] "DC1117EW_C_SEX"      "DC1117EW_C_AGE"     
# [5] "DC2101EW_C_ETHPUK11"

# msoa = st_read("~/Downloads/quant/msoa.geojson")
# all(match(spenser$Area, msoa$msoa11cd))
# [1] TRUE

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