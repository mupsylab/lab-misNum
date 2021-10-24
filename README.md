# 介绍
这是基于`jspsych`的心理学再现实验，主要是用于毕业论文

# 预处理
对于全部被试csv保存在`sv02_original`文件中
## RT 和 ACC 平均值
依据`subj_idx, series, condition, misNum, shapeEn, shapeNameEn, characterNameEn`分组
而后利用`mean, median` 计算RT的平均值和中位数，以及ACC的平均数
