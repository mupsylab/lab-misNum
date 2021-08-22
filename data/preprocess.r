setwd("/www/wwwroot/lab/lab/matching/data")
library(tidyverse)
# id>=5
rm(list = ls())
file <- list.files("./origin")
file <- file[grep("sv02", file, fixed = TRUE)]
for (f in file) {
    tmp2Data <- read.csv(paste("./origin/", f, sep=""), header=TRUE, sep=",", stringsAsFactors = F, encoding = "UTF-8")
    print(f)
    if (exists("df.M")) {
        df.M <- rbind(df.M, tmp2Data)
    } else {
        df.M <- tmp2Data
    }
}
df.M <- subset(df.M, select = -c(Name, PhoneNumber, Sex, BirthYear, Education)) # 删除被试信息部分
rm(list = ls()[-grep("df", ls())])
write.csv(df.M, file = "sv02_original.csv", row.names = F)
