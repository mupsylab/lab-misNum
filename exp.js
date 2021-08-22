function getTrial(sort = 0) {
    return {
        type: "psychophysics",
        stimuli: function () {
            let a = [];
            switch (sort) {
                default:
                    // 同时
                    a.push({
                        obj_type: 'cross',
                        startX: "center", // location of the cross's center in the canvas
                        startY: "center",
                        line_length: 30,
                        line_width: 5,
                        line_color: 'white', // You can use the HTML color name instead of the HEX color.
                        show_start_time: 500,
                        show_end_time: 1100// ms after the start of the trial
                    }, {
                        obj_type: 'image',
                        file: function () {
                            return jsPsych.timelineVariable("img", true);
                        },
                        startX: "center", // location of the cross's center in the canvas
                        startY: $(document).outerHeight() / 2 - 128 * 0.8 - 50,
                        show_start_time: 1000, // ms after the start of the trial
                        show_end_time: 1100,
                        scale: 0.8
                    }, {
                        obj_type: 'text',
                        startX: "center",
                        startY: $(document).outerHeight() / 2 + 100,
                        content: function () {
                            return jsPsych.timelineVariable("word", true);
                        },
                        font: (50).toString() + "px 'Arial'",
                        text_color: 'white',
                        show_start_time: 1000, // ms after the start of the trial
                        show_end_time: 1100
                    });
            }
            return a;
        },
        choices: [answer[0], answer[1]], // 0 always is match condition
        response_start_time: 1100,
        trial_duration: function () {
            if (sessionStorage.getItem("type") == "prac") {
                return 1100 + 1000 + Math.floor(Math.random() * 500);
            } else {
                return 1100 + 2000;
            }
        }, // 刺激呈现时间
        background_color: "grey", // 背景灰色
        on_finish: function (data) {
            trialNum += 1;
            // trial information
            data.shapeFileName = jsPsych.timelineVariable("img", true).replace("matching/img/", ""); // 图片名称
            data.shape = jsPsych.timelineVariable("img", true).replace("img/", "").replace(".png", ""); // 图形形状
            data.shapeEn = wordEn[data.shape];
            data.misNum = jsPsych.timelineVariable("misNum", true); // 不匹配任务数量
            if (day == 1) {
                // 第一天 图形和名称
                data.shapeName = jsPsych.timelineVariable("word", true);
                data.shapeNameEn = wordEn[jsPsych.timelineVariable("word", true)];
            } else {
                // 第二天 图形和人物
                data.characterName = jsPsych.timelineVariable("word", true);
                data.characterNameEn = wordEn[jsPsych.timelineVariable("word", true)];
            }
            data.condition = jsPsych.timelineVariable("condition", true);
            data.correctResp = data.condition === "match" ? answer[0] : answer[1]; // 对的按键
            data.subjResp = data.key_press; // 被试按键

            data.blockType = sessionStorage.getItem("type"); // 反应类别
            data.blockNum = blockNum;
            data.trialNum = trialNum;
            data.save = true;
            // reaction & Acc
            data.rt = data.rt;
            data.acc = ((answer[0] === data.key_press && data.condition === "match") || (answer[1] === data.key_press && data.condition === "mismatch")) ? 1 : 0;
            // DDM
            data.response = data.acc;
        }
    };
}

function getPrac(timeVar, pracNum, pracAcc) {
    return [{
        timeline: [{ // 指导语
            timeline: [{
                type: "instructions",
                pages: function () {
                    let start = "<p class='header'>如果您已经完成理解了实验任务，按继续键，进入正式实验。</p> \
                    <p class='header'>下面是1对3任务，请您记住如下联结:</p>",
                        end = "<p class='footer'>按 继续 进入练习阶段</p><div>";
                    sessionStorage.setItem("type", "prac");
                    blockNum += 1;
                    trialNum = 0;
                    return [start + getMatchWord(sti.match) + end + getKeys()];
                },
                show_clickable_nav: true,
                allow_backward: false,
                button_label_previous: "返回",
                button_label_next: "继续",
                on_finish: function () {
                    $("body").css("cursor", "none");
                }
            }],
            conditional_function: function () {
                if (parseInt(sessionStorage.getItem("errorPrac")) || sessionStorage.getItem("errorPrac") == "null") {
                    sessionStorage.setItem("errorPrac", 0);
                    return true
                } else {
                    return false
                }
            }
        }, getTrial(), {
            type: "html-keyboard-response",
            stimulus: function () {
                let a = jsPsych.data.get().last(1).values()[0];
                if (a.key_press && a.key_press != answer[0] && a.key_press != answer[1]) return getKeys();
                if (a.acc) {
                    return "<span style='color: blue; font-size: 55px;' class='feedback'>✓</span>";
                } else if (a.key_press) {
                    return "<span style='color: red; font-size: 55px;' class='feedback'>×</span>";
                } else {
                    return "<span style='color: yellow' class='feedback'>太慢</span>";
                }
            },
            choices: jsPsych.NO_KEYS,
            trial_duration: 1000
        }, {
            timeline: [{
                type: "html-button-response",
                stimulus: function () {
                    let data = jsPsych.data.get().filter({ save: true }).last(pracNum);
                    let acc = data.select("acc").mean();
                    let rt = data.select("rt").mean();
                    return `
                    <p>你的正确率为：${acc * 100}%</p>
                    <p>你的平均反应时为：${rt} ms</p>
                    <p>接下来是休息时间，当你结束休息后，你可以点击 结束休息 按钮或者按 空格键 继续</p>
                    <p>您当前休息了<span id="iii">150</span>秒</p>`
                },
                choices: ["结束休息"],
                on_load: function () {
                    $("body").css("cursor", "default");
                    $(document.body).keypress(function (a) {
                        if (a.originalEvent.key == " ") {
                            $(".jspsych-html-button-response-button").click()
                        }
                    });
                    let tmpTime = setInterval(function () {
                        $("#iii").text(parseInt($("#iii").text()) - 1);
                        if (parseInt($("#iii").text()) < 1) {
                            $("#iii").parent().text("当前限定休息时间已到达，如果还未到达状态，请继续休息");
                            clearInterval(parseInt(sessionStorage.getItem("tmpTime")));
                        }
                    }, 1000);
                    sessionStorage.setItem("tmpInter", tmpTime);
                },
                on_finish: function () {
                    $(document.body).unbind();
                    clearInterval(parseInt(sessionStorage.getItem("tmpInter")));
                }
            }],
            conditional_function: function () {
                if (trialNum == pracNum) {
                    return true
                } else {
                    return false
                }
            }
        }],
        timeline_variables: jsPsych.randomization.shuffleNoRepeats(timeVar, function (x, y) {
            return x.img === y.img && x.word === y.word;
        }).splice(0, pracNum),
        loop_function: function () {
            let data = jsPsych.data.get().filter({ save: true }).last(pracNum).select("acc").mean();
            if (data >= pracAcc) {
                sessionStorage.setItem("errorPrac", "null");
                blockNum = 0;
                trialNum = 0;
                return false;
            } else {
                sessionStorage.setItem("errorPrac", 1);
                return true;
            }
        },
        randomization: true
    }]
}

