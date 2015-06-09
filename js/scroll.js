/**
 * Created by tyw on 15/6/1.
 */
$(function() {
    $("#ido").fullpage(
        {
            continuousVertical: true,  //循环演示
            //绑定菜单
            anchors: ['page1', 'page2', 'page3', 'page4','page5','page6','page7'],
            menu: '#menu'
            //'navigation': true  //have scroll bar
        }
    );
});