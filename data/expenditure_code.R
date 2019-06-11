library(plyr)
library(mipfp) 
library(Hmisc)
library(R.utils)
library(abind)
library(dplyr)
library(tidyr)
library(reshape2)
library(data.table)
library(ipfp)
library(stringr)
library("ggplot2")

##FORMAT RAW PERSON LEVEL SURVEY TABLE
## Generate table of all those 16+ with variables of gender, ethnicity, age (grouped), age (original) and age/gender
format_raw_person <- function(raw_person){
  raw_person_cols_all <- c("Eth01p", "EthEp", "EthWp", "EthSp", "EthNIp")
  raw_person_cols <- c()
  for (col in raw_person_cols_all){
    if(col %in% colnames(raw_person)){
      raw_person_cols <- c(raw_person_cols, col)}}
  raw_person <- raw_person[,c(raw_person_cols,"case", "Person", "Sex", "dvage_p", "INA011")]
  raw_person <- raw_person[which(raw_person$INA011 == "A spender" | raw_person$INA011 == "a spender"),]
  raw_person$Eth_ori  <- do.call(paste, c(raw_person[raw_person_cols], sep=""))
  raw_person$Eth_ori <- gsub(" ","",raw_person$Eth_ori)
  raw_person$id_hh_pers <- as.numeric(paste(raw_person$case, raw_person$Person, sep="."))
  raw_person <-  raw_person[raw_person$Eth_ori != "",c("case", "id_hh_pers","Sex","Eth_ori", "dvage_p")]
  raw_person$Eth[raw_person$Eth_ori == "White"] <- "eth_white"
  raw_person$Eth[raw_person$Eth_ori == "Black"] <- "eth_black"
  raw_person$Eth[raw_person$Eth_ori == "Mixedrace"] <- "eth_mixed"
  raw_person$Eth[raw_person$Eth_ori != "White" & raw_person$Eth_ori != "Mixedrace" & raw_person$Eth_ori != "Black"] <- "eth_other"
  raw_person$Eth <- as.factor(raw_person$Eth)
  raw_person$age_ori <- as.character(raw_person$dvage_p)
  raw_person$age_ori[raw_person$age_ori == "80 or older"] <- 80
  raw_person$age_ori <- as.numeric(raw_person$age_ori)
  raw_person <- plyr::rename(raw_person, c("Sex"="gender", "dvage_p"="age", "Eth"="Ethnic_gp"))                          
  raw_person$gender <- revalue(raw_person$gender,c("Male" = "M", "Female" = "F")) ##rename records male/female to m/f
  brks <- c(0, 24, 34, 49, 64, 74, 200)
  labs <- c("16_24","25_34","35_49", "50_64", "65_74", "75_pl")
  raw_person$age <- cut(as.numeric(raw_person$age_ori), breaks = brks, labels = labs) # bin the age variable
  raw_person$age <- as.character(raw_person$age)
  raw_person$age_gen <- as.character(paste(raw_person$gender, raw_person$age, sep='_'))
  return(raw_person)}

##FORMAT CHILD RAW PERSON LEVEL SURVEY TABLE
##Generate table of all those 0 - 15 with variables of dender, age(ori), age(grouped), and/gender 
format_raw_child <- function(raw_person){
  raw_person <- raw_person[,c("case", "Person", "Sex", "dvage_p")]
  raw_person$id_hh_pers <- as.numeric(paste(raw_person$case, raw_person$Person, sep="."))
  raw_person$age_ori <- as.character(raw_person$dvage_p)
  raw_person$age_ori[raw_person$age_ori == "80 or older"] <- 80
  raw_person$age_ori <- as.numeric(raw_person$age_ori)
  raw_person <- plyr::rename(raw_person, c("Sex"="gender", "dvage_p"="age"))                          
  raw_person$gender <- revalue(raw_person$gender,c("Male" = "M", "Female" = "F")) ##rename records male/female to m/f
  brks <- c(0, 9, 15)
  labs <- c("0_9","10_15")
  raw_person$age <- cut(as.numeric(raw_person$age_ori), breaks = brks, labels = labs) # bin the age variable
  raw_person$age <- as.factor(raw_person$age)
  raw_person$age_gen <- as.factor(paste(raw_person$gender, raw_person$age, sep='_'))
  raw_person$age_gen <- factor(raw_person$age_gen, levels = c("F_0_9", "F_10_15", "M_0_9", "M_10_15"))
  raw_person <- raw_person[!is.na(raw_person$age),]
  return(raw_person)}

##PRODUCE CHILD TABLE
##Merge survey table to child table - add variables of weight, region, country, expenditure region and 'over 18'
prod_child <- function(format_raw_child, survey_hh){
  ##survey_hh$Gorx <- revalue(survey_hh$Gorx, c("North West and Merseyside" = "North West & Merseyside"))
  child <- inner_join(format_raw_child, survey_hh[,c("case","weighta", "Gorx")], by="case")
  child$country[child$Gorx == "Scotland"] <- "Scotland"
  child$country[child$Gorx == "Northern Ireland"] <- "Northern Ireland"
  child$country[child$Gorx == "Wales"] <- "Wales"
  child$country[child$Gorx %in% eng_list] <- "England"
  child$exp_reg <- child$Gorx
  child$plus_18 <- 0
  child <- child[,c("age_gen", "id_hh_pers", "case", "weighta", "Gorx", "country", "exp_reg", "age_ori", "plus_18")]
  return(child)}

## FORMAT AGE AND GENDER 
format_age_gen <- function(age_sex_full, year, reg_tab, reg_col){
  for (gen in c("M","F")){
    age_sex_gen <- age_sex_full[which (age_sex_full$Gender == gen & age_sex_full$Year == year),]
    assign(paste(gen,"_0_9", sep = ""), rowSums(age_sex_gen[6:15]))
    assign(paste(gen,"_10_15", sep = ""), rowSums(age_sex_gen[16:21]))
    assign(paste(gen,"_16_24", sep = ""), rowSums(age_sex_gen[22:30]))
    assign(paste(gen,"_25_34", sep = ""), rowSums(age_sex_gen[31:40]))
    assign(paste(gen,"_35_49", sep = ""), rowSums(age_sex_gen[41:55]))
    assign(paste(gen,"_50_64", sep = ""), rowSums(age_sex_gen[56:70]))
    assign(paste(gen,"_65_74", sep = ""), rowSums(age_sex_gen[71:80]))
    assign(paste(gen,"_75_pl", sep = ""), rowSums(age_sex_gen[81:96]))
    assign(paste(gen,"_0_15_total", sep = ""), rowSums(age_sex_gen[6:21]))}
  
  mnemonic <- age_sex_gen$mnemonic
  age_sex <- data.frame(mnemonic, M_0_9, F_0_9, M_10_15, F_10_15, M_16_24, F_16_24, M_25_34, F_25_34, M_35_49, F_35_49, M_50_64, F_50_64,  M_65_74, F_65_74, M_75_pl, F_75_pl, M_0_15_total, F_0_15_total)
  age_sex$total_16_pl <- rowSums(age_sex[6:17])
  age_sex$total_0_pl <- rowSums(age_sex[2:17])
  age_sex$mnemonic <- as.character(age_sex$mnemonic)
  reg_tab[,reg_col] <- as.character(reg_tab[,reg_col])
  reg_tab$mnemonic <- as.character(reg_tab$mnemonic)
  age_sex <- left_join(age_sex, reg_tab[,c("mnemonic",  reg_col)], by = c("mnemonic"))
  if(any(is.na(age_sex[,reg_col])) == TRUE) warning("REGION MATCH ERROR")
  return(age_sex)}

##ADD REGION ID
add_reg <- function(table_in, reg_tab, reg_col){
  table_in <- left_join(table_in, reg_tab[,c("mnemonic",  reg_col)], by = c("mnemonic"))
  if(any(is.na(table_in[,reg_col])) == TRUE) warning("REGION MATCH ERROR")
  return(table_in)}

##FORMAT UNEMPLOYMENT TABLE
format_unemployed <- function(unemp, age_gen_formatted){
  #subset col of interest
  unemployment_col <- c(paste("Jan.",year,".Dec.",year, sep = ''))
  unemp <- unemp[,c("mnemonic", unemployment_col), drop = F]
  #set col name
  names(unemp) <- c("mnemonic","unemp")
  #remove any rows with 'errors' drop F stops transformation of single col to vector
  unemp <- unemp[rowSums((unemp == "!") | rowSums(unemp == "-") | rowSums(unemp == "*") | rowSums(unemp == "~"))==0,, drop = F]
  unemp[,c("unemp")] <- sapply(unemp[,c("unemp")],as.numeric)
  unemp <- inner_join(unemp, age_gen_formatted[,c("mnemonic","total_16_pl")], by = "mnemonic")
  unemp$not_unemp <- unemp$total_16_pl - unemp$unemp
  unemp[,c("unemp","not_unemp")] <- unemp[,c("unemp","not_unemp")] /rowSums(unemp[,c("unemp","not_unemp")])
  unemp$total_16_pl <- NULL
  return(unemp)}

## FORMAT STUDENTS
format_student <- function(stu_total){
  #subset col of interest
  education_col <-  c(paste("Jan.",year,".Dec.",year, sep = ''))
  stu_total <- stu_total[,c("mnemonic", education_col), drop = F]
  #set col name
  names(stu_total) <- c("mnemonic","student")
  #remove any rows with 'errors' drop F stops transformation of single col to vector
  stu_total <- stu_total[rowSums((stu_total == "!") | rowSums(stu_total == "-") | rowSums(stu_total == "*") | rowSums(stu_total == "~"))==0,, drop = F]
  stu_total[,c("student")] <- sapply(stu_total[,c("student")],as.numeric)
  return(stu_total)}

