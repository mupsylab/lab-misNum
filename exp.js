function getTrial(sort = 0) {
    return {
        type: "psychophysics",
        canvas_height: $("#displayBox").height() * 0.8,
        canvas_width: $("#displayBox").width() * 0.8,
        origin_center: false,
        background_color: "grey", // 背景灰色
        stimuli: function () {
            let a = [];
            let height = $("#displayBox").height() * 0.8;
            switch (sort) {
                default:
                    // 同时
                    a.push({
                        obj_type: 'cross',
                        startX: "center", // location of the cross's center in the canvas
                        startY: "center",
                        line_length: height * 0.1 / 1, // 30
                        line_width: height * 0.1 / 9, // 5
                        line_color: 'white', // You can use the HTML color name instead of the HEX color.
                        show_start_time: 500,
                        show_end_time: 1100// ms after the start of the trial
                    }, {
                        obj_type: 'image',
                        file: function () {
                            return jsPsych.timelineVariable("img", true);
                        },
                        startX: "center", // location of the cross's center in the canvas
                        startY: height * 0.25,
                        show_start_time: 1000, // ms after the start of the trial
                        show_end_time: 1100,
                        scale: (height * 0.4) / 257
                    }, {
                        obj_type: 'text',
                        startX: "center",
                        startY: height - (height * 0.2) / 2 - height * 0.25,
                        text_space: 0,
                        content: function () {
                            return jsPsych.timelineVariable("word", true);
                        },
                        font: (height * 0.1).toString() + "px 'Arial'",
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
            let tmpTime = 0;
            if (sessionStorage.getItem("type") == "prac") {
                tmpTime = 1100 + 1000 + Math.floor(Math.random() * 500);
            } else {
                tmpTime =  1100 + 2000;
            }
            sessionStorage.setItem("tmpTime", tmpTime);
            return tmpTime;
        }, // 刺激呈现时间
        on_load: function() { 
            sessionStorage.setItem("trialStart", jsPsych.totalTime());
            $("canvas").attr("data-start-time", performance.now());
            $("canvas").on("touchstart", function(e) { 
                let endTime = performance.now();
                let startTime = parseInt($("canvas").attr("data-start-time"));
                let c = e.originalEvent.touches;
                // console.log("canvas", e.originalEvent.touches);
                // n is left
                // m is right
                if (endTime - startTime >= 1100) { 
                    if(c[0].clientX < $(document).width() / 2) {
                        jsPsych.pluginAPI.clearAllTimeouts();
                        jsPsych.finishTrial({
                            rt: endTime - startTime - 1100,
                            correctResp: answer[0] == "n" ? "left" : "right",
                            subjResp: "left",
                            acc: answer[0] == "n" ? 1 : 0,
                            key_press: "n"
                        });
                    } else { 
                        jsPsych.pluginAPI.clearAllTimeouts();
                        jsPsych.finishTrial({
                            rt: endTime - startTime - 1100,
                            correctResp: answer[0] == "n" ? "left" : "right",
                            subjResp: "right",
                            acc: answer[0] == "m" ? 1 : 0,
                            key_press: "m"
                        });
                    }
                }
            });
        },
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

            data.correctResp = data.correctResp; // 对的按键
            data.subjResp = data.subjResp; // 被试按键

            data.blockType = sessionStorage.getItem("type"); // 反应类别
            data.blockNum = blockNum;
            data.trialNum = trialNum;
            data.save = true;
            // reaction & Acc
            data.rt = data.rt;
            data.acc = ((answer[0] === data.key_press && data.condition === "match") || (answer[1] === data.key_press && data.condition === "mismatch")) ? 1 : 0;
            // DDM
            data.response = data.acc;

            // robot info
            data.trialEnd = jsPsych.totalTime();
            data.trialStart = JSON.parse(sessionStorage.getItem("trialStart"));
            data.trialTheoreticalTime = JSON.parse(sessionStorage.getItem("tmpTime"));
        }
    };
}

function getPrac(timeVar, pracNum, pracAcc) {
    return [{
        timeline: [{ // 指导语
            timeline: [{
                type: "instructions",
                pages: function () {
                    let start = "<p class='header'>如果您已经完成理解了实验任务，按继续键，进入练习阶段。</p> \
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
                    resize = function() { };
                },
                on_load: function () { 
                    let a = function () {
                        let height = $("#displayBox").height() * 0.9;
                        let width = $("#displayBox").width() * 0.9;
                         $(".header").css({
                             fontSize: `${Math.min(height * 0.05, width / 27)}px`
                         });
                         $("p").css({
                             margin: "0 0",
                             lineHeight: `1.5em`
                         });
                         $(".footer").css({
                            fontSize: `${Math.min(height * 0.05, width / 10)}px`
                        });
                        $(".key").css({
                            fontSize: `${Math.min(height * 0.03, width / 22)}px`
                        });
                        $(".box").css({
                            height: `${Math.min(height * 0.7)}px`
                        });
                    }
                    a();
                    resize = a;
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
                    <p>接下来是休息时间，当你结束休息后，你可以点击 结束休息 按钮</p>
                    <p>我们建议你继续休息<span id="iii">150</span>秒</p>`
                },
                choices: ["结束休息"],
                on_load: function () {
                    let a = function() { 
                        $("p").css({
                            fontSize: `${$("#displayBox").width() * 0.9 / 40 }px`
                        });
                    }
                    a();
                    resize = a;

                    $("body").css("cursor", "default");
                    $(document.body).keypress(function (a) {
                        if (a.originalEvent.key == " ") {
                            $(".jspsych-html-button-response-button").click()
                        }
                    });
                    let tmpTime = setInterval(function () {
                        $("#iii").text(parseInt($("#iii").text()) - 1);
                        if (parseInt($("#iii").text()) < 1) {
                            $("#iii").parent().text("当前建议休息时间已到达，如果还未休息完毕，请继续休息");
                            clearInterval(parseInt(sessionStorage.getItem("tmpTime")));
                        }
                    }, 1000);
                    sessionStorage.setItem("tmpInter", tmpTime);
                },
                on_finish: function () {
                    resize = function() { };
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
                    resize = function() { };
                },
                on_load: function() { 
                    let a = function() { 
                        let height = $("#displayBox").height() * 0.9;
                        let width = $("#displayBox").width() * 0.9;
                         $(".header").css({
                             fontSize: `${Math.min(height * 0.05, width / 27)}px`
                         });
                         $("p").css({
                             margin: "0 0",
                             lineHeight: `1.5em`
                         });
                         $(".footer").css({
                            fontSize: `${Math.min(height * 0.05, width / 10)}px`
                        });
                        $(".key").css({
                            fontSize: `${Math.min(height * 0.03, width / 22)}px`
                        });
                        $(".box").css({
                            height: `${Math.min(height * 0.7)}px`
                        });
                    }
                    a();
                    resize = a;
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
                        <p>接下来是休息时间，当你结束休息后，你可以点击 结束休息 按钮。</p>
                        <p>您当前休息了<span id="iii">150</span>秒</p>`
                },
                choices: ["结束休息"],
                on_load: function () {
                    let a = function() { 
                        $("p").css({
                            fontSize: `${$("#displayBox").width() * 0.9 / 40 }px`
                        });
                    }
                    a();
                    resize = a;

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
    // console.log(arr);
    let arr1 = jsPsych.utils.deepCopy(arr);
    if (arr1.length && !arr1.length) return 0;
    let a = "";
    while(arr1.length > 0) {
        let v = arr1.splice(Math.floor(Math.random() * arr1.length), 1)[0];
        a = a + `<p class="content">
            <img src="${v.img}" > --- <span class="word">${v.word}</span>
            </p>`;
    };
    return "<div class='box'>" + a + "</div>";
}
// 指导语中按键部分
function getKeys() {
    return `
    <p class="key">如果二者匹配，请按 ${answer[0] == "n" ? "左边的屏幕" : "右边的屏幕"}</p>
    <p class="key">如果二者不匹配，请按 ${answer[0] == "n" ? "左边的屏幕" : "右边的屏幕"} 键</p>
    `;
}