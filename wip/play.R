# from https://dataportal.orr.gov.uk/displayreport/report/html/8e9af9cb-e146-4dc4-8e1f-20258d577ef3
# get main table and export as csv
# make sure you do not include the 1000s separator commas

csv = read.csv("ne-other.csv", stringsAsFactors=FALSE)
names(csv) = gsub("X", "", names(csv)) # remove X's make.names
csv = Filter(function(x)!all(is.na(x)), csv) # efficient
max.trips = max(as.numeric(sapply(csv[,names(csv)[2:24]], max, na.rm = TRUE)))
min.trips = min(as.numeric(sapply(csv[,names(csv)[2:24]], min, na.rm = TRUE)))


plot(as.numeric(csv[1,3:length(names(csv))-1]), type = "o", col = "blue", 
     ylim = c(min.trips,max.trips), xlab = csv[1,1])