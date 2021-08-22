setwd("/www/wwwroot/lab/lab/matching/data")
rm(list = ls())
library(BayesFactor)

dat <- read.csv("sv02_analysis_dprime.csv")

dat$subj_idx <- factor(dat$subj_idx)
dat$characterNameEn <- factor(dat$characterNameEn)
dat$misNum <- factor(dat$misNum)
# 按编号，依此提取
isrun <- c()
# exp1
exp1_rt <- data.frame()
exp1_dp <- data.frame()
# exp2
exp2_rt <- data.frame()
exp2_dp <- data.frame()

for (i in levels(dat$subj_idx)) {
    isrun <- append(isrun, i)
    if (length(isrun) > 1) {

        # 第一天的分析
        d1 <- dat %>%
            dplyr::filter(
                series == 0,
                subj_idx %in% isrun
            ) %>%
            as.data.frame()
        ## exp1 反应时
        r1 <- anovaBF(CorrectingRT ~ misNum,
            data = d1
        ) %>% extractBF()
        exp1_rt <- rbind(exp1_rt, data.frame(
            num = c(length(isrun)),
            exp1_rt_misNum_BF10 = c(r1$bf)
        ))
        ## exp1 辨别力
        r2 <- anovaBF(Dprime ~ misNum,
            data = d1
        ) %>% extractBF()
        exp1_dp <- rbind(exp1_dp, data.frame(
            num = c(length(isrun)),
            exp1_dp_misNum_BF10 = c(r2$bf)
        ))

        # 第二天
        d2 <- dat %>%
            dplyr::filter(
                series == 1,
                subj_idx %in% isrun
            ) %>%
            as.data.frame()
        ## exp2 反应时
        r3 <- anovaBF(CorrectingRT ~ misNum * characterNameEn, dat = d2) %>% extractBF()
        exp2_rt <- rbind(exp2_rt, data.frame(
            num = c(length(isrun)),
            exp2_rt_misNum_BF10 = c(r3$bf[1]),
            exp2_rt_characterNameEn_BF10 = c(r3$bf[2]),
            exp2_rt_mis_char_BF10 = c(r3$bf[4] / r3$bf[3])
        ))
        ## exp2 辨别力
        r4 <- anovaBF(Dprime ~ misNum * characterNameEn, dat = d2) %>% extractBF()
        exp2_dp <- rbind(exp2_dp, data.frame(
            num = c(length(isrun)),
            exp2_dp_misNum_BF10 = c(r4$bf[1]),
            exp2_dp_characterNameEn_BF10 = c(r4$bf[2]),
            exp2_dp_mis_char_BF10 = c(r4$bf[4] / r4$bf[3])
        ))
    }
}
# exp <-  cbind(exp1_rt, exp1_dp, exp2_rt, exp2_dp)
# rm(r1, r2, r3, r4, i, isrun, dat, d1, d2)

# exp1
## red mean rt
## green mean dprime
exp1 <- ggplot() +
    geom_line(data = exp1_rt, aes(x = num, y = exp1_rt_misNum_BF10), colour = "red") +
    geom_line(data = exp1_dp, aes(x = num, y = exp1_dp_misNum_BF10), colour = "green") +
    ylab("BF10") +
    ggtitle("EXP1 BF")

# exp2
exp2 <- ggplot() +
    geom_line(data = exp2_rt, aes(x = num, y = exp2_rt_misNum_BF10), colour = "#000000") +
    geom_line(data = exp2_rt, aes(x = num, y = exp2_rt_characterNameEn_BF10), colour = "#ff0000") +
    geom_line(data = exp2_rt, aes(x = num, y = exp2_rt_mis_char_BF10), colour = "#00ff00") +
    geom_line(data = exp2_dp, aes(x = num, y = exp2_dp_misNum_BF10), colour = "#0000ff") +
    geom_line(data = exp2_dp, aes(x = num, y = exp2_dp_characterNameEn_BF10), colour = "#ffff00") +
    geom_line(data = exp2_dp, aes(x = num, y = exp2_dp_mis_char_BF10), colour = "#ff00ff") +
    ylim(0, 20) +
    ylab("BF10") +
    ggtitle("EXP2 BF")

ggsave(file = "verification/exp1.png", width = 12, height = 9, plot = exp1)
ggsave(file = "verification/exp2.png", width = 12, height = 9, plot = exp2)