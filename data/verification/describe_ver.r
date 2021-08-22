setwd("/www/wwwroot/lab/lab/matching/data")
rm(list = ls())
df.OL <- read.csv("sv02_original.csv")

p <- df.OL %>%
    dplyr::filter(
        blockType == "formal"
    ) %>%
    dplyr::group_by(
        series, shapeEn, shapeNameEn, characterNameEn, misNum, condition
    ) %>%
    dplyr::summarise(
        n = n()
    )

write.csv(p, file = "verification/describe_ver.csv", row.names = F)