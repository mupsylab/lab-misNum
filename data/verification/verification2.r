setwd("/www/wwwroot/lab/lab/matching/data")
rm(list = ls())
library(tidyverse)
library(BayesFactor)

dat <- read.csv("sv02_original.csv") %>%
    dplyr::filter(
        blockType == "formal",
        rt != "null"
    )
dat$subj_idx <- factor(dat$subj_idx)
dat$characterNameEn <- factor(dat$characterNameEn)
dat$shapeNameEn <- factor(dat$shapeNameEn)
dat$misNum <- factor(dat$misNum)
dat$rt <- as.numeric(as.character(dat$rt))

# 按编号，依此提取
isrun <- c()
exp1 <- data.frame()
exp2 <- data.frame()
for (i in levels(dat$subj_idx)) {
    # analysis
    isrun <- append(isrun, i)
    if (length(isrun) > 1) {
        # 第一天的分析
        d1 <- dat %>%
            dplyr::filter(
                series == 0,
                subj_idx %in% isrun
            ) %>%
            as.data.frame()
        result <- anovaBF(rt ~ misNum, data = d1) %>%
            extractBF()
        exp1 <- rbind(exp1, data.frame(
            num = c(length(isrun)),
            exp1_rt_misNum_BF10 = c(result$bf)
        ))
    }
}