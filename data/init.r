setwd("/www/wwwroot/lab/lab/matching/data")
rm(list = ls())
library(tidyverse)

raw_data <- read.csv("sv02_original.csv")

# translate integer
raw_data$rt <- as.numeric(as.character(raw_data$rt))
raw_data$rt <- as.numeric(as.character(raw_data$rt))
raw_data$acc <- as.integer(raw_data$acc)

raw_data <- raw_data %>%
    dplyr::filter(
        blockType == "formal"
    )
    
raw_data <- raw_data %>%
    dplyr::group_by(
        subj_idx, misNum
    ) %>%
    dplyr::mutate(
        sd = sd(
            raw_data$rt[
              subj_idx == raw_data$subj_idx &
                misNum == raw_data$misNum
              ],
            na.rm = T
        ),
        mean = mean(
          raw_data$rt[
            subj_idx == raw_data$subj_idx &
                misNum == raw_data$misNum
          ],
          na.rm = T
        ),
        z = (rt - mean) / sd,
        sum = sum(
          raw_data$rt[
            subj_idx == raw_data$subj_idx &
                misNum == raw_data$misNum
          ],
          na.rm = T
        ),
        n = length(
          raw_data$rt[
            subj_idx == raw_data$subj_idx &
                misNum == raw_data$misNum
          ]
        )
    ) %>%
    dplyr::ungroup() %>%
    dplyr::filter(
        abs(z) <= 2
    ) %>%
    dplyr::select(
        !c("sd", "mean", "z", "sum", "n")
    )

write.csv(raw_data, file = "sv02_original_filter.csv", row.names = F)

# long data
raw_data %>%
    dplyr::filter(
        blockType == "formal"
    ) %>%
    dplyr::nest_by(
        subj_idx, series, condition, misNum,
        shapeEn, shapeNameEn, characterNameEn
    ) %>%
    dplyr::mutate(
        mean_rt = mean(data$rt, na.rm = T),
        med_rt = median(data$rt, na.rm = T),
        acc = mean(data$acc, ma.rm = T)
    ) %>%
    dplyr::select(
        !c(data)
    ) %>%
    write.csv(file = "sv02_analysis_rt_long.csv", row.names = F)

# wide data
raw_data %>%
    dplyr::filter(
        blockType == "formal"
    ) %>%
    dplyr::nest_by(
        subj_idx, series, condition, misNum,
        shapeNameEn, characterNameEn
    ) %>%
    dplyr::mutate(
        mean_rt = mean(data$rt, na.rm = T),
        med_rt = median(data$rt, na.rm = T),
        acc = mean(data$acc, ma.rm = T)
    ) %>%
    dplyr::select(
        !c(data, mean_rt, acc)
    ) %>%
    pivot_wider(
        names_from = c(misNum, condition, shapeNameEn, characterNameEn),
        values_from = med_rt
    ) %>%
    write.csv(file = "sv02_analysis_rt_wide.csv", row.names = F)

# correcting the rt and calculation Dprime
raw_data %>%
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
    ) %>%
    write.csv(file = "sv02_dprime.csv", row.names = F)