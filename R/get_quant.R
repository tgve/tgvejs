#' download the files from GH
#' return the objects
# quant_msoa <- "quant_50_msoa.geojson"
quant_msoa_centroids <- "msoa_centroids.geojson"
quant_csv <- "quant_50_msoa_sample.csv"
github <- "https://github.com/layik/eAtlas/releases/download/0.0.1/"
quant <- "" # scoping
download <- function() {
  if(!file.exists(quant_msoa_centroids) | !file.exists(quant_csv)) {
    # download.file(paste0(github, quant_msoa),
    #               destfile = quant_msoa)
    download.file(paste0(github, quant_csv),
                  destfile = quant_csv)
    download.file(paste0(github, quant_msoa_centroids),
                  destfile = quant_msoa_centroids)
  }
}
download()
# quant_msoa <- readChar(quant_msoa, file.info(quant_msoa)$size)
quant_msoa_centroids <- readChar(quant_msoa_centroids, 
                       file.info(quant_msoa_centroids)$size)
quant_csv <- read.csv(quant_csv)
# quant_json <- jsonlite::toJSON(quant_csv)
quant <- list(quant_csv, quant_msoa_centroids)