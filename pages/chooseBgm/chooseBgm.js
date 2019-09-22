const app = getApp()

Page({
  data: {
    bgmList:[],
    bgmUrl: app.serverUrl,
    videoParams:[]
  },

  onLoad : function(params){//页面加载时的处理
    var me = this;//this作用域的问题
    var serverUrl = app.serverUrl;
    console.log(params)
    me.setData({//将视频参数放入页面公共参数中
      videoParams : params
    });

    //查询bgm列表
    wx.request({
      url: serverUrl + '/bgm/findList',
      method : "GET",
      success : function(res){
        console.log(res);
        if(res.data.status == 1){
          me.setData({
            bgmList : res.data.data
          });
        }
      }
    })
  },

  //上传视频
  upload : function(e){
    wx.showLoading({
      title: '请等待',
    })
    var me = this;
    var bgmId = e.detail.value.bgmId
    var videoTitle = e.detail.value.title
    var videoDesc = e.detail.value.desc

    console.log('bgmId=' + bgmId + ',videoTitle=' + videoTitle + ',videoDesc=' +videoDesc )

    var videoDuration = me.data.videoParams.duration;
    var videoHeight = me.data.videoParams.height;
    var videoWidth = me.data.videoParams.width;
    var videoSize = me.data.videoParams.size;
    var tempFilePath = me.data.videoParams.tempFilePath;
    var thumbTempFilePath = me.data.videoParams.thumbTempFilePath;

    wx.uploadFile({
      url: app.serverUrl + '/video/uploadVideo',
      filePath: tempFilePath,
      name: 'file',
      formData: {
        'userId': app.getGlobalUserInfo().id,
        'videoTitle' : videoTitle,
        'videoDesc' : videoDesc,
        'videoDuration': videoDuration,
        'videoHeight': videoHeight,
        'videoWidth': videoWidth,
        'videoSize' : videoSize,
        'audioId' : bgmId
      },
      success(res) {
        wx.hideLoading();
        console.log(res)
        var data = JSON.parse(res.data)//注意wx.uploadFile()方法返回的data是String类型，要解析成json对象
        if(data.status == 1){
          wx.showToast({
            title: '上传成功',
            icon : 'success'
          })
          //跳转到个人主页
          wx.navigateTo({
            url: '../mine/mine',
          })
        }else{
          wx.showToast({
            title: '上传失败',
          })
        }
      }
    })
  }

  


})