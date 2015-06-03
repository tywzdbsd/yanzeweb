var myPoint = null;   //我的位置坐标点
  var sPoint = null;    //目的地坐标点
  var data = null;
  var map = null;
  var storePoint = null;
  var marker = null;
  var driving = null;
  var transit = null;
  var gc = null;
  var currentType = null;
  var currentCity = null;
  var location_options = {enableHighAccuracy: true, timeout: 30000};
  var module_id = 5;
  var ids;
  var realId;
  var realTimes;
  $(function(){
    $('#dialog').css({
      width : ($(window).width() * 0.8) ,
      height  : 50,
      top   : 0,
      right : 0
    });
    $('#dialog_result').css({
      width : ($(window).width() * 0.8) ,
      height  : ($(window).height() * 0.8 - 50),
      top   : 50,
      right : 0
    });
    $('#result').css({
      height  : ($(window).height() * 0.8 - 40)
    });
    
    $('html').css({width:'100%',height:'100%'});
    $('body').css({width:'100%',height:'100%',margin:'0px',padding:'0px'});
    $('#map').css({width:'100%',height:'100%'});

    //分店数据
    data = [{"id":"1151","name":"\u83b1\u8499\u6c34\u69ad\u9633\u5149","tel":"025-58766888","lng":"120.138869","lat":"30.319742","desc":"\u83b1\u8499\u6c34\u69ad\u9633\u5149","addr":"\u5357\u4eac\u5e02\u96e8\u82b1\u53f0\u533a"}];

    //初始化地图
    map = new BMap.Map("map");                      // 创建Map实例
    map.addControl(new BMap.NavigationControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT}));               // 添加平移缩放控件
    map.addControl(new BMap.ScaleControl());            // 添加比例尺控件
    map.addControl(new BMap.OverviewMapControl());      // 添加缩略地图控件
    map.enableScrollWheelZoom();                        // 启用滚轮放大缩小

    map.addEventListener("click", function(){
      $('#dialog_result').hide();
    });

    storePoint;
    marker;
    
    //公交导航
    transit = new BMap.TransitRoute(map, {
      renderOptions: {
        map: map,
        panel: "result",
        autoViewport: true
      },
      onSearchComplete :searchComplete
    });
    
    //公交路线回调
    transit.setPolylinesSetCallback(function(lines) {
      $('#dialog').find('.title').html('路线详情：');
      $('#dialog').find('.change-route').html('切换驾车');
      $('#dialog').find('.change-route').attr('onclick','changeRealTime(0,2);');
      $('#dialog').show();
    });
    
    //驾车导航
    driving = new BMap.DrivingRoute(map, {
      renderOptions: {
        map   : map,
        panel : "result",
        autoViewport: true
      },
      onSearchComplete :searchComplete
    });
    //驾车路线回调
    driving.setPolylinesSetCallback(function(routes) {
      $('#dialog').find('.title').html('路线详情：');
      $('#dialog').find('.change-route').html('切换公交');
      $('#dialog').find('.change-route').attr('onclick','changeRealTime(0,1);');
      $('#dialog').show();
    });
    //地址反解
    gc = new BMap.Geocoder();
    
    var zoom = 18;
    
    //显示分店
    for (var i=0 in data) {
      storePoint = new BMap.Point(data[i].lng, data[i].lat);
      if (i==0) {
        map.centerAndZoom(storePoint, zoom?zoom:18);
      }
      eval('marker'+i+'= new BMap.Marker(storePoint)');
      map.addOverlay(eval('marker'+i)); 
      addInfo(eval('marker'+i), data[i], i);
    }

    if (data.length == 1 || module_id == 3) {
      marker0.openInfoWindow(infoWindow0);
    }
    
    //获取位置
    if (window.navigator.geolocation) {
         ids =  window.navigator.geolocation.watchPosition(handleSuccess, handleError, location_options);
    }
    var activity_id = $('span[data-activity]').attr('data-activity');
    //var activity_id = document.getElementById('activity_id').innerHTML;
    $.ajax({
         type: "get",
         url: "/analyseplugin/plugin?activity_id= " + activity_id + "&plugtype=store",
         dataType: "json",
         success: function(msg){
           if(msg.result==1){
             //alert('操作成功！');
          }else{
            //alert("操作失败，" + msg.msg);
          }
         }
    });
  });
  
  //添加分店信息窗
  function addInfo(marker, data, i) {
    var text = '';
    text += '<h4 class="modal-header">'+data.name+'</h4>';
    text += '<p><a href="tel:'+data.tel+'">'+data.tel+'</a></p>';   
    text += '<p>'+data.addr+'</p>';
        text += '<p>到这里去：</p>';
    text += '<p class="btn-group" data-id="'+data.id+'" data-lng="'+data.lng+'" data-lat="'+data.lat+'" data-type=""><a href="javascript:realTime('+data.id+',1)" class="btn btn-large">公交</a><a class="btn btn-large"  href="javascript:realTime('+data.id+',2)">驾车</a></p>';
    eval ('infoWindow'+ i +' = new BMap.InfoWindow(text)');
    marker.addEventListener("click", function(){
      this.openInfoWindow(eval('infoWindow'+i));
    });
  }
  
  //实时导航

  function realTime(id,type){
    if (type == 2) {
    realId = id;
    drawRoute(realId,2); 
    realTimes = setInterval(drawRoute,10000,realId,2);
    }
    else if (type == 1) {
    clearInterval(realTimes); 
    drawRoute(id,1);
    };

  }

   function changeRealTime(id,type){
    if (type == 2) {
    realId = id;
    changeRoute(realId,2); 
    realTimes = setInterval(changeRoute,10000,realId,2);
    }
    else if (type == 1) {
    clearInterval(realTimes); 
    changeRoute(id,1); 
    };

  }
  //路线导航
  function drawRoute(id,type) {
    console.log("yes");
    var $this = $('p[data-id='+id+']');
    var lng = $this.attr('data-lng');
    var lat = $this.attr('data-lat');
    var typt = $this.attr('data-type');
    $this.attr('data-type', type)
    sPoint = new BMap.Point(lng, lat);
    changeRoute(id,type)
  }

  //切换路线方式
  function changeRoute(id,type) {
    if (myPoint && sPoint) {
      driving.clearResults();
      transit.clearResults();
      
      //$('#dialog_result').hide();
     // $('#dialog').hide();
      if (type == 1) {
        transit.search(myPoint, sPoint);
      } else {
        driving.search(myPoint, sPoint);
        setTimeout(
          function(){map.centerAndZoom(myPoint,18);}
          ,1500);
      }
    } else {
      if ($('span[id^="load"]').length>0) {
        $('span[id^="load"]').remove();
      }
      var $this = $('p[data-id='+id+']');
      $this.prev().append('<span id="load'+id+'" style="line-height:2em;font-size:12px;">正在获取位置<img style="width:20px;height:20px;" src="assets/image/widget/loading.gif"><span>');
      
    }
  }
  
  //成功获取定位
  function handleSuccess(position){
    // 获取到当前位置经纬度 
    var coords = position.coords;
    var lat = coords.latitude;
    var lng = coords.longitude;

    //自定义标注图片
    var myIcon = new BMap.Icon("assets/image/widget/pin.png", new BMap.Size(30, 24), {anchor: new BMap.Size(15, 21), imageOffset: new BMap.Size(0, 0)});

    myPoint = new BMap.Point(lng, lat);

    gc.getLocation(myPoint, function(rs){
      var addComp = rs.addressComponents;
      currentCity = addComp.city;
      transit.setLocation(currentCity);
    });        
    
    marker = new BMap.Marker(myPoint, {icon: myIcon});
    map.addOverlay(marker);
    var obj = $('span[id^="load"]').parent().next();
    if (obj.length) {
      var id = obj.attr('data-id');
      var type = obj.attr('data-type');
      drawRoute(id,type);
      $('span[id^="load"]').remove();
    }
    //计算最近的店，打开最近的店的信息窗
    if (data.length == 1) {
      marker0.openInfoWindow(infoWindow0);
    } else if (module_id != 3){
      var minDis = 0;
      var minPoint = null;
      var minNum = 0;
      for (var i=0 in data) {
        tmpPoint = new BMap.Point(data[i].lng, data[i].lat);
        tmpDis = map.getDistance(myPoint, tmpPoint);
        if (i==0) {
          minDis = tmpDis;
          minPoint =  new BMap.Point(data[i].lng, data[i].lat);
        } else if (tmpDis < minDis) {
          minDis = tmpDis;
          minPoint =  new BMap.Point(data[i].lng, data[i].lat);
          minNum = i;
        }
      }
      eval ('marker'+minNum+'.openInfoWindow(eval("infoWindow"+minNum))');
    }
  }
  
  //定位失败
  function handleError(error){
    var msg;
    switch(error.code) {
        case error.TIMEOUT:
          msg = "获取超时!请稍后重试!";
            break;
        case error.POSITION_UNAVAILABLE:
          msg = '无法获取当前位置!';
            break;
        case error.PERMISSION_DENIED:
          msg = '您已拒绝共享地理位置!';
            break;
        case error.UNKNOWN_ERROR:
          msg = '无法获取当前位置!';
            break;
    }
    if ($('span[id^="load"]').length>0) {
      $('span[id^="load"]').html(msg);
    } else {
      alert(msg);
    }
    
  }
  //线路搜索回调
  function searchComplete(result) {
    if (result.getNumPlans() == 0) {
      dialogShow('非常抱歉', '未搜索到可用路线');
    }
  }
  //清除路线
  function clearRoute() {
    clearInterval(realTimes); 
    $('#dialog_result').hide();
    $('#dialog').hide();
    driving.clearResults();
    transit.clearResults();
  }
  //显示路线详情
  function showRoute() {
    $('#dialog_result').show();     
  }
  function dialogClose() {
    $('#alert').hide();
    $('#dialog-overlay').hide();
  }
  function dialogShow(title,content) {
    var dialog = $('#alert');
    dialog.find('.title').html(title);
    dialog.find('.modal-body').html(content);
    var left = ($(window).width() - 270) / 2;
    var top = ($(window).height() - 90) / 3;
    dialog.css({top:top,left:left});
    $('#dialog-overlay').height($(document).height());
    $('#dialog-overlay').show();
    dialog.show();
  }