# packages needed before running the server script
packages <- c("plumber")

if (length(setdiff(packages, rownames(installed.packages()))) > 0) {
  install.packages(setdiff(packages, rownames(installed.packages())), repos='http://cran.us.r-project.org')
}

lapply(packages, library, character.only = TRUE)

r = plumber::plumb(file.path("R", "plumber.R"))
r$run(port = 8000)
