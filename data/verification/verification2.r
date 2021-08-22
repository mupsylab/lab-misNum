setwd("/www/wwwroot/lab/lab/matching/data")
rm(list = ls())
library(tidyverse)
library(BayesFactor)

dat <- read.csv("sv02_analysis_dprime.csv") %>%
    dplyr::filter(
        series == 1
    )
dat$subj_idx <- factor(dat$subj_idx)
dat$characterNameEn <- factor(dat$characterNameEn)
dat$misNum <- factor(dat$misNum)

anovaBF(CorrectingRT ~ shapeNameEn, data = dat)
