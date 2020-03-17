#' download the files from GH
#' return the objects
# spenser_msoa <- "man.geojson"
spenser_msoa <- "man.geojson"
spenser_rds <- "man_freqs.Rds"
github <- "https://github.com/layik/eAtlas/releases/download/0.0.1/"
spenser <- "" # scoping
download <- function() {
  if(!file.exists(spenser_msoa) | !file.exists(spenser_rds)) {
    download.file(paste0(github, spenser_rds),
                  destfile = spenser_rds)
    download.file(paste0(github, spenser_msoa),
                  destfile = spenser_msoa)
  }
}
download()
spenser_msoa <- readChar(spenser_msoa, 
                         file.info(spenser_msoa)$size)
sp <- readRDS(spenser_rds)
sp <- sp[sp$y %in% 2011:2015, ]
spenser2 <- list(sp, spenser_msoa)