## FORMAT ETHNICITY
format_ethnic_v2 <- function(ethnic){
  ethnic <- ethnic[which(ethnic$year == year),]
  ethnic <- plyr::rename(ethnic, c("T18.1..All.Ages...All...All.People.." = "all","T18.4..All.Ages...White...All.People.." = "white", "T18.7..All.Ages...Mixed...All.People.." = "mixed", "T18.16..All.Ages...Black...All.People.." = "black"))
  ethnic_cols <- c("all","white", "mixed", "black")
  ethnic <- ethnic[,c("mnemonic", ethnic_cols)]
  ethnic[ethnic_cols][ethnic[ethnic_cols] == "!"| ethnic[ethnic_cols] == "-" | ethnic[ethnic_cols] == "~" | ethnic[ethnic_cols] == "*"] <- 0
  ethnic[,ethnic_cols] <- sapply(ethnic[,ethnic_cols],as.numeric)
  ethnic$other <- ethnic$all - rowSums(ethnic[c("white", "mixed", "black")], na.rm = TRUE)
  ethnic <- cbind(ethnic[c("mnemonic")], prop.table(as.matrix(ethnic[c("white", "mixed", "black", "other")]), 1)) # row percentages 
  return(ethnic)}


##FORMAT DIARY
format_diary <- function(diary, msim, reg_list, reg_col_name){
  final_mnemonic <- NULL
  diary <- merge(diary, adult_child_exp_reg[,c("id_hh_pers", "exp_reg")]) ## FOR PRODUCT LEVEL RRCPL
  print(head(diary))
  diary$COI_PLUS <- gsub(".", '_', diary$COI_PLUS, fixed = TRUE)
  diary$COI_PLUS <- paste("X", diary$COI_PLUS, sep = "" )
  diary$div_code <- gsub("[_].*$", "", diary$COI_PLUS)
  diary$div_code <- as.factor(diary$div_code)
  diary$s2 <- substring(diary$COI_PLUS, 1, 3)
  diary$s3 <- substring(diary$COI_PLUS, 1, 4)
  diary$s4 <- substring(diary$COI_PLUS, 1, 5)
  diary$s5 <- substring(diary$COI_PLUS, 1, 6)
  diary_all_list <- unique(as.vector(diary$COI_PLUS))
  ##food_drink_tob_all_list <- c(unique(as.vector(diary[which(diary$div_code == 'X1' | diary$s4 == 'X11_1' | diary$s3 == 'X2_1' | diary$s3 == 'X2_2') ,c("COI_PLUS")])), 'X3_11_3',  'X3_11_8',  "X20_5_2_1_3")
  ####food_drink_tob_all_list <- c(unique(as.vector(diary[which(diary$div_code == 'X1' | diary$s4 == 'X11_1' | diary$s3 == 'X2_1' | diary$s3 == 'X2_2' | diary$COI_PLUS == 'X3_11_3' | diary$COI_PLUS == 'X3_11_8' |  diary$COI_PLUS == "X20_5_2_1_3") ,c("COI_PLUS")])))
  food_drink_tob_all_list <- c(unique(as.vector(diary[which(diary$div_code == 'X1' | diary$s4 == 'X11_1' | diary$s3 == 'X2_1' | diary$s3 == 'X2_2') ,c("COI_PLUS")])))
  print (paste("FOOD DRINK TOB ALL LIST", food_drink_tob_all_list))
  print(length(food_drink_tob_all_list))
  ##food_non_alc_hh_list <- c(unique(as.vector(diary[which(diary$div_code == 'X1'),c("COI_PLUS")])), 'X3_11_3',  'X3_11_8',  "X20_5_2_1_3")
  food_non_alc_hh_list <- c(unique(as.vector(diary[which(diary$div_code == 'X1'),c("COI_PLUS")])))
  smoke_list <- c("X2_2_1_1_1", "X2_2_1_2_1", "X2_2_1_3_1")
  alc_hh_list <- c("X2_1_1_1_1", "X2_1_2_1_1", "X2_1_2_1_2", "X2_1_2_1_3", "X2_1_2_1_4", "X2_1_2_2_1", "X2_1_3_1_1")
  alc_tob_hh_list <- c(smoke_list,alc_hh_list)
  rest_hotel_list <- unique(as.vector(diary[which(diary$s2 == 'X11'),c("COI_PLUS")]))
  rec_cult_list <- unique(as.vector(diary[which(diary$div_code == 'X9') ,c("COI_PLUS")]))
  clot_foot_list <- unique(as.vector(diary[which(diary$div_code == 'X3'),c("COI_PLUS")]))
  hh_services_list <- unique(as.vector(diary[which(diary$div_code == 'X4'),c("COI_PLUS")]))
  furniture_hh_goods_list <- unique(as.vector(diary[which(diary$div_code == 'X5'),c("COI_PLUS")]))
  transport_list <- unique(as.vector(diary[which(diary$div_code == 'X7'),c("COI_PLUS")]))
  comms_list <- unique(as.vector(diary[which(diary$div_code == 'X8'),c("COI_PLUS")]))
  misc_goods_serv_list <- unique(as.vector(diary[which(diary$s2 == 'X12'),c("COI_PLUS")]))
  diary$cat[diary$COI_PLUS %in% food_non_alc_hh_list] <- "food_non_alc_hh"
  diary$cat[diary$COI_PLUS %in% alc_tob_hh_list] <- "alc_tob_hh"
  diary$cat[diary$COI_PLUS %in% clot_foot_list] <- "clot_foot"
  diary$cat[diary$COI_PLUS %in% hh_services_list] <- "hh_services"
  diary$cat[diary$COI_PLUS %in% furniture_hh_goods_list] <- "furniture_hh_goods"
  diary$cat[diary$COI_PLUS %in% transport_list] <- "transport"
  diary$cat[diary$COI_PLUS %in% comms_list] <- "comms"
  diary$cat[diary$COI_PLUS %in% rec_cult_list] <- "rec_cult"
  diary$cat[diary$COI_PLUS %in% rest_hotel_list] <- "rest_hotel"
  diary$cat[diary$COI_PLUS %in% misc_goods_serv_list] <- "misc_goods_serv"
  diary$cat[is.na(diary$cat)] <- "other"
  format_rrcpl <- melt(rrcpl, id.vars=c("exp_reg"))
  format_rrcpl <- plyr::rename(format_rrcpl, c("variable" = "cat", "value" = "val_rrcpl"))
  diary <- merge(diary, format_rrcpl, by = c("exp_reg", "cat"))
  diary$exp_uk_std <- diary$pdamount/(diary$val_rrcpl/100.0)
  diary_out <- diary
  diary <- dcast(diary, id_hh_pers + Perstyp2~COI_PLUS, value.var = "exp_uk_std") ##cast diary - col per item, row per person
  diary[is.na(diary)] <- 0 # Set expenditure to 0 if NA
  
  
  for (i in reg_list) {
    reg_msim <- msim[which(msim[reg_col_name] == i),]
    print(paste("Zone ID = ", i))
    print(head(diary))
    print(head(reg_msim))
    reg_msim <- merge(reg_msim, diary[c(food_drink_tob_all_list, "id_hh_pers")], by= "id_hh_pers", all.x = TRUE) 
    print(dim(reg_msim))
    exp_reg_msim <- as.character(unique(reg_tab[which(reg_tab[reg_col_name] == i), "Region.name"]))
    print(paste("expenditure region = ", exp_reg_msim))
    reg_msim[food_drink_tob_all_list][is.na(reg_msim[food_drink_tob_all_list])] <- 0
    reg_msim[food_drink_tob_all_list][which(reg_msim$age_ori < 7)] <- 0
    reg_msim[food_drink_tob_all_list] <- reg_msim[food_drink_tob_all_list] * reg_msim$freq
    reg_msim <- merge(reg_msim, adult_child_exp_reg[,c("id_hh_pers", "plus_18", "age_ori")], by = "id_hh_pers", all.x = TRUE)
    reg_msim[which(reg_msim$age_ori < 7),food_drink_tob_all_list] <- 0 
    aggregate_sum_mnemonic <- aggregate(reg_msim[(c(food_drink_tob_all_list, "freq"))], list(reg_msim[,reg_col_name]),FUN= sum)
    rm(reg_msim)
    aggregate_sum_mnemonic[food_drink_tob_all_list] <- aggregate_sum_mnemonic[food_drink_tob_all_list] / aggregate_sum_mnemonic$freq
    food_non_alc_hh_rrcpl <- rrcpl[which(rrcpl$exp_reg == exp_reg_msim), "food_non_alc_hh"]
    alc_tob_rrcpl <- rrcpl[which(rrcpl$exp_reg == exp_reg_msim), "alc_tob_hh"]
    rest_hotel_rrcpl <- rrcpl[which(rrcpl$exp_reg == exp_reg_msim), "rest_hotel"]
    rec_cult_rrcpl <- rrcpl[which(rrcpl$exp_reg == exp_reg_msim), "rec_cult"]
    aggregate_sum_mnemonic[,which(colnames(aggregate_sum_mnemonic) %in% food_non_alc_hh_list)] <- aggregate_sum_mnemonic[,which(colnames(aggregate_sum_mnemonic) %in% food_non_alc_hh_list)] * (food_non_alc_hh_rrcpl/100.0)
    aggregate_sum_mnemonic[,which(colnames(aggregate_sum_mnemonic) %in% alc_tob_hh_list)] <- aggregate_sum_mnemonic[,which(colnames(aggregate_sum_mnemonic) %in% alc_tob_hh_list)] * (alc_tob_rrcpl/100.0)
    aggregate_sum_mnemonic[,which(colnames(aggregate_sum_mnemonic) %in% rest_hotel_list)] <- aggregate_sum_mnemonic[,which(colnames(aggregate_sum_mnemonic) %in% rest_hotel_list)] * (rest_hotel_rrcpl/100.0)
    aggregate_sum_mnemonic[,which(colnames(aggregate_sum_mnemonic) %in% rec_cult_list)] <- aggregate_sum_mnemonic[,which(colnames(aggregate_sum_mnemonic) %in% rec_cult_list)] * (rec_cult_rrcpl/100.0)
    final_mnemonic <-  rbind(aggregate_sum_mnemonic, final_mnemonic)
    rm(aggregate_sum_mnemonic)}
  return(final_mnemonic)}


