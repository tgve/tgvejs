# from https://dataportal.orr.gov.uk/displayreport/report/html/8e9af9cb-e146-4dc4-8e1f-20258d577ef3
# get main table and export as csv
# make sure you do not include the 1000s separator commas

csv = read.csv("ne-other.csv", stringsAsFactors=FALSE)
names(csv) = gsub("X", "", names(csv)) # remove X's make.names
names(csv) = gsub("..b.", "", names(csv)) # remove X's make.names
csv = Filter(function(x)!all(is.na(x)), csv) # efficient
max.trips = max(as.numeric(sapply(csv[,names(csv)[2:24]], max, na.rm = TRUE)))
min.trips = min(as.numeric(sapply(csv[,names(csv)[2:24]], min, na.rm = TRUE)))

csvt <- data.frame(t(csv[-1]))
colnames(csvt) <- csv[, 1]
names(csvt) = gsub(" - Cymru", "", names(csvt))

# regions including scotland
# https://opendata.arcgis.com/datasets/bafeb380d7e34f04a3cdf1628752d5c3_0.geojson
json = geojsonsf::geojson_sf("https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/eurostat/ew/nuts1.json")
json = json[order(json$NUTS112NM),]
# json$NUTS112NM = gsub(" \\(England\\)", "", json$NUTS112NM)
json$NUTS112NM
i = grep("North East",json$NUTS112NM)
# json = json[-i,] # remove itself NE
indices = unname(unlist(sapply(csv$Between.North.East.and, 
                        function(x)grep(x, json$NUTS112NM, 
                                        ignore.case = TRUE))))
json = json[order(indices),] # subset to only avialable ones
# json$NUTS112NM rows should match csv$Between.North.East.and
# then
library(sf)
st_geometry(csv) = json$geometry

# mapview::mapview(json[9,])
plot(as.numeric(csv[1,3:length(names(csv))-1]), type = "o", col = "blue", 
     ylim = c(min.trips,max.trips), xlab = csv[1,1])
