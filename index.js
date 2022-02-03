$("body").css({
    background: "grey",
    overflow: "auto hidden"
});

document.title = "不匹配任务数量的影响";

load.js([
    "instruction.js",
    "css.js",
    "utlis.js",
    "exp.js"
])

let timeline = [];
let version = "v1"; // 版本号
let info = {}; // 被试信息
let subjectID = "sv03"; // 本次实验ID
let recepetion = 2; // 循环次数
let mismatch = [1, 2, 3]; // 不匹配 任务数量

let formNum = 96; // 单个block所包含的试次总数
let pracNum = 60; // 练习数量
let pracAcc = 0.7; // 练习所需正确率

if(parseInt(jsPsych.data.getURLVariable("debug"))) { 
    version = "t5";
    recepetion = 1;
    formNum = 12;
    pracNum = 12;
    pracAcc = 0;
}

let img = ["img/Tri.png", "img/Squ.png", "img/Pen.png", "img/Cir.png"];
let title = {
    "word": ["三角形", "正方形", "五边形", "圆形"],
    "tag": ["自己", "母亲", "朋友", "生人"]
};
// 以上三个变量可以随心改，但请保证数量一致
let wordEn = {
    "三角形": "triangle",
    "正方形": "square",
    "五边形": "pentagon",
    "圆形": "circular",
    "自己": "self",
    "母亲": "mother",
    "朋友": "friend",
    "生人": "stranger",
    "Tri": "triangle",
    "Squ": "square",
    "Pen": "pentagon",
    "Cir": "circular"
}; // 结尾保持英文用

let sorts = jsPsych.utils.permutation(mismatch, 3); // 三种条件随机，以便于依据编号选择
var answers = order(["m", "n"]); // 按键随机
let blockNum = 0, trialNum = 0; // 试次信息
let answer, subjID; // 运行时候用到的全局数据
sessionStorage.clear();
sessionStorage.setItem("errorPrac", "null"); // 判断是否练习错误
sessionStorage.setItem("formIns", "null"); // 正式实验中，指导语是否呈现
sessionStorage.setItem("type", ""); // 判断 当前block信息
sessionStorage.setItem("donePrac", 0); // 判断是否已经做过练习了

// 第一天 或 第二天的判断
const day = parseInt(jsPsych.data.getURLVariable("day") ? jsPsych.data.getURLVariable("day") : 1);

// 开始计算时间线变量
let words = title[Object.keys(title)[day - 1]];
let tmpArrW = order(words); // 列出 每行每列均不相等的情况
let sti = com(img, jsPsych.utils.deepCopy(tmpArrW), [1,2,3]); // 进行抽样匹配
let timVar = [];
getVar(sti).forEach(v => { 
    timVar.push(jsPsych.randomization.repeat(v, Math.max(formNum, 48) / v.length));
}); // 给变量填充为 48 个