##FORMAT DERIVED PERSON LEVEL SURVEY TABLE
format_dv_person <- function(dv_person){
  ##Generate unique ID for each 'person' - concatanate case (household number) and person within household
  person_dv$id_hh_pers <- as.numeric(paste(person_dv$case, person_dv$Person, sep="."))
  person_dv <- person_dv[ ,c("id_hh_pers","A200","A015", "A002", "A206", "P007p")]
  person_dv <- plyr::rename(person_dv, c("A200"="Employment_status", "A015" = "student", "A002" = "hrp_relation", "A206" = "Economic_pos", "P007p" = "gross_wage"))
  person_dv$Employment_status <- as.factor(revalue(person_dv$Employment_status,c("Out of employment, seeking work within last 4 weeks" = "unemp","Out of employment, waiting to start a job already obtained" = "unemp","Employee" = "not_unemp","Government scheme trainee" = "not_unemp","Not recorded" = "DELETE","Retired including Job Release Scheme" = "not_unemp","Self-employed or employer"= "not_unemp","Sick or injured" = "not_unemp","Unoccupied"= "not_unemp","Unemp about to work" = "unemp","Unemp seeking work" = "unemp","Retired" = "not_unemp","Self-employed" = "not_unemp","Sick" = "not_unemp","Out of employment, seeking work within last 4 weeks & available to start a job" = "unemp")))
  person_dv$student <- as.factor(revalue(person_dv$student, c( "Full-time education" = "stu"," Full-time education" = "stu", "Not recorded" = "DELETE","Other" = "non_stu","Retired / unoccupied and minimum NI age" = "non_stu","Retired / unoccupied & minimum NI age" = "non_stu","Ret unoc &min ni age" = "non_stu","Working" = "non_stu")))
  person_dv$Economic_pos <- as.factor(revalue(person_dv$Economic_pos, c("Full-time employee" = "ASHE_y","Part-time employee" = "ASHE_y","Retired/unoccupied and of minimum NI Pension age" = "ASHE_n","Ret unoc over min ni age" = "ASHE_n","Retired/unoccupied but under minimum NI Pension age" = "ASHE_n","Unoc - under min ni age" = "ASHE_n","Self-employed" = "ASHE_self","Unemployed" = "ASHE_n","Work related Government Training Programmes" = "ASHE_n","Work related govt train prog" = "ASHE_n","Not recorded" = "DELETE")))
  person_dv <- person_dv[!(person_dv$student == "DELETE" | person_dv$Employment_status == "DELETE" | person_dv$Economic_pos == "DELETE"),]
  person_dv[,c("student", "Employment_status")] = droplevels(person_dv[,c("student", "Employment_status")])
  return(person_dv)}

##PRODUCE FULL PERSON TABLE
prod_person <- function(format_raw_person, format_dv_person, survey_hh){
  person <- inner_join(format_raw_person, format_dv_person, by = "id_hh_pers")
  person <- inner_join(person, survey_hh[,c("case","weighta", "Gorx")], by="case")
  person$country[person$Gorx == "Scotland"] <- "Scotland"
  person$country[person$Gorx == "Northern Ireland"] <- "Northern Ireland"
  person$country[person$Gorx == "Wales"] <- "Wales"
  person$country[person$Gorx %in% eng_list] <- "England"
  person$exp_reg <- person$Gorx
  person$plus_18[person$age_ori >= 18] <- 1
  person$plus_18[person$age_ori < 18] <- 0
  person <- person[,c("age_gen", "Ethnic_gp", "Employment_status", "student","id_hh_pers", "case", "weighta", "Gorx", "country", "age_ori", "plus_18", "hrp_relation", "Economic_pos", "gross_wage", "exp_reg")]
  return(person)}

## PRODUCE PERSON MS
prod_person_ms <- function(full_person){
  rownames(full_person) <- full_person$id_hh_pers
  person_ms <- full_person[,c("age_gen", "Ethnic_gp", "hrs_wk_bin", "Employment_status", "student")]
  return(person_ms)}

##FORMAT COMMUNAL EW
format_comm_ew <- function(comm_ew){
  for (gen in c("M","F")){
    comm_ew[,paste(gen,"_16_24_c", sep = "")] <- rowSums(comm_ew[,c((paste(gen,"_Age.16.to.17", sep = "")),
                                                                    (paste(gen,"_Age.18.to.19", sep = "")),
                                                                    (paste(gen,"_Age.20.to.24", sep = "")))])
    comm_ew[,paste(gen,"_25_34_c", sep = "")] <- rowSums(comm_ew[,c((paste(gen,"_Age.25.to.29", sep = "")),
                                                                    (paste(gen,"_Age.30.to.34", sep = "")))])
    comm_ew[,paste(gen,"_35_49_c", sep = "")] <- rowSums(comm_ew[,c((paste(gen,"_Age.35.to.39", sep = "")),
                                                                    (paste(gen,"_Age.40.to.44", sep = "")),
                                                                    (paste(gen,"_Age.45.to.49", sep = "")))])
    comm_ew[,paste(gen,"_50_64_c", sep = "")] <- rowSums(comm_ew[,c((paste(gen,"_Age.50.to.54", sep = "")),
                                                                    (paste(gen,"_Age.55.to.59", sep = "")),
                                                                    (paste(gen,"_Age.60.to.64", sep = "")))])
    comm_ew[,paste(gen,"_65_74_c", sep = "")] <- rowSums(comm_ew[,c((paste(gen,"_Age.65.to.69", sep = "")),
                                                                    (paste(gen,"_Age.70.to.74", sep = "")))])
    comm_ew[,paste(gen,"_75_pl_c", sep = "")] <- rowSums(comm_ew[,c((paste(gen,"_Age.75.to.79", sep = "")),
                                                                    (paste(gen,"_Age.80.to.84", sep = "")),    
                                                                    (paste(gen,"_Age.85.and.over", sep = "")))])
    comm_ew[,paste(gen,"_0_15_c", sep = "")] <- comm_ew[,paste(gen,"_Age_0_15", sep = "")]}
  comm_ew$total_0_pl_c <- comm_ew$M_Age_0_pl + comm_ew$F_Age_0_pl
  comm_ew <- comm_ew[,c("mnemonic", "F_16_24_c", "F_25_34_c", "F_35_49_c", "F_50_64_c", "F_65_74_c", "F_75_pl_c", "M_16_24_c", "M_25_34_c", "M_35_49_c", "M_50_64_c", "M_65_74_c", "M_75_pl_c", "total_0_pl_c", "M_0_15_c", "F_0_15_c")]
  return(comm_ew)}

##FORMAT COMMUNAL NI
format_comm_ni <- function(comm_ni){
  reg_list <- unique(comm_ni$mnemonic)
  ni_comm_df1 <- data.frame()
  for (i in 1:length(reg_list)){
    reg <- reg_list[i]
    ni_comm_df1[i,"mnemonic"] <- as.character(reg)
    for (gender in (c("Males", "Females"))){
      l1 <- str_sub(gender, end= 1)
      ni_comm_df1[i,paste(l1,"0_15_c",sep = "_")] <- comm_ni[which(comm_ni$mnemonic == reg & comm_ni$gender == gender),"x0_15"]
      ni_comm_df1[i,paste(l1,"16_24_c",sep = "_")] <- comm_ni[which(comm_ni$mnemonic == reg & comm_ni$gender == gender),"x16_24"]
      ni_comm_df1[i,paste(l1,"25_34_c",sep = "_")] <- comm_ni[which(comm_ni$mnemonic == reg & comm_ni$gender == gender),"x25_34"]
      ni_comm_df1[i,paste(l1,"35_49_c",sep = "_")] <- comm_ni[which(comm_ni$mnemonic == reg & comm_ni$gender == gender),"x35_49"]
      ni_comm_df1[i,paste(l1,"50_64_c",sep = "_")] <- comm_ni[which(comm_ni$mnemonic == reg & comm_ni$gender == gender),"x50_64"]
      ni_comm_df1[i,paste(l1,"65_74_c",sep = "_")] <- comm_ni[which(comm_ni$mnemonic == reg & comm_ni$gender == gender),"x65_74"]
      ni_comm_df1[i,paste(l1,"75_pl_c",sep = "_")] <- comm_ni[which(comm_ni$mnemonic == reg & comm_ni$gender == gender),"x75_pl"]}
    ni_comm_df1[i,"total_0_pl_c"] <- rowSums(ni_comm_df1[which(ni_comm_df1$mnemonic == reg),c("M_0_15_c",
                                                                                              "M_16_24_c",
                                                                                              "M_25_34_c", 
                                                                                              "M_35_49_c",
                                                                                              "M_50_64_c",
                                                                                              "M_65_74_c", 
                                                                                              "M_75_pl_c",
                                                                                              "F_0_15_c",
                                                                                              "F_16_24_c", 
                                                                                              "F_25_34_c",
                                                                                              "F_35_49_c",
                                                                                              "F_50_64_c",
                                                                                              "F_65_74_c",
                                                                                              "F_75_pl_c")])}
  return(ni_comm_df1)}

##FORMAT COMMUNAL SCOTLAND                                                               
format_comm_sc <- function(comm_sc){
  comm_sc$mnemonic <- gsub(' ', '', comm_sc$mnemonic)
  for (gen in c("Males","Females")){
    if (gen == "Males"){
      gen_out <- "M"
    } else{
      gen_out <- "F"
    }
    comm_sc[,paste(gen_out,"_16_24_c", sep = "")] <- comm_sc[,c((paste(gen,".in.communal.establishments..16.to.24", sep = "")))]
    comm_sc[,paste(gen_out,"_25_34_c", sep = "")] <- comm_sc[,c((paste(gen,".in.communal.establishments..25.to.34", sep = "")))]
    comm_sc[,paste(gen_out,"_35_49_c", sep = "")] <- comm_sc[,c((paste(gen,".in.communal.establishments..35.to.49", sep = "")))]
    comm_sc[,paste(gen_out,"_50_64_c", sep = "")] <- comm_sc[,c((paste(gen,".in.communal.establishments..50.to.64", sep = "")))]                                                            
    comm_sc[,paste(gen_out,"_65_74_c", sep = "")] <- comm_sc[,c((paste(gen,".in.communal.establishments..65.to.74", sep = "")))]
    comm_sc[,paste(gen_out,"_75_pl_c", sep = "")] <- rowSums(comm_sc[,c((paste(gen,".in.communal.establishments..75.to.84", sep = "")),
                                                                        (paste(gen,".in.communal.establishments..85.and.over", sep = "")))])
    comm_sc[,paste(gen_out,"_0_15_c", sep = "")] <- comm_sc[,c((paste(gen,".in.communal.establishments..0.to.15", sep = "")))]}
  comm_sc$total_0_pl_c <- comm_sc[,"All.people.in.communal.establishments..Total"] - comm_sc[,"All.people.in.communal.establishments..Staff.or.owner.or.family.member.or.partner.of.staff.or.owner"] 
  comm_sc <- comm_sc[,c("mnemonic", "F_16_24_c", "F_25_34_c", "F_35_49_c", "F_50_64_c", "F_65_74_c", "F_75_pl_c", "M_16_24_c", "M_25_34_c", "M_35_49_c", "M_50_64_c", "M_65_74_c", "M_75_pl_c", "total_0_pl_c", "M_0_15_c", "F_0_15_c")]
  return(comm_sc)}

