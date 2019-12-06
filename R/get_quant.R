#' download the files from GH
#' return the objects
quant_msoa <- "~/Downloads/quant/sample.geojson"
quant_csv <- "~/Downloads/quant/sample.csv"
github <- "~/Downloads/quant/"
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
# quant_json <- jsonlite::toJSON(quant_csv)
quant <- list(quant_csv, quant_msoa)