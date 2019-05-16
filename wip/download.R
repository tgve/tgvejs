library(rvest)
library(stringr)
root = "http://dataportal.orr.gov.uk"
u = paste0(
  "http://dataportal.orr.gov.uk/browsereports/15")
page = read_html(u)
#'
r = page %>%
  html_nodes("a") %>%       # find all links
  html_attr("href") %>%     # get the url
  str_subset("html")
a = page %>%
  html_nodes("a") %>%
  html_text() %>%
  str_subset("Regional_rail_journeys -") %>%
  str_extract(" - (.+) - ") %>% str_replace_all(" - ", "")
a
r = r[1:14] # 15 and 16 are index changes
r = gsub("report/html","html/excel", r)
r
download.file(paste0(root, r[4]), destfile = paste0(a[4], ".xls"))
download.file(paste0(root, r[1]), destfile = paste0(a[1], ".xls"))
# now play with the xls


# there is so much reaxl can do now.
library(readxl)

readXL = function(file) {
  df = read_xls(file)
  # class(df)
  # nrow(df)
  # head(df)
  # df = Filter(function(x)!all(is.na(x)), df) # or drop_na()
  return(df)
}
file = paste0(a[4], ".xls")

df = readXL(file)
df2 = readXL(paste0(a[1], ".xls"))

