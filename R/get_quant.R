#' download the files from GH
#' return the objects
quant_msoa <- "quant_50_msoa.geojson"
quant_csv <- "quant_50_msoa_sample.csv"
github <- "https://github.com/layik/eAtlas/releases/download/0.0.1/"
quant <- "" # scoping
download <- function() {
  if(!file.exists(quant_msoa) | !file.exists(quant_csv)) {
    download.file(paste0(github, quant_msoa),
                  destfile = quant_msoa)
    download.file(paste0(github, quant_csv),
                  destfile = quant_csv)
  }
}
download()
quant_msoa <- readChar(quant_msoa, file.info(quant_msoa)$size)
quant_csv <- read.csv(quant_csv)
quant_json <- jsonlite::toJSON(quant_csv)
quant <- c(quant_json, quant_msoa)