##FORMAT COMMUNAL STUDENTS EW
format_comm_stu_ew <- function(comm_stu_ew){
  comm_stu_ew$comm_stu  <- rowSums(comm_stu_ew[,c("Age.16.to.17", "Age.18.to.19", "Age.20.to.24", "Age.25.and.over")] )
  comm_stu_ew <- comm_stu_ew[,c("mnemonic","comm_stu")]
  return(comm_stu_ew)}

##FORMAT COMMUNAL STUDENTS SCOTLAND
format_comm_stu_sc <- function(comm_stu_sc){
  comm_stu_sc$mnemonic <- gsub(' ', '', comm_stu_sc$mnemonic)
  col_names <- c("All.people.in.communal.establishments..16.to.24",
                 "All.people.in.communal.establishments..25.to.34",
                 "All.people.in.communal.establishments..35.to.49",
                 "All.people.in.communal.establishments..50.to.64",
                 "All.people.in.communal.establishments..65.to.74",
                 "All.people.in.communal.establishments..75.to.84",
                 "All.people.in.communal.establishments..85.and.over")
  comm_stu_sc$comm_stu  <- rowSums(comm_stu_sc[,col_names])
  comm_stu_sc <- comm_stu_sc[,c("mnemonic","comm_stu")] 
  return(comm_stu_sc)}

##CALCULATE NON COMMUNAL STUDENTS
calc_nc_stu <- function(stu_formatted, comm_ew_stu_formatted, comm_sc_stu_formatted, age_gen_formatted){
  #append England/Wales an Scotland communal students
  comm_all_stu <- rbind(comm_ew_stu_formatted, comm_sc_stu_formatted)
  comm_all_stu <- inner_join(comm_all_stu, stu_formatted, by = "mnemonic")
  comm_all_stu$nc_stu <- comm_all_stu$student - comm_all_stu$comm_stu
  comm_all_stu$nc_stu[comm_all_stu$nc_stu <0] <- 0
  comm_all_stu <- inner_join(comm_all_stu[,c("mnemonic", "nc_stu")], age_gen_formatted[,c("mnemonic","total_16_pl")], by = "mnemonic")
  comm_all_stu$nc_not_stu <- comm_all_stu$total_16_pl - comm_all_stu$nc_stu
  comm_all_stu[,c("nc_stu", "nc_not_stu")] <- comm_all_stu[,c("nc_stu", "nc_not_stu")] /rowSums(comm_all_stu[,c("nc_stu", "nc_not_stu")])
  comm_all_stu$total_16_pl <- NULL
  return(comm_all_stu)}

##CALCULATE NON COMMUNAL POPULATIONS                              
calc_nc_pop <-  function(format_comm_ew, format_comm_sc, format_comm_ni, age_gen_formatted){
  comm_all_pop <- rbind.fill(format_comm_ew, format_comm_sc, format_comm_ni)
  merge_pops <- inner_join(age_gen_formatted, comm_all_pop, by = "mnemonic")
  new_comm_cols <- c()
  for (age_gp in age_gps){
    nc_age_gp <- paste(age_gp,"_nc", sep = "")
    merge_pops[,nc_age_gp] <- merge_pops[,paste(age_gp, sep = "")] - merge_pops[,paste(age_gp,"_c", sep = "")]
    new_comm_cols <- append(new_comm_cols, nc_age_gp)}
  
  for (age_gp_u16 in age_gps_u16){
    nc_age_gp <- paste(age_gp_u16,"_nc", sep = "")
    new_comm_cols <- append(new_comm_cols, nc_age_gp)
    if (substring(nc_age_gp, 1, 1) == "M"){
      merge_pops[,nc_age_gp] <- round(merge_pops[,age_gp_u16] * (1 - (merge_pops$M_0_15_c/merge_pops$M_0_15_total)), digits = 0)
    } else {
      merge_pops[,nc_age_gp] <- round(merge_pops[,age_gp_u16] * (1 - (merge_pops$F_0_15_c/merge_pops$F_0_15_total)), digits = 0)}}
  merge_pops$total_16_pl_nc <- rowSums(merge_pops[,c("F_16_24_nc", "F_25_34_nc", "F_35_49_nc", "F_50_64_nc", "F_65_74_nc", "F_75_pl_nc", "M_16_24_nc", "M_25_34_nc", "M_35_49_nc", "M_50_64_nc", "M_65_74_nc", "M_75_pl_nc")])
  merge_pops$total_0_15_nc <- merge_pops$total_0_pl_nc - merge_pops$total_16_pl_nc
  merge_pops <- merge_pops[,c("mnemonic",new_comm_cols, "total_16_pl_nc", "total_0_15_nc", "Region.name")]
  merge_pops[,new_comm_cols][merge_pops[,new_comm_cols] <0] <- 0
  return(merge_pops)} 

##CONVERT PROPORTIONS TO TOTALS
props_to_counts <- function(prop_df, comm_pop){
  prop_col_names <- colnames(prop_df[,!(colnames(prop_df) == "mnemonic")])
  count_comm <- inner_join(prop_df,comm_pop[,c("mnemonic", "total_16_pl_nc")], by = "mnemonic")
  new_prop_cols <- c()
  for (col in prop_col_names[1:(length(prop_col_names)-1)]){
    count_comm_name <- paste(col,"_nc_ct", sep = "")
    count_comm[,count_comm_name] <- round((count_comm[,col] * count_comm$total_16_pl_nc), digits = 0)
    new_prop_cols <- append(new_prop_cols,count_comm_name)}
  last_col_name <- paste(prop_col_names[length(prop_col_names)], "_nc_ct", sep = "")
  count_comm[,last_col_name] <- count_comm$total_16_pl_nc - (rowSums(count_comm[,new_prop_cols, drop=FALSE]))
  count_comm <- count_comm[,c("mnemonic", new_prop_cols, last_col_name)]
  return(count_comm)}

prod_cons_ms <- function(full_cons){
  ##rownames(full_cons) <- full_cons$mnemonic
  cons_ms <- plyr::rename(full_cons, c("F_16_24_nc" = "F_16_24",
                                       "F_25_34_nc" = "F_25_34",
                                       "F_35_49_nc" = "F_35_49",
                                       "F_50_64_nc" = "F_50_64",
                                       "F_65_74_nc" = "F_65_74",
                                       "F_75_pl_nc" = "F_75_pl",
                                       "M_16_24_nc" = "M_16_24",
                                       "M_25_34_nc" = "M_25_34",
                                       "M_35_49_nc" = "M_35_49",
                                       "M_50_64_nc" = "M_50_64",
                                       "M_65_74_nc" = "M_65_74",
                                       "M_75_pl_nc" = "M_75_pl",
                                       
                                       "black_nc_ct" = "eth_black",
                                       "mixed_nc_ct" = "eth_mixed",
                                       "other_nc_ct" = "eth_other",
                                       
                                       "white_nc_ct" = "eth_white",
                                       
                                       "unemp_nc_ct" = "unemp",
                                       "not_unemp_nc_ct" = "not_unemp",
                                       
                                       "nc_stu_nc_ct" = "stu",
                                       "nc_not_stu_nc_ct" = "non_stu",
                                       
                                       "A_16_24_dep_n_nc_ct" = "A_16_24_dep_n",
                                       "A_16_24_dep_y_nc_ct" = "A_16_24_dep_y",
                                       "A_25_34_dep_n_nc_ct" = "A_25_34_dep_n",
                                       "A_25_34_dep_y_0_4_nc_ct" = "A_25_34_dep_y_0_4",
                                       "A_25_34_dep_y_5_10_nc_ct" = "A_25_34_dep_y_5_10",
                                       "A_25_34_dep_y_11_pl_nc_ct" = "A_25_34_dep_y_11_pl",
                                       
                                       "A_35_54_dep_n_nc_ct" = "A_35_54_dep_n",
                                       "A_35_54_dep_y_0_4_nc_ct"="A_35_54_dep_y_0_4",
                                       "A_35_54_dep_y_5_10_nc_ct" ="A_35_54_dep_y_5_10",
                                       "A_35_54_dep_y_11_pl_nc_ct" = "A_35_54_dep_y_11_pl",
                                       
                                       "A_55_64_sph_nc_ct" =  "A_55_64_sph",
                                       "A_55_64_mph_dep_n_nc_ct" = "A_55_64_mph_dep_n",
                                       "A_55_74_mph_dep_y_nc_ct" = "A_55_74_mph_dep_y",
                                       "A_65_74_sph_nc_ct" = "A_65_74_sph",
                                       "A_65_74_mph_dep_n_nc_ct" = "A_65_74_mph_dep_n",
                                       
                                       "A_75_pl_sph_nc_ct" = "A_75_pl_sph",
                                       "A_75_pl_mph_nc_ct" = "A_75_pl_mph"))
  cons_ms <- cons_ms[,c("F_16_24", "F_25_34", "F_35_49", "F_50_64", "F_65_74", "F_75_pl",
                        "M_16_24", "M_25_34", "M_35_49", "M_50_64", "M_65_74", "M_75_pl",
                        "eth_black", "eth_mixed",  "eth_other","eth_white",
                        
                        "not_unemp", "unemp",
                        "stu",   "non_stu",
                        
                        
                        "A_16_24_dep_n",
                        "A_16_24_dep_y",
                        "A_25_34_dep_n",
                        "A_25_34_dep_y_0_4",
                        "A_25_34_dep_y_11_pl",
                        "A_25_34_dep_y_5_10",
                        "A_35_54_dep_n",
                        "A_35_54_dep_y_0_4",
                        "A_35_54_dep_y_11_pl",
                        "A_35_54_dep_y_5_10",
                        "A_55_64_mph_dep_n",
                        "A_55_74_mph_dep_y",
                        "A_55_64_sph",
                        "A_65_74_mph_dep_n",
                        
                        "A_65_74_sph",
                        "A_75_pl_mph",
                        "A_75_pl_sph",
                        
                        "mnemonic",
                        
                        "Region.name")]
  
  
  is.nan.data.frame <- function(x)
    do.call(cbind, lapply(x, is.nan))
  cons_ms[is.nan(cons_ms)] <- 0
  return (cons_ms)}

