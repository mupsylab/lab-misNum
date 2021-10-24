setwd("/www/wwwroot/lab/lab/matching/data")
library(tidyverse)
# if id >= 5
rm(list = ls()) # 上面都是初始化操作

file <- list.files("./origin") # 读取工作目录当中的origin文件夹下面的所有文件
file <- file[grep("v4", file, fixed = TRUE)] # 筛选以sv02开头的数据文件

for (f in file) { # 对于文件进行循环读取
    tmp <- read.csv(
        paste("./origin/", f, sep = ""),
        header = TRUE, sep = ",", stringsAsFactors = F, encoding = "UTF-8"
    ) # 读取单个csv，并赋予tmp
    print(f)
    if (exists("raw_data")) {
        raw_data <- rbind(raw_data, tmp)
    } else {
        raw_data <- tmp
    } # 这一步是保存tmp的内容
}

raw_data$rt <- as.numeric(as.character(raw_data$rt))
raw_data <- subset(
    raw_data, select = -c(Name, PhoneNumber, Sex, BirthYear, Education)
) # 删除被试信息部分
rm(list = ls()[-grep("raw_data", ls())])
# 保存文件
write.csv(raw_data, file = "sv02_original.csv", row.names = F)