timeline.push(
    { // 进入全屏
        type: 'fullscreen',
        fullscreen_mode: true,
        message: `
        <style>
            p {
                margin: 0 0 0 0;
            }
            .full_title { 
                font: bold 42px 微软雅黑; 
                color: #B22222;
            }

            .full_instruction { 
                font: 30px 微软雅黑; 
                color: white;
            }

            .full_lab { 
                font: 24px 华文中宋; 
                color: #cbcbcb;
            }
        </style>
        <p class="full_title">欢迎参与我们的实验</p>
        <p class="full_instruction"><单击下方 继续 进入实验程序></p>
        <br/>
        <p class="full_lab">Mupsy在线实验室</p>
        <br/>
        `,
        button_label: "继续",
        on_load: function() { 
            let a = function() { 
                let height = $("#displayBox").height() * 0.75;
                let width = $("#displayBox").width() * 0.75;
                $(".full_title").css({
                    fontSize: `${Math.min(height * 0.33, width / $(".full_title").text().length)}px`
                });
                $(".full_instruction").css({
                    fontSize: `${Math.min(height * 0.33, width / $(".full_instruction").text().length)}px`
                });
                $(".full_lab").css({
                    fontSize: `${Math.min(height * 0.07, width / $(".full_lab").text().length)}px`
                });
            }
            resize = a;
        },
        on_finish: function () {
            resize = function() { };

            landScape();
            if (window.orientation === 180 || window.orientation === 0) $("#orientLayer")[0].style.display = "block";
            window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
                if (window.orientation === 180 || window.orientation === 0) {
                    $("#orientLayer")[0].style.display = "block";
                    jsPsych.pauseExperiment();
                }
                if (window.orientation === 90 || window.orientation === -90) {
                    $("#orientLayer")[0].style.display = "none";
                    jsPsych.resumeExperiment();
                }
            }, false);
        }
    }, instruction(), { // 预加载图片
    type: 'preload',
    images: img,
    // audio: ['sound/speech_green.mp3', 'sound/speech_red.mp3'],
    message: '<p>程序加载中，请稍后......</p>',
    continue_after_error: false,
    max_load_time: 10000,
    on_error: function (file) {
        console.log('Error: ', file);
    },
    on_success: function (file) {
        console.log('Loaded: ', file);
    }
}, {
    type: "survey-html-form",
    preamble: "<p style =' color : white'>你分配到的实验编号是</p>",
    html: "<p><input name='Q0' type='text' value='" + subjectID + "' disabled='disabled' /> \
    <input name='Q1' type='number' value='' min='1' required/></p>\
    <p id='numberf' style='font-size: 20px; color: white;'>你的最终编号是：</p>\
    <p>你完整参与本次实验次数是<input name='Q2' type='number' value='0' min='0' style='width: 50px;' required/></p>",
    button_label: "继续",
    on_load: function () {
        $("input[type=number]").on("input", function (e) {
            $("#numberf").html("你的最终编号是：" + $("input[name=Q0]").val() + e.currentTarget.value.toString().padStart(4, "0"));
            info["subj_idx"] = $("input[name=Q0]").val() + $("input[name=Q1]").val().toString().padStart(4, "0");
            info["series"] = $("input[name=Q2]").val();
        });
        let goOn = 0, keep = true;
        while(keep) {
            goOn += 1;
            let a = new XMLHttpRequest();
            a.open("GET", `./data/origin/${subjectID + goOn.toString().padStart(4, "0")}_${version}_day${day}.csv`, false);
            a.send();
            // console.log(a.status);
            if (a.status != 200) { 
                keep = false;
                $("input[name=Q1]").val(goOn).trigger("input");
                // console.log(a);
            }
        }
    },
    on_finish: function () {
        if (localStorage.getItem(info["subj_idx"])) {
            info = JSON.parse(localStorage.getItem(info["subj_idx"]));
        }
        $.ajax({
            url: "/common/recevice.php",
            type: "POST",
            data: {
                data: "",
                id: `${info["subj_idx"]}_${version}_day${day}`,
                path: (function () {
                    let p = window.location.pathname.split("/");
                    p.pop();
                    return p.join("/");
                })()
            }
        })
    }
}, {
    type: "call-function",
    func: function () {
        // 这里放需要依据被试编号确定的各种参数值
        subjID = parseInt(info["subj_idx"].replace(subjectID, "")); // 被试ID
        answer = answers[subjID % answers.length];

        let aa = getPrac(jsPsych.utils.deepCopy(timVar[2]), pracNum, pracAcc);
        load.plugins(aa);
        jsPsych.addNodeToEndOfTimeline({
            timeline: aa
        });
        sorts[subjID % sorts.length].forEach(v => {
            for(let i = 0; i < 4; i++) { 
                jsPsych.addNodeToEndOfTimeline({
                    timeline: getFormal(jsPsych.utils.deepCopy(timVar[v - 1]), formNum)
                });
            }
        });
        info["series"] = day;
    }
}, { // 学习阶段，第二天的
    timeline: [{
        type: "html-button-response",
        stimulus: "<p class='head'>接下来，请你记住下面的联结:</p>" + getMatchWord(sti.match) + "<p class='footer'>然后你会需要回答一些问题，准备好了请点击 继续 </p>",
        choices: ["继续"],
        on_finish: function () {
            resize = function() { };
            blockNum = 1;
            trialNum = 0;
            sessionStorage.setItem("errorStudy", 0);
        },
        on_load: function() { 
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
    }, {
        timeline: [{
            timeline: [{
                type: "html-button-response",
                stimulus: "<p class='head'>注意，错误次数过多，请你仔细记住下面的联结:</p>" + getMatchWord(sti.match) + "<p class='footer'>然后你会需要回答一些问题，准备好了请点击 继续 </p>",
                choices: ["继续"],
                on_finish: function () {
                    resize = function() { };
                    blockNum += 1;
                    trialNum = 0;
                    sessionStorage.setItem("errorStudy", 0);
                },
                on_load: function() { 
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
                if (parseInt(sessionStorage.getItem("errorStudy"))) {
                    sessionStorage.setItem("errorStudy", "0");
                    return true
                } else {
                    return false
                }
            }
        }, {
            type: "html-button-response",
            stimulus: function () {
                return "<p class='content'><img src='" + jsPsych.timelineVariable("img", true) + "' ></p> \
                <p class='content' style='margin: 0'>+</p>";
            },
            choices: title["tag"],
            on_load: function () {
                $("#jspsych-content").append("<p class='content' style='margin: 50px 0 0 0'>选择与图形对应的人物标签</p>");
                let a = function() { 
                    let height = $("#displayBox").height() * 0.9;
                    let width = $("#displayBox").width() * 0.9;
                    $(".content img").css({
                        transform: `scale(${(height * 0.4) / 257}, ${(height * 0.4) / 257}) translateZ(0)`
                    });
                    $(".content")[0].style.height = `${height * 0.4}px`;
                    $(".content")[1].style.height = `${height * 0.2}px`;
                    $(".content")[2].style.fontSize = `${Math.min(height * 0.07, width / 15)}px`;
                    $(".content")[2].style.margin = `${height * 0.05}px 0 0 0`;
                    $(".content")[2].style.height = `${height * 0.08}px`;

                }
                a();
                resize = a;
            },
            on_finish: function (data) {
                trialNum += 1;
                data.blockType = "study";
                data.blockNum = blockNum;
                data.trialNum = trialNum;

                data.acc = title["tag"][data.response] === jsPsych.timelineVariable("word", true) ? 1 : 0;

                data.shapeFileName = jsPsych.timelineVariable("img", true).replace("img/", ""); // 图片名称
                data.shape = jsPsych.timelineVariable("img", true).replace("img/", "").replace(".png", "");
                data.shapeEn = wordEn[data.shape];
                // 第二天 图形和人物
                data.characterName = jsPsych.timelineVariable("word", true);
                data.characterNameEn = wordEn[jsPsych.timelineVariable("word", true)];
                data.save = true;
                // console.log(tags[data.response], jsPsych.timelineVariable("word", true));

                resize = function() { };
            }
        }, {
            timeline: [{
                type: "html-button-response",
                stimulus: function () {
                    let data = jsPsych.data.get().filter({ blockType: "study" }).last(sti.match.length * 5);
                    let acc = data.select("acc").mean();
                    let rt = data.select("rt").mean();
                    return `<p>你的正确率为：${acc * 100}%</p>
                    <p>接下来是休息时间，当你结束休息后，你可以点击 结束休息 按钮</p>`
                },
                choices: ["结束休息"],
                on_load: function () {
                    $(document.body).keypress(function (a) {
                        if (a.originalEvent.key == " ") {
                            $(".jspsych-html-button-response-button").click()
                        }
                    });
                },
                on_finish: function () {
                    $(document.body).unbind();
                }
            }],
            conditional_function: function () {
                if (trialNum == sti.match.length * 5) {
                    return true
                } else {
                    return false
                }
            }
        }],
        timeline_variables: jsPsych.randomization.repeat(sti.match, 5),
        loop_function: function () {
            let data = jsPsych.data.get().filter({ blockType: "study" }).last(sti.match.length * 5).select("acc").mean();
            if (data >= pracAcc) {
                sessionStorage.setItem("errorStudy", 0);
                blockNum = 0;
                trialNum = 0;
                return false;
            } else {
                sessionStorage.setItem("errorStudy", 1);
                return true;
            }
        }
    }],
    conditional_function: function() { 
        if(day == 2) { 
            return true;
        } else { 
            return false;
        }
    }
});

mupsyStart({
    timeline: timeline,
    display_element: document.querySelector("#displayBox"),
    on_finish: function () {
        let msg = "<p>感谢你参与本次实验，本次实验到这里就结束了</p> \
                <p>请你手动通过 ESC 键退出全屏后关闭本页面</p>";
        // if (document.fullscreen & document.exitFullscreen()) {
        //     msg = "<p>感谢你参与本次实验，本次实验到这里就结束了</p>";
        // } else {
        //     msg = "<p>感谢你参与本次实验，本次实验到这里就结束了</p> \
        // <p>请你手动通过 ESC 键退出全屏后关闭本页面</p>";
        // }
        // let p = ["response_type", "key_press", "avg_frame_time", "center_x", "center_y", "trial_type", "trial_index", "internal_node_id"];
        let data = jsPsych.data.get().filter({ save: true }).addToAll(info).filterColumns((function () {
            // let a = jsPsych.data.get().filter({ save: true }).uniqueNames();
            // p.forEach(v => {
            //     a.splice(a.indexOf(v), 1);
            // });
            return ["subj_idx", "Name", "Sex", "BirthYear", "Education", "PhoneNumber", "shapeFileName", "shape",
                "shapeEn", "shapeName", "shapeNameEn", "characterName", "characterNameEn", "misNum", "correctResp", "subjResp", "series", "condition",
                "blockNum", "blockType", "trialNum", "response", "acc", "rt", "time_elapsed", "trialStart", "trialEnd", "trialTheoreticalTime"];
        })());
        mupsyEnd({
            save: true,
            id: info["subj_idx"] + "_" + version + "_day" + day,
            data: data,
            end_html: msg,
            origin: true
        });
    }
});