prod_cons_child_ms <- function(full_cons){
  
  cons_child_ms <- plyr::rename(full_cons, c(
    "F_0_9_nc" = "F_0_9",
    "M_0_9_nc" = "M_0_9",
    
    "F_10_15_nc" = "F_10_15",
    
    "M_10_15_nc" = "M_10_15"))
  
  
  #cons_child_ms$F_0_9 <- cons_child_ms$F_0_4 + cons_child_ms$F_5_9
  #cons_child_ms$M_0_9 <- cons_child_ms$M_0_4 + cons_child_ms$M_5_9
  cons_child_ms <- cons_child_ms[,c("F_0_9", "F_10_15", "M_0_9", "M_10_15", "mnemonic","Region.name")]
  
  is.nan.data.frame <- function(x)
    do.call(cbind, lapply(x, is.nan))
  cons_child_ms[is.nan(cons_child_ms)] <- 0
  
  return (cons_child_ms)}

##VARIABLE CHECK TABLE
var_chk <- function(comm_pop, eth_nc, hrs_nc, unemp_nc, nc_stu_nc){
  comm_pop$comm_pop_p <- "y"
  eth_nc$eth_nc_p <- "y"
  hrs_nc$hrs_nc_p <- "y"
  unemp_nc$unemp_nc_p <- "y"
  nc_stu_nc$nc_stu_nc_p <- "y"
  chk <- join_all(list(comm_pop[,c("mnemonic","comm_pop_p"), drop = F],
                       eth_nc[,c("mnemonic", "eth_nc_p"), drop = F], 
                       hrs_nc[,c("mnemonic","hrs_nc_p"), drop = F], 
                       unemp_nc[,c("mnemonic","unemp_nc_p"), drop = F], 
                       nc_stu_nc[,c("mnemonic","nc_stu_nc_p"), drop = F]), by='mnemonic', type='full')
  chk[is.na(chk)] <- "n"
  return(chk)
}


##FORMAT EMPLOYMENT STATUS/INCOME
format_emp_status <- function(emp_stat, comm_pop, income_ori){
  emp_stat <- plyr::rename(emp_stat, c("T01.1..All.aged.16...over...All...All.People.." = "all", "T01.10..All.aged.16...over...Employees...All.People.." = "employees", "T01.13..All.aged.16...over...Self.Employed...All.People.." = "self_emp"))
  sel_cols <- c("mnemonic","all","employees","self_emp")
  emp_stat <- emp_stat[which(emp_stat$year == year),sel_cols]
  
  emp_stat <- emp_stat[rowSums((emp_stat == "!") | rowSums(emp_stat == "-") | rowSums(emp_stat == "*") | rowSums(emp_stat == "~"))==0,, drop = F]
  
  emp_stat$employee_prop <- as.numeric(emp_stat$employees)/as.numeric(emp_stat$all)
  emp_stat$self_emp_prop <- as.numeric(emp_stat$self_emp)/as.numeric(emp_stat$all)
  emp_stat$other_prop <- 1 - emp_stat$employee_prop - emp_stat$self_emp_prop
  emp_stat <- emp_stat[,c("mnemonic", "employee_prop", "self_emp_prop", "other_prop")]
  emp_stat <- props_to_counts(emp_stat, comm_pop)
  income_ori <- income_ori[which(income_ori$year == year), c("mnemonic", income_cols)]
  income_ori <- merge(income_ori, emp_stat, by = "mnemonic")
  income_ori <- plyr::rename(income_ori, c("employee_prop_nc_ct" = "employees", "self_emp_prop_nc_ct" = "self_emp", "other_prop_nc_ct" = "other"))
  return(income_ori)}


percent_calc <- function(income_reg, percentile){
  print (paste(percentile, "available"))
  diff_per <- percentile - st_per
  c_name <- paste("c_",st_per,"_",percentile, sep = '')
  income_reg[,c_name] <- income_reg$employees * (diff_per/100)
  return(income_reg)}

gen_inc_labs <- function(percentile){
  c_name <- paste("c_",st_per,"_",percentile, sep = '')
  inc_labs <- c(inc_labs, c_name)
  return(inc_labs)}

check_regs <- function(df, reg_field, regs_list){
  if (any(df[,reg_field] ==  "East")){
    print ("East name issue")
    df[,reg_field] <- revalue(df[,reg_field], c("East" = "Eastern"))}
  if (any(df[,reg_field] ==  "North West")){
    print ("NW name issue 1")
    df[,reg_field] <- revalue(df[,reg_field], c("North West" = "North West & Merseyside"))}
  
  if (any(df[,reg_field] ==  "Yorkshire and The Humber")){
    print ("Yorkshire name issue")
    df[,reg_field] <- revalue(df[,reg_field], c("Yorkshire and The Humber" = "Yorkshire and the Humber"))}
  
  if (any(df[,reg_field] ==  "North West and Merseyside")){
    print ("NW name issue 2")
    df[,reg_field] <- revalue(df[,reg_field], c("North West and Merseyside" = "North West & Merseyside"))}
  
  if (all(df[,reg_field] %in% regs_list)== TRUE){
    print ("region names ok")}
  else{stop('region error')}
  return(df)}

# Functions useful for spatial microsimulation
# What others would be useful?
# Could any of these be improved?
# Let me know if so - rob00x@gmail.com

# 'Proportional probabilities' (PP) method of integerisation
# (see http://www.sciencedirect.com/science/article/pii/S0198971513000240):
int_pp <- function(x){
  xv <- as.vector(x)
  xint <- rep(0, length(x))
  xs <- sample(length(x), size = round(sum(x)), prob = x, replace = T)
  xsumm <- summary(as.factor(xs))
  topup <- as.numeric(names(xsumm))
  xint[topup] <- xsumm
  dim(xint) <- dim(x)
  xint
}

# 'Truncate, replicate, sample' (TRS) method of integerisation
# (see http://www.sciencedirect.com/science/article/pii/S0198971513000240):
int_trs <- function(x){
  xv <- as.vector(x)
  xint <- floor(xv)
  r <- xv - xint
  def <- round(sum(r)) # the deficit population
  # the weights be 'topped up' (+ 1 applied)
  topup <- sample(length(x), size = def, prob = r)
  xint[topup] <- xint[topup] + 1
  dim(xint) <- dim(x)
  dimnames(xint) <- dimnames(x)
  xint
}

int_expand_vector <- function(x){
  index <- 1:length(x)
  rep(index, round(x))
}

int_expand_array <- function(x){
  # Transform the array into a dataframe
  count_data <- as.data.frame.table(x)
  # Store the indices of categories for the final population
  indices <- rep(1:nrow(count_data), count_data$Freq)
  # Create the final individuals
  ind_data <- count_data[indices,]
  ind_data
}



# Total absolute error
tae <- function(observed, simulated){
  obs_vec <- as.numeric(observed)
  sim_vec <- as.numeric(simulated)
  sum(abs(obs_vec - sim_vec))
}

# Number of times each unique matrix row appears
umat_count <- function(x) {
  xp <- apply(x, 1, paste0, collapse = "") # "pasted" version of constraints
  freq <- table(xp) # frequency of occurence of each individual
  xu <- unique(x) # save only unique individuals
  rns <- as.integer(row.names(xu)) # save the row names of unique values of ind
  xpu <- xp[rns]
  o <- order(xpu, decreasing = TRUE) # the order of the output (to rectify table)
  cbind(xu, data.frame(ind_num = freq[o], rns = rns)) # output
}

# Generates list of outputs - requires dplyr
umat_count_dplyr <- function(x){
  x$p <- apply(x, 1, paste0, collapse = "")
  up <- data.frame(p = unique(x$p)) # unique values in order they appeared
  y <- dplyr::count(x, p) # fast freq table
  umat <- inner_join(up, y) # quite fast
  umat <- join(umat, x, match = "first")
  list(u = umat, p = x$p) # return unique individuals and attributes
}


tae <- function(observed, simulated){
  obs_vec <- as.numeric(observed)
  sim_vec <- as.numeric(simulated)
  sum(abs(obs_vec - sim_vec))
}



grid_arrange_shared_legend <- function(...) {
  plots <- list(...)
  g <- ggplotGrob(plots[[1]] + theme(legend.position="bottom"))$grobs
  legend <- g[[which(sapply(g, function(x) x$name) == "guide-box")]]
  lheight <- sum(legend$height)
  grid.arrange(
    do.call(arrangeGrob, lapply(plots, function(x)
      x + theme(legend.position="none"))),
    legend,
    ncol = 1,
    heights = unit.c(unit(1, "npc") - lheight, lheight))}

g_legend <- function(a.gplot){
  tmp <- ggplot_gtable(ggplot_build(a.gplot))
  leg <- which(sapply(tmp$grobs, function(x) x$name) == "guide-box")
  legend <- tmp$grobs[[leg]]
  return(legend)}


