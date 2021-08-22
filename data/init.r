setwd("/www/wwwroot/lab/lab/matching/data")
rm(list = ls())
library(tidyverse)

df.OL <- read.csv("sv02_original.csv")

# translate integer
# df.OL$rt <- as.double(levels(as.factor(df.OL$rt))[as.factor(df.OL$rt)])
df.OL$rt <- as.numeric(as.character(df.OL$rt))
df.OL$acc <- as.integer(df.OL$acc)

ra <- df.OL %>%
    dplyr::filter(
        blockType == "formal"
    ) %>%
    dplyr::nest_by(
        subj_idx, series, condition, misNum,
        shapeEn, shapeNameEn, characterNameEn
    ) %>%
    dplyr::mutate(
        rt = mean(data$rt, na.rm = T),
        med_rt = median(data$rt, na.rm = T),
        acc = mean(data$acc, ma.rm = T)
    ) %>%
    dplyr::select(
        subj_idx, series, condition, misNum,
        shapeEn, shapeNameEn, characterNameEn,
        rt, acc, med_rt
    )
write.csv(ra, file = "sv02_analysis_rt.csv", row.names = F)

crd <- df.OL %>%
    dplyr::filter(
        blockType == "formal"
    ) %>%
    dplyr::nest_by(
        subj_idx, series, misNum,
        shapeNameEn, characterNameEn
    ) %>%
    dplyr::mutate(
        CorrectingRT = mean(data$rt[data$condition == "mismatch"], na.rm = T) -
                        mean(data$rt[data$condition == "match"], na.rm = T),
        hit = length(data$acc[data$condition == "match" & data$acc == 1]),
        fa = length(data$acc[data$condition == "mismatch" & data$acc == 0]),
        miss = length(data$acc[data$condition == "match" & data$acc == 0]),
        cr = length(data$acc[data$condition == "mismatch" & data$acc == 1]),
        Dprime = qnorm(
            ifelse(hit / (hit + miss) < 1,
                hit / (hit + miss),
                1 - 1 / (2 * (hit + miss))
            )
        ) - qnorm(
            ifelse(fa / (fa + cr) > 0,
                fa / (fa + cr),
                1 / (2 * (fa + cr))
            )
        )
    ) %>%
    dplyr::select(
        subj_idx, series, misNum,
        shapeNameEn, characterNameEn,
        CorrectingRT, Dprime
    )
write.csv(crd, file = "sv02_analysis_dprime.csv", row.names = F)