//获取应用实例
const app = getApp()
var videoUtil = require('../../util/upload-video.js')

Page({
  data: {
    objectFit : 'cover',
    videoInfo:{}, //视频信息
    videoUrl:"",
    isLikeVideo:false, //用户是否喜欢视频 默认false
    publisher: {},//发布者信息
    faceImageUrl:'' //头像地址
  },

  onLoad: function(params){
    var that = this
    app.isLogin();//判断用户是否登陆
    var user = app.getGlobalUserInfo();
    //加载视频
    var videoInfo = JSON.parse(params.videoInfo);
    that.setData({
      videoInfo:videoInfo,
      videoUrl: app.serverUrl + videoInfo.videoPath
    });
    //判断视频是否需要填充 如果宽大于高 不需要填充
    var videoWidth = videoInfo.videoWidth;
    var videoHeight = videoInfo.videoHeight;
    if(videoWidth > videoHeight){
      that.setData({
        objectFit : ''
      });
    }
    //判断视频是否被当前用户喜欢
    wx.request({
      url: app.serverUrl + '/userLikeVideo/isLikeVideo?userId=' + user.id + '&videoId=' + videoInfo.id,
      method:'POST',
      header:{
        'userId': user.id,
        'userToken': user.userToken
      },
      success:function(res){
        console.log(res);
        var isLikeVideo = res.data.data
        if(isLikeVideo == "1"){
          that.setData({
            'isLikeVideo':true
          })
        }
      }
    })
    //获得该视频用户信息
    wx.request({
      url: app.serverUrl + '/user/findOne?userId=' + that.data.videoInfo.userId,
      method:'POST',
      header:{
        'userId':user.id,
        'userToken':user.userToken
      },
      success:function(res){
        console.log(res);
        that.setData({
          'publisher':res.data.data,
          'faceImageUrl':app.serverUrl + res.data.data.faceImage
        });
      }
    })
  },

  //搜索事件
  showSearch:function(){
    // wx.navigateTo({
    //   url: '../searchVideo/searchVideo',
    // })
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  //上传视频
  upload:function(){
    var that = this;
    //未登录 跳转到登陆界面 登陆成功 返回当前页面 并继续播放
    var user = app.getGlobalUserInfo();
    if(user == null || user == undefined || user == ''){
      var videoInfo = JSON.stringify(that.data.videoInfo)
      wx.navigateTo({
        url: '../userLogin/login?videoInfo=' + videoInfo,
      })
    }else{
      videoUtil.uploadVideo();//上传视频
    }
    
  },

  //个人主页
  showMine:function(){
    //未登录 跳转到登陆界面
    var user = app.getGlobalUserInfo();
    var url = '../mine/mine';
    if (user == null || user == undefined || user == '') {
      url = '../userLogin/login'
    }
    wx.navigateTo({
      url: url,
    })
  },

  //首页
  showIndex:function(){
    wx.navigateTo({
      url: '../index/index',
    })
  },

  //喜欢或取消喜欢事件
  likeVideoOrNot:function(){
    var that = this;
    app.isLogin();
    var user = app.getGlobalUserInfo();
    var isLikeVideo = that.data.isLikeVideo;
    var url = '/userLikeVideo/likeVideo?userId=' + user.id +  '&videoId=' + that.data.videoInfo.id
    if(isLikeVideo){//当前喜欢该视频 取消喜欢
      url = '/userLikeVideo/unlikeVideo?userId=' + user.id + '&videoId=' + that.data.videoInfo.id
    }
    wx.request({
      url: app.serverUrl + url,
      method:'POST',
      header:{
        'userId':user.id,
        'userToken':user.userToken
      },
      success:function(){
        that.setData({
          'isLikeVideo':!isLikeVideo
        });
      }
    })
  },

  //头像点击事件
  showPublisher:function(){
    var that = this
    //进入用户主页
    wx.navigateTo({
      url: '../mine/mine?publisherId=' + that.data.publisher.id,
    })
  }
})