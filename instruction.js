function instruction() { 
    
    let size_proportion = (window.screen.height / 900) - 0.1;
    let block = 2 * 48 * recepetion / formNum; // 总block数量
    let time = 50; // 总时间

    let ss = "   \
            .title{ \
                font-size: " + 30 * size_proportion + "px;\
                text-align: center;\
                font-weight: 700;\
            }\
            .para{ \
                font-size: " + 20 * size_proportion + "px; \
                text-indent: 2em; \
                text-align: left; \
                margin-block: " + 10 * size_proportion + "px; \
            }\
            .foot{ \
                text-align: right;\
                font-size: " + 20 * size_proportion + "px;\
            }"; // 定义一个style，便于在指导语使用
    let instr = {
        type: "instructions",
        pages: [
            "<div class='contacts'>   <p class='title' style='color:#fff'>实验内容介绍</p> <div style='color: white;'class='content_box'>\
                <style>" + ss + "\
            </style>    \
           \
            <p class='para'>您好，欢迎参加本次实验。为充分保障您的权利，请确保你已经知晓并同意《参与实验同意书》以及《数据公开知情同意书》，如果你未见过上述内容，请咨询联系您的人。如果您选择继续实验，则表示您已经清楚两份知情同意书的内容并同意。</p>\
            <p class='para'>实验说明：</p>\
            <p class='para'>您好，欢迎参加本次实验。本次实验需要两天时间，每天70分钟，共140分钟完成。</p>\
            <p class='para'>任务概况</p>\
            <p class='para'>本次实验的两天里，您均需要知觉匹配任务。</p>\
            <p class='para'>具体来说，在实验中，您需要注视电脑屏幕的中央及屏幕上出现的视觉内容。屏幕上首先出现一个“+”，很快，“+”上方面会出现一个几何图形中，下方会出现文字信息。几何图形可能是正方形、圆形、三角形和五边形，文字是几何图形对应的形状名称（实验1），或者是我们预先让您学习的具有对应相关的人物标签（实验2）。您的任务是判断几何图形与图形名称或人物标签是否匹配；匹配按一个键，不匹配按另一个键。（详细见每次实验的指导语）</p>\
            <p class='para'>完成匹配任务的练习之后，您将完成12组匹配任务，每组包括96次按键反应，中途请至少保证有150秒的休息。完成一组任务大约需要6分钟，整个实验将持续大约80分钟。</p>\
            <p class='para'>第一天，你需要对于几何形状及其名称进行匹配任务。第二天，在匹配任务开始前，您将学习几何图形与不同人物标签的对应关系。牢记它们之间的对应关系，记住关系之后进入实验部分，完成图形与人物标签对应关系的匹配任务实验。人物标签包括：自己、母亲、朋友、生人。</p>\
            <p class='para'>3. 如果对本实验有不清楚之处，请向实验员咨询。</p>\
            </div> </div>"
        ],
        show_clickable_nav: true,
        allow_backward: true,
        button_label_previous: "返回",
        button_label_next: "继续",
        on_load: function() { 
            let a = function() { 
                $(".content_box").css({
                    width: $("body").width() * 0.75,
                    height: $("body").height() * 0.60
                });
            }
            a();
            resize = a;
        },
        on_finish: function() { 
            resize = function() { };
        }
    }; // 指导语 分为了 三页
    return instr;
}