/**
 * Created by tyw on 15/6/1.
 */

$(function(){
    init();
});

function init(){
    //注册事件
    if (document.addEventListener) {
        document.addEventListener('DOMMouseScroll',scrollFunc, false);
    }
    window.onmousewheel=document.onmousewheel=scrollFunc;
}

//鼠标滚轮事件
var scrollFunc = function (e) {
    var direct = 0;//指向值
    e = e || window.event;//e事件不同浏览器的兼容
    //滚轮事件判断
    if (e.wheelDelta) {//如果是IE/Opera/Chrome
        if(e.wheelDelta >= 240){//控制滚动一定距离才反应
            direct = 1;
        }else if(e.wheelDelta <= -240){
            direct = -1;
        }
    } else if (e.detail) {//如果是Firefox
        if(e.detail <= -2){//控制滚动一定距离才反应
            direct = 1;
        }else if(e.detail >= 2){
            direct = -1;
        }
    }
    //向上上下分别做什么
    if(direct == 1){
        console.log("up");
        $();
    }
    if(direct == -1){
        console.log("down");
    }
};