function getFormal(timeVar, formNum) {
    let subTimeline = [];
    let subTV = timeVar.splice(0, Math.min(formNum, timeVar.length));
    subTimeline.push({
        timeline: [{
            timeline: [{
                type: "instructions",
                pages: function () {
                    let start = "<p class='header'>如果您已经完成理解了实验任务，按继续键，进入正式实验。</p> \
                        <p class='header'>下面是1对" + jsPsych.timelineVariable("misNum") + "任务，请您记住如下联结:</p>",
                        end = "<p class='footer'>按 继续 进入正式实验</p><div>";
                    sessionStorage.setItem("type", "formal");
                    blockNum += 1;
                    trialNum = 0;
                    return [start + getMatchWord(sti.match) + end + getKeys()];
                },
                show_clickable_nav: true,
                allow_backward: false,
                button_label_previous: "返回",
                button_label_next: "继续",
                on_finish: function () {
                    $("body").css("cursor", "none");
                }
            }],
            conditional_function: function () {
                if (parseInt(sessionStorage.getItem("formIns")) || sessionStorage.getItem("formIns") == "null") {
                    sessionStorage.setItem("formIns", 0);
                    return true
                } else {
                    return false
                }
            }
        }, getTrial(), {
            timeline: [{
                type: "html-button-response",
                stimulus: function () {
                    let data = jsPsych.data.get().filter({ save: true }).last(formNum);
                    let acc = data.select("acc").mean();
                    let rt = data.select("rt").mean();
                    return `
                        <p>你当前还剩余${12 - blockNum}组实验</p>
                        <p>你的正确率为：${acc * 100}%</p>
                        <p>你的平均反应时为：${rt} ms</p>
                        <p>接下来是休息时间，当你结束休息后，你可以点击 结束休息 按钮或者按 空格键 继续。</p>
                        <p>您当前休息了<span id="iii">150</span>秒</p>`
                },
                choices: ["结束休息"],
                on_load: function () {
                    $("body").css("cursor", "default");
                    $(document.body).keypress(function (a) {
                        if (a.originalEvent.key == " ") {
                            $(".jspsych-html-button-response-button").click()
                        }
                    });
                    let tmpTime = setInterval(function () {
                        $("#iii").text(parseInt($("#iii").text()) - 1);
                        if (parseInt($("#iii").text()) < 1) {
                            $("#iii").parent().text("当前限定休息时间已到达，如果还未到达状态，请继续休息");
                            clearInterval(parseInt(sessionStorage.getItem("tmpTime")));
                        }
                    }, 1000);
                    sessionStorage.setItem("tmpInter", tmpTime);
                },
                on_finish: function () {
                    $(document.body).unbind();
                    clearInterval(parseInt(sessionStorage.getItem("tmpInter")));
                }
            }],
            conditional_function: function () {
                if (trialNum == formNum) {
                    sessionStorage.setItem("formIns", "1");
                    return true
                } else {
                    return false
                }
            }
        }],
        timeline_variables: subTV,
        sample: {
            type: "custom",
            fn: function(t) {
                return jsPsych.randomization.shuffle(t);
            }
        }
    });
    return subTimeline;
}
// 指导语中联结呈现部分
function getMatchWord(arr) {
    if (arr.length && !arr.length) return 0;
    let a = "";
    arr.forEach(v => {
        a = a + `<p class="content">
        <img src="${v.img}" >--- <span class="word">${v.word}</span>
        </p>`;
    });
    return "<div class='box'>" + a + "</div>";
}
// 指导语中按键部分
function getKeys() {
    return `
    <p class="key">如果二者匹配，请按 ${answer[0]} 键</p>
    <p class="key">如果二者不匹配，请按 ${answer[1]} 键</p>
    `;
}