# Enable CORS -------------------------------------------------------------
#' CORS enabled for now. See docs of plumber
#' for disabling it for any endpoint we want in future
#' https://www.rplumber.io/docs/security.html#cross-origin-resource-sharing-cors
#' @filter cors
cors <- function(res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  plumber::forward()
}

# read the csv and let it serve it
lbc = read.csv("https://letsbeatcovid.net/api/geo")
lbc = lbc[1:5000] # TODO: For puroposes of dev 
#' @get /api/lbc
all_geojson <- function(res){
  res$setHeader("Content-Type", "text/csv")
  con <- textConnection("val","w")
  write.csv(lbc, con)
  close(con)
  
  res$body <- paste(val, collapse="\n")
  res
}


#' Tell plumber where our public facing directory is to SERVE.
#' No need to map / to the build or public index.html. This will do.
#'
#' @assets ./build /
list()
