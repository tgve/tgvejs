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
# now play with the xls