##for (year in c("2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2015", "2016")){
for (year in c("2012")){
  if (year == "2008"){
    ##FOR 2008
    setwd("Z:/earwj/pigsustain/data/lcfs_2008")
    year <- "2008"
    diary <- read.csv("2008_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    raw_person <- read.csv("2008_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    person_dv <- read.csv("2008_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    survey_hh <- read.csv("2008_dvhh_ukanon.csv", header=TRUE, na.strings=".")}
  
  if (year == "2009"){
    ##FOR 2009
    setwd("Z:/earwj/pigsustain/data/lcfs_2009")
    year <- "2009"
    diary <- read.csv("2009_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    raw_person <- read.csv("2009_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    person_dv <- read.csv("2009_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    survey_hh <- read.csv("2009_dvhh_ukanon.csv", header=TRUE, na.strings=".")}
  
  if (year == "2010"){
    ##FOR 2010
    setwd("Z:/earwj/pigsustain/data/lcfs_2010")
    year <- "2010"
    diary <- read.csv("2010_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    raw_person <- read.csv("2010_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    person_dv <- read.csv("2010_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    survey_hh <- read.csv("2010_dvhh_ukanon.csv", header=TRUE, na.strings=".")} 
  
  if (year == "2011"){
    ##FOR 2011
    setwd("Z:/earwj/pigsustain/data/lcfs_2011")
    year <- "2011"
    diary <- read.csv("2011_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    raw_person <- read.csv("2011_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    person_dv <- read.csv("2011_dvper_ukanon_v2.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    survey_hh <- read.csv("2011_dvhh_ukanon.csv", header=TRUE, na.strings=".")} 
  
  if (year == "2012"){
    ##FOR 2012
    setwd("Z:/earwj/pigsustain/data/lcfs_2012")
    year <- "2012"
    diary <- read.csv("2012_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    raw_person <- read.csv("2012_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    person_dv <- read.csv("2012_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    survey_hh <- read.csv("2012_dvhh_ukanon.csv", header=TRUE, na.strings=".")}
  
  if (year == "2013"){
    ##FOR 2013
    setwd("Z:/earwj/pigsustain/data/lcfs_2013")
    year <- "2013"
    diary <- read.csv("2013_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    raw_person <- read.csv("2013_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    person_dv <- read.csv("2013_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    survey_hh <- read.csv("2013_dvhh_ukanon.csv", header=TRUE, na.strings=".")}
  
  if (year == "2014"){
    ##FOR 2014
    setwd("Z:/earwj/pigsustain/data/lcfs_2014")
    year <- "2014"
    diary <- read.csv("2014_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    raw_person <- read.csv("2014_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    person_dv <- read.csv("2014_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    survey_hh <- read.csv("2014_dvhh_ukanon.csv", header=TRUE, na.strings=".")}
  
  if (year == "2015"){
    ##FOR 2015
    setwd("Z:/earwj/pigsustain/data/lcfs_2015_2016")
    year <- "2015"
    diary_1516 <- read.csv("2015-16_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    raw_person_1516 <- read.csv("2015-16_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    pers_dv_1516 <- read.csv("2015-16_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    hh_1516 <- read.csv("2015-16_dvhh_ukanon.csv", header=TRUE, na.strings=".") 
    
    diary_q1 <- read.csv("2015_quarter_1_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    raw_person_q1 <- read.csv("2015_quarter_1_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    pers_dv_q1 <- read.csv("2015_quarter_1_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    hh_q1 <-  read.csv("2015q1_dvhh_ukanon.csv", header=TRUE, na.strings=".") 
    names(diary_q1)[names(diary_q1) == 'case1'] <- 'case' ##rename from case1 to case for consistency 
    names(raw_person_q1)[names(raw_person_q1) == 'case1'] <- 'case'##rename from case1 to case for consistency 
    names(pers_dv_q1)[names(pers_dv_q1) == 'case1'] <- 'case'##rename from case1 to case for consistency 
    names(hh_q1)[names(hh_q1) == 'case1'] <- 'case'##rename from case1 to case for consistency 
    
    hh_15 <- hh_1516[hh_1516$A099 %in% c("April to June", "July to September", "October to December"),] ## remove jan-march (2016) values
    case15 <- hh_15$case  ##list of hh for 2015 only 
    pers_dv_15 <- pers_dv_1516[which(pers_dv_1516$case %in% case15 ),] ##subset to only include 2015 values
    pers_raw_15 <- raw_person_1516[which(raw_person_1516$case %in% case15 ),] ##subset to only include 2015 values
    diary_15 <- diary_1516[which(diary_1516$case%in% case15),] ##subset to only include 2015 values
    survey_hh <- rbind.fill(hh_15, hh_q1) ##FINAL DERIVED HOUSEHOLD DATSET 2015
    person_dv  <- rbind.fill(pers_dv_15, pers_dv_q1) ##FINAL DERIVED PERSON DATASET 2015
    raw_person <- rbind.fill(pers_raw_15, raw_person_q1) ## FINAL RAW PERSON DATASET 2015
    diary <- rbind.fill(diary_15, diary_q1)} ##FINAL DAIRY DATASET 2015
  
  if (year == "2016"){
    ##FOR 2016
    setwd("Z:/earwj/pigsustain/data/lcfs_2016_2017")
    year <- "2016"
    diary_1617 <- read.csv("2016_17_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    raw_person_1617 <- read.csv("2016_17_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    pers_dv_1617 <- read.csv("2016_17_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    hh_1617 <- read.csv("2016_17_dvhh_ukanon.csv", header=TRUE, na.strings=".", fileEncoding="UTF-8-BOM") 
    
    hh_16 <- hh_1617[hh_1617$A099 %in% c("April to June", "July to September", "October to December"),] ## remove jan-march (2017) values
    case16 <- hh_16$case  ##list of hh for 2016 only
    pers_dv_16 <- pers_dv_1617[which(pers_dv_1617$case %in% case16 ),] ##subset to only include 2016 value
    pers_raw_16 <- raw_person_1617[which(raw_person_1617$case %in% case16 ),] ##subset to only include 2015 values
    diary_16 <- diary_1617[which(diary_1617$case%in% case16),] ##subset to only include 2016 values
    
    setwd("Z:/earwj/pigsustain/data/lcfs_2015_2016")
    hh_1516 <- read.csv("2015-16_dvhh_ukanon.csv", header=TRUE, na.strings=".") 
    pers_dv_1516 <- read.csv("2015-16_dvper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    raw_person_1516 <- read.csv("2015-16_rawper_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM")
    diary_1516 <- read.csv("2015-16_dv_set89_ukanon.csv", header=TRUE, na.strings=".",fileEncoding="UTF-8-BOM") 
    
    hh_16_q1 <- hh_1516[hh_1516$A099 %in% c("January to March"),] ## select Jan - March only
    case16_q1 <- hh_16_q1$case
    pers_dv_16_q1 <- pers_dv_1516[which(pers_dv_1516$case %in% case16_q1),] ##subset to only include 2016 q1 values
    pers_raw_16_q1 <- raw_person_1516[which(raw_person_1516$case %in% case16_q1 ),] ##subset to only include 2016 q1 values
    diary_16_q1 <- diary_1516[which(diary_1516$case%in% case16_q1),] ##subset to only include 2015 values
    
    pers_dv_16_q1$case <- pers_dv_16_q1$case + 7000
    pers_raw_16_q1$case <- pers_raw_16_q1$case + 7000
    diary_16_q1$case <- diary_16_q1$case + 7000
    hh_16_q1$case <- hh_16_q1$case + 7000
    
    survey_hh <- rbind.fill(hh_16, hh_16_q1) ##FINAL DERIVED HOUSEHOLD DATSET 2016
    person_dv  <- rbind.fill(pers_dv_16, pers_dv_16_q1) ##FINAL DERIVED PERSON DATASET 2016
    raw_person <- rbind.fill(pers_raw_16, pers_raw_16_q1) ## FINAL RAW PERSON DATASET 2016
    diary <- rbind.fill(diary_16, diary_16_q1)} ##FINAL DAIRY DATASET 2016


    
  
  setwd("Z:/earwj/pigsustain/data")
  source("Z:/earwj/pigsustain/code/functions_13_8.R")
  
  age_sex <- read.csv("mid_year_pop_estimates/single_table/single_yrs_all.csv", stringsAsFactors=F)  ## Number of people per LA by age (single yrs) and gender. All LAs, annual
  
  comm_ew <- read.csv("communal/communal_ew_mod.csv", stringsAsFactors=F)                   ## Number of communal residents per LA by age and gender for England and Wales - 2011 values
  comm_sc <- read.csv("communal/communal_scotland_transposed_all.csv", stringsAsFactors=F)  ## Number of communal residents per LA by age and gender for Scotland - 2011 values
  comm_ni <- read.csv("communal/communal_ni_mod2.csv", stringsAsFactors=F)                   ## Number of communal residents per LA by age and gender for NI - 2011 values
  
  comm_stu_ew <- read.csv("communal/communal_ew_students_mod.csv", stringsAsFactors=F)               ## Number of students living in halls per LA by age for England and Wales - 2011 values
  comm_stu_sc <- read.csv("communal/communal_scotland_transposed_education.csv", stringsAsFactors=F) ## Number of students living in halls per LA by age for Scotland - 2011 values
  
  unemployment <- read.csv("unemployment/unemployment_jan_dec_formatted.csv", stringsAsFactors=F)   ## Number of unemployed per LA (16+) - annual
  education <- read.csv("education/all_education_jan_dec_mod.csv", stringsAsFactors=F)              ## Number of students per LA (16+) - annual
  
  ethnic <- read.csv("annual_pop_survey/ethnic_all_mod.csv", stringsAsFactors=F)  ## Number of people (16 +) by ethnicity per LA - annual
  hh_char <- read.csv("hh_char/ew_sc_merge_mod2.csv", stringsAsFactors=F)         ## Number of people (16+ in households) by 'household characteristics' per LA - 2011 values
  income_ori <- read.csv("income/income_v2_mod.csv", stringsAsFactors=F)          ## Income percentiles per LA - annual
  emp_stat <- read.csv("income/employment_status_mod.csv", stringsAsFactors=F)    ## Number of people by employment status by LA - annual
  
  reg_tab <- read.csv("lookup_tables/la_dist_to_region_EWS/ewlatoregionlookup2014_tcm77-407700.csv", header=TRUE) ## Lookup table - region (and 'expenditure region') of each LA 
  
  eng_list <- c("North East","Eastern","East Midlands","London","North West & Merseyside","South East","South West","West Midlands","Yorkshire and the Humber") ## Regions belonging to England
  
  
  #### FORMAT INITIAL LCFS DATASETS ####
  
  product_ids <- unique(diary$COI_PLUS)  ## List of all products in diary
  diary$id_hh_pers <- as.numeric(paste(diary$case, diary$Person, sep="."))            ## Generate unique ID for each 'person' - concatanate case (household number) and person within household
  id_hh_pers_list <- unique(diary$id_hh_pers[which(diary$Perstyp2 == "Adult")])       ## List of all adults (16+) with a diary entry
  id_hh_pers_child_list <- unique(diary$id_hh_pers[which(diary$Perstyp2 == "Child")]) ## List of all children (7 - 15) with a diary entry
  
  raw_per_formatted <- format_raw_person(raw_person)        ##Generate table of all those 16+ with variables of gender, ethnicity, age (grouped), age (original) and age/gender
  raw_child_formatted <- format_raw_child(raw_person)       ##Generate table of all those 0 - 15 with variables of dender, age(ori), age(grouped), and/gender 
  child_full <- prod_child(raw_child_formatted, survey_hh)  ##Merge survey table to child table - add variables of weight, region, country, expenditure region and 'over 18'
  
  dv_per_formatted <- format_dv_person(person_dv)  ##Generate table with variables of employment status (unemployment), student status, hrp relationship, econmic position (employee, self employed) and gross weekly wage
  
  #### FORMAT CONSTRAINTS ####
  
  age_gps <- c("F_16_24", "F_25_34", "F_35_49", "F_50_64", "F_65_74", "F_75_pl", "M_16_24", "M_25_34", "M_35_49", "M_50_64", "M_65_74", "M_75_pl", "total_0_pl")  ## Define bands for age groups (16+)
  age_gps_u16 <- c("F_0_9", "F_10_15", "M_0_9", "M_10_15") ## Define bands for age groups (0 - 15)
  
  age_gen_form <- format_age_gen(age_sex, year, reg_tab, "Region.name")       ## Format initial mid-year pop estimates - age/gender by groups, calc totals and add region field
  
  comm_ew_form <- format_comm_ew(comm_ew) ## formant communal counts for England and Wales - group into correct age bands
  comm_sc_form <- format_comm_sc(comm_sc) ## formant communal counts for Scotland - group into correct age bands
  comm_ni_form <- format_comm_ni(comm_ni) ## formant communal counts for NI - group into correct age bands
  
  comm_pop <- calc_nc_pop(comm_ew_form, comm_sc_form, comm_ni_form, age_gen_form) ##Calculate counts of communal residents (for 16+ use ONS MY - non communal count for each age/gender gp. For 0 - 15 use proportion)
  
  unemp_form <- format_unemployed(unemployment, age_gen_form)
  hh_char[,2:18] <- hh_char[,2:18] / rowSums(hh_char[,2:18])
  
  
  eth_form <- format_ethnic_v2(ethnic)
  stu_form <- format_student(education)
  hh_nc <- props_to_counts(hh_char, comm_pop)
  
  income_cols <- c( "X10.percentile","X20.percentile","X30.percentile","X40.percentile","Median", "X60.percentile", "X70.percentile", "X80.percentile" )
  income_ori <- format_emp_status(emp_stat, comm_pop, income_ori)
  comm_ew_stu_form <- format_comm_stu_ew(comm_stu_ew)
  
  comm_sc_stu_form <- format_comm_stu_sc(comm_stu_sc)
  nc_stu <- calc_nc_stu(stu_form, comm_ew_stu_form, comm_sc_stu_form, age_gen_form)
  
  nc_stu_nc <-  props_to_counts(nc_stu, comm_pop)
  
  eth_nc <- props_to_counts(eth_form, comm_pop)
  unemp_nc <- props_to_counts(unemp_form, comm_pop)
  
  cons <-plyr::join_all(list(comm_pop,eth_nc, unemp_nc, nc_stu_nc, hh_nc), by='mnemonic', type='full')
  
  person_full <- prod_person(raw_per_formatted, dv_per_formatted, survey_hh)

  for (i in 1:nrow (person_full) ) {
    
    person_record <- person_full[i,,drop=FALSE]
    
    pers_id <- person_record$id_hh_pers
    hh_id <- person_record$case
    hh_members <- person_dv[which (person_dv$case == hh_id),c("case", "Person", "a005p", "A002", "A015")]
    
    hh_members$a005p <- as.character(hh_members$a005p)
    hh_members$a005p[hh_members$a005p == "80 or older" | hh_members$a005p == "80 and older"] <- 80
    hh_members$a005p <- as.numeric(hh_members$a005p)
    
    dep_stu_16_18 <- FALSE
    for (j in 1:nrow (hh_members)) {
      hh_person <- hh_members[j,,drop=FALSE]
      if (hh_person$a005p >= 16 & hh_person$a005p <= 18 & hh_person$A002 %in% c("Son or daughter", "Grandson or Granddaughter") & hh_person$A015 %in% c("Full-time education", " Full-time education")){
        dep_stu_16_18 <- TRUE}}
      
    
    min_age <- min(hh_members$a005p)
    hh_members_count <- nrow(hh_members)
    
    person_full[which(person_full$id_hh_pers == pers_id),"min_age_hh"] <- min_age
    person_full[which(person_full$id_hh_pers == pers_id),"hh_members_count"] <- hh_members_count
    
    if (person_record$age_ori <= 24 & min_age >=16 & dep_stu_16_18 == FALSE){
      hh_classi <- "A_16_24_dep_n"
      
    } else if (person_record$age_ori <= 24 & (min_age <= 15 | dep_stu_16_18 == TRUE) ){
      hh_classi <- "A_16_24_dep_y"
      
    } else if (person_record$age_ori >= 25 &  person_record$age_ori <=  34 &  min_age >=16  &  dep_stu_16_18 == FALSE){
      hh_classi <- "A_25_34_dep_n"
    } else if (person_record$age_ori >= 25 &  person_record$age_ori <=  34 &  min_age <= 4){
      hh_classi <- "A_25_34_dep_y_0_4"
    } else if (person_record$age_ori >= 25 &  person_record$age_ori <=  34 &  min_age >= 5 & min_age <= 10){
      hh_classi <- "A_25_34_dep_y_5_10"
    } else if (person_record$age_ori >= 25 &  person_record$age_ori <=  34 &  ((min_age >= 11 & min_age <= 15)  |   dep_stu_16_18 == TRUE)                  ){
      hh_classi <- "A_25_34_dep_y_11_pl"
    } else if (person_record$age_ori >= 35 &  person_record$age_ori <=  54 &  min_age >=16  &  dep_stu_16_18 == FALSE ){
      hh_classi  <- "A_35_54_dep_n"
    } else if (person_record$age_ori >= 35 &  person_record$age_ori <=  54 &  min_age <= 4){
      hh_classi <- "A_35_54_dep_y_0_4"
    } else if (person_record$age_ori >= 35 &  person_record$age_ori <=  54 &  min_age >= 5 & min_age <= 10){
      hh_classi <- "A_35_54_dep_y_5_10"
    } else if (person_record$age_ori >= 35 &  person_record$age_ori <=  54 &  ((min_age >= 11 & min_age <= 15) |      dep_stu_16_18 == TRUE)                  ){
      hh_classi <- "A_35_54_dep_y_11_pl"
    } else if (person_record$age_ori >= 55 &  person_record$age_ori <=  64 &  hh_members_count == 1){
      hh_classi <- "A_55_64_sph"
    } else if (person_record$age_ori >= 55 &  person_record$age_ori <=  64 &  hh_members_count > 1 & min_age >=16   & dep_stu_16_18 == FALSE){
      hh_classi <- "A_55_64_mph_dep_n"
    } else if (person_record$age_ori >= 55 &  person_record$age_ori <=  74 &  hh_members_count > 1 & (min_age <= 15 | dep_stu_16_18 == TRUE)){
      hh_classi <- "A_55_74_mph_dep_y"
    } else if (person_record$age_ori >= 65 &  person_record$age_ori <=  74 &  hh_members_count == 1){
      hh_classi <- "A_65_74_sph"
    } else if (person_record$age_ori >= 65 &  person_record$age_ori <=  74 &  hh_members_count > 1 & min_age >=16 & dep_stu_16_18 == FALSE){
      hh_classi <- "A_65_74_mph_dep_n"
    } else if (person_record$age_ori >= 75 &  hh_members_count == 1){
      hh_classi <- "A_75_pl_sph"
    } else if (person_record$age_ori >= 75 &  hh_members_count > 1){
      hh_classi <- "A_75_pl_mph"
    }
    person_full[which(person_full$id_hh_pers == pers_id),"hh_class"] <- hh_classi  
    
  }
  
  
  #unique(person_full$country)
  #person_full <- person_full [which(person_full$country %in% c("England")),]
  #child_full <- child_full [which(child_full$country %in% c("England")),]
  
  cons_ms <- prod_cons_ms(cons)
  cons_child_ms <- prod_cons_child_ms(cons)
  
  final_mnemonic <- NULL
  final_mnemonic_freq <- NULL
  reg_con_out <- NULL
  
  #reg_list <- c("North East")
  ##reg_list <- c("London", "North East")
  ##reg_list <- eng_list
  #cons_ms <- cons_ms[which (cons_ms$Region.name %in% reg_list),] ## SET REGIONS TO RUN
  #cons_child_ms <- cons_child_ms[which (cons_child_ms$Region.name %in% reg_list),] ## SET REGIONS TO RUN
  
  cons_ms <- cons_ms[which (cons_ms$mnemonic == "95AA"),] ## SET REGIONS TO RUN
  cons_child_ms <- cons_child_ms[which (cons_child_ms$mnemonic == "95AA"),] ## SET REGIONS TO RUN
  
  eval <- data.frame(matrix(ncol = 3, nrow = 0))
  colnames(eval) <- c("corvec", "taevec", "revec")
  
  
  inc_any_count = 0
  inc_all_count = 0
  
  set.seed(42)
  for (i in 1:nrow (cons_ms)){
    reg_con <- cons_ms[i,,drop=FALSE]
    
    gor_reg <- reg_con$Region.name
    
    person <- person_full
    child <- child_full
  
    
    mnemonic <- reg_con$mnemonic
    
    max_wage_pp <- max(person$gross_wage)
    
    
    income_reg <- income_ori[which(income_ori$mnemonic == mnemonic),]
    
      if (nrow(income_reg) == 1){
        print(income_reg)
    
    
        print ("prep income")
        
        inc_available = TRUE
        
        inc_brks <- c(-1)
        inc_labs <- NULL
        
  
        income_reg <- income_reg[,colSums(income_reg == "#")  == 0]
        income_reg <- income_reg[,colSums(income_reg == "-")  == 0]
        
        print (income_reg)
        
        st_per <- 0
        if ("X10.percentile" %in% colnames(income_reg) == TRUE) {
          income_reg <- percent_calc(income_reg,10)
          inc_brks <- c(inc_brks, as.numeric(income_reg$X10.percentile))
          inc_labs <- gen_inc_labs(10)
          st_per <- 10}
        if ("X20.percentile" %in% colnames(income_reg) == TRUE){
          income_reg <- percent_calc(income_reg,20)
          inc_brks <- c(inc_brks, as.numeric(income_reg$X20.percentile))
          inc_labs <- gen_inc_labs(20)
          st_per <- 20}
        if ("X30.percentile" %in% colnames(income_reg) == TRUE ) {
          income_reg <- percent_calc(income_reg,30)
          inc_brks <- c(inc_brks, as.numeric(income_reg$X30.percentile))
          inc_labs <- gen_inc_labs(30)
          st_per <- 30}
        if ("X40.percentile" %in% colnames(income_reg) == TRUE ){
          income_reg <- percent_calc(income_reg,40)
          inc_brks <- c(inc_brks, as.numeric(income_reg$X40.percentile))
          inc_labs <- gen_inc_labs(40)
          st_per <- 40}
        if ("Median" %in% colnames(income_reg) == TRUE) {
          income_reg <- percent_calc(income_reg,50)
          inc_brks <- c(inc_brks, as.numeric(income_reg$Median))
          inc_labs <- gen_inc_labs(50)
          st_per <- 50}
        if ("X60.percentile" %in% colnames(income_reg) == TRUE){
          if (as.numeric(income_reg$X60.percentile) < max_wage_pp) {
            income_reg <- percent_calc(income_reg,60)
            inc_brks <- c(inc_brks, as.numeric(income_reg$X60.percentile))
            inc_labs <- gen_inc_labs(60)
            st_per <- 60}}
        
        if ("X70.percentile" %in% colnames(income_reg) == TRUE){
          if (as.numeric(income_reg$X70.percentile) < max_wage_pp){
            income_reg <- percent_calc(income_reg,70)
            inc_brks <- c(inc_brks, as.numeric(income_reg$X70.percentile))
            inc_labs <- gen_inc_labs(70)
            st_per <- 70}}
        
        if ("X80.percentile" %in% colnames(income_reg) == TRUE){  
          if (as.numeric(income_reg$X80.percentile) < max_wage_pp){
            income_reg <- percent_calc(income_reg,80)
            inc_brks <- c(inc_brks, as.numeric(income_reg$X80.percentile))
            inc_labs <- gen_inc_labs(80)
            st_per <- 80}}
        
        final_per <- 100 - st_per
        c_name <- paste("c_",st_per,"_",100, sep = '')
        income_reg[,c_name] <- income_reg$employees * (final_per/100)
        inc_brks <- c(inc_brks, 1000000)
        inc_labs <- c(inc_labs, c_name)
        
        inc_reg_cols <- c(inc_labs, "other", "self_emp")
        income_reg <- income_reg[,inc_reg_cols]
        
        person$inc_brk <- cut(as.numeric(person$gross_wage), breaks = inc_brks, labels = inc_labs)
        levels(person$inc_brk) <- c(levels(person$inc_brk), "other", "self_emp")
        person$inc_brk[person$Economic_pos == "ASHE_n"] <- "other"
        person$inc_brk[person$Economic_pos == "ASHE_self"] <- "self_emp"
  
        reg_con <- cbind(reg_con, income_reg)
        
        print("inc done")
        
      }else {inc_available = FALSE
      print ("inc not available")}
    
  
    
    reg_con_child <- cons_child_ms[which (cons_child_ms$mnemonic == mnemonic),]
  
  
    n_ind_child <- nrow(child)
    ##x0_child <- child$weighta/sum(child$weighta)*length(child$weighta)
    x0_child <- rep(1, n_ind_child)
    
  
    child_as <- model.matrix(~child$age_gen-1)
  
    colnames(child_as) <- names(reg_con_child)[1:4]
    child_as <- data.frame(child_as)
  
    ind_catt_child <- t(child_as)
  
    weights_child <- apply(reg_con_child[,1:4], 1, function(x) ipfp(x, ind_catt_child, x0_child, maxit = 20))
  
    ints_df2 <- NULL
    ints2 <- unlist(apply(weights_child, 2, function(x) int_expand_vector(int_trs(x)))) 
    ints_df2 <- data.frame(child[ints2,], mnemonic = rep(reg_con_child$mnemonic, rowSums(reg_con_child[1:4])))
  
    child_freq <- aggregate(cbind(ints_df2[0],freq=1), ints_df2, length)
  
    child_freq$gor_reg <- gor_reg
    child_freq_gor <- child_freq[,c("id_hh_pers","gor_reg", "freq")]
  
    
    child_freq <- child_freq[,c("id_hh_pers","mnemonic", "freq")]
  
    
    print(paste("preparing ", mnemonic))
    
    reg_con$mnemonic <- NULL
    reg_con$Region.name <- NULL
      
    colnames_eth <- c("eth_black", "eth_mixed", "eth_other", "eth_white")
      
    if (reg_con$eth_black == 0 | is.na(reg_con$eth_black) == TRUE | "eth_black" %in% person$Ethnic_gp == FALSE){print ("black not available")
      person$Ethnic_gp[person$Ethnic_gp == "eth_black"] <- "eth_other"
      colnames_eth <- colnames_eth[colnames_eth != "eth_black"]
      reg_con$eth_black <- NULL}
      
    if (reg_con$eth_mixed == 0 | is.na(reg_con$eth_mixed) == TRUE){print ("mixed not available")
      person$Ethnic_gp[person$Ethnic_gp == "eth_mixed"] <- "eth_other"
      colnames_eth <- colnames_eth[colnames_eth != "eth_mixed"]
      reg_con$eth_mixed <- NULL}
    
    person$Ethnic_gp <- factor(person$Ethnic_gp)
    
    e1 <- model.matrix(~person$Ethnic_gp-1)
    colnames(e1) <- colnames_eth
      
    as <- model.matrix(~person$age_gen-1)
    colnames(as) <- c("F_16_24", "F_25_34", "F_35_49", "F_50_64", "F_65_74", "F_75_pl", "M_16_24", "M_25_34", "M_35_49", "M_50_64", "M_65_74", "M_75_pl")
    
    un1 <- model.matrix(~person$Employment_status-1)
    colnames(un1) <- c("not_unemp", "unemp")
      
    st1 <- model.matrix(~person$student-1)
    colnames(st1) <- c("stu", "non_stu")
    
    hh1 <- model.matrix(~person$hh_class-1)
    colnames(hh1) <- c( "A_16_24_dep_n",
                        "A_16_24_dep_y",
                        "A_25_34_dep_n",
                        "A_25_34_dep_y_0_4",
                        "A_25_34_dep_y_11_pl",
                        "A_25_34_dep_y_5_10",
                        "A_35_54_dep_n",
                        "A_35_54_dep_y_0_4",
                        "A_35_54_dep_y_11_pl",
                        "A_35_54_dep_y_5_10",
                        "A_55_64_mph_dep_n",
                        "A_55_64_mph_dep_y",
                        "A_55_64_sph",
                        "A_65_74_mph_dep_n",
                        "A_65_74_sph",
                        "A_75_pl_mph",
                        "A_75_pl_sph")
    
  
    ind_cat_reg <- data.frame(cbind(as, e1, un1, st1, hh1))
  
    if (inc_available == TRUE){
      inc1 <- model.matrix(~person$inc_brk-1)
      colnames(inc1) <- inc_reg_cols
      ind_cat_reg <- data.frame(cbind(ind_cat_reg, inc1))}
    
    print(dim(person))
    n_ind <- nrow(person)
    ##x0 <- person$weighta/sum(person$weighta)*length(person$weighta)
    x0 = rep(1, n_ind)
  
    if (reg_con$eth_white == 0 | is.na(reg_con$eth_white) == TRUE){
      print("no eth")
      reg_con <- reg_con[, !(names(reg_con) %in% colnames_eth)]
      ind_cat_reg <- ind_cat_reg[, !(names(ind_cat_reg) %in% colnames_eth)]}
    
    unemp_cols <- c("not_unemp", "unemp")
    unemp_na <- any(is.na(reg_con[unemp_cols]))
    if (unemp_na == TRUE){
      print ("no unemp")
      reg_con <- reg_con[, !(names(reg_con) %in% unemp_cols)]
      ind_cat_reg <- ind_cat_reg[, !(names(ind_cat_reg) %in% unemp_cols)]}
    
    stu_cols <- c("stu", "non_stu")
    stu_na <- any(is.na(reg_con[stu_cols]))
    if (stu_na == TRUE){
      print ("no stu")
      reg_con <- reg_con[, !(names(reg_con) %in% stu_cols)]
      ind_cat_reg <- ind_cat_reg[, !(names(ind_cat_reg) %in% stu_cols)]}
    
    
    ind_catt <- t(ind_cat_reg)
  
    print(paste("running ipf ", mnemonic))
    
    weights <- apply(reg_con, 1, function(x) ipfp(x, ind_catt, x0, maxit = 20))
     
    ind_agg <- t(apply(weights, 2, function(x) colSums(x * ind_cat_reg)))
    
    corvec_reg <- cor(as.numeric(reg_con), as.numeric(ind_agg))
    taevec_reg <- tae(reg_con, ind_agg)
    revec_reg <- taevec_reg / sum(reg_con)
    
    eval[mnemonic,"corvec"] <- corvec_reg
    eval[mnemonic,"taevec"] <- taevec_reg
    eval[mnemonic,"revec"]  <- revec_reg
    
    ints <- int_expand_vector(int_trs(weights))
    data_frame <- data.frame(person[ints,])
    data_frame$mnemonic = mnemonic
      
    ## get number of duplicates as 'freq' column
    pers_freq_reg <- aggregate(cbind(data_frame[0],freq=1), data_frame, length)
    
    pers_freq_reg <- pers_freq_reg[,c("id_hh_pers","mnemonic", "freq")]
    
    print(paste("done ", mnemonic))
      
    pers_freq_reg <- rbind(pers_freq_reg, child_freq)
   
    final_mnemonic_freq <- rbind(pers_freq_reg, final_mnemonic_freq)
    
    reg_con$mnemonic <- mnemonic
    reg_con_out <- rbind.fill(reg_con_out,reg_con)
  }
  
  write.csv(reg_con_out, file = (paste("v11_reg_con_out_", year,".csv", sep = '')), row.names=FALSE)
  write.csv(cons_child_ms, file = (paste("v11_child_con_out", year,".csv", sep = '')), row.names=FALSE)
  write.csv(final_mnemonic_freq, file = (paste("v11_mnemonic_freq", year,".csv", sep = '')), row.names=FALSE)
  write.csv(eval, file = (paste("v11_eval_", year,".csv", sep = '')), row.names=TRUE)
}
  
