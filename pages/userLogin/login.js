const app = getApp()

Page({
  data: {

  },

  onLoad:function(params){
    var that = this;
    var videoInfo = params.videoInfo;
    this.videoInfo = videoInfo;

  },
  //登陆点击事件
  doLogin: function(e) {
    var that = this;
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;

    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码为空！',
        icon: 'none',
        duration: 3000
      })
    } else {
      var serverUrl = app.serverUrl;
      wx.showLoading({//发送请求前，展示等待弹框，优化客户体验
        title: '请等待...',
      })
      wx.request({
        url: serverUrl + '/login',
        method: 'POST',
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          console.log(res);
          wx.hideLoading();//关闭等待弹窗
          //保存用户信息
          var status = res.data.status;
          if (status == 1){
            //登陆成功
            app.setGlobalUserInfo(res.data.data);
            wx.showToast({
              title: '登陆成功',
              icon : 'success',
              duration : 3000
            })
            //如果没有视频信息，跳转到主页面， 否则跳转到对应视频页面
            var videoInfo = that.videoInfo;
            if(videoInfo == null || videoInfo == undefined || videoInfo == ''){//跳转到主页面
              wx.navigateTo({
                url: '../index/index',
              })
            }else{
              wx.navigateTo({
                url: '../videoInfo/videoInfo?videoInfo=' + videoInfo,
              })
            }
            
          }else{
            wx.showToast({
              title: res.data.detail,
              icon : 'none',
              duration : 3000
            })
          }
          

        }
      })
    }
  },

  //跳转注册页面
  goRegistPage : function(){
    wx.navigateTo({
      url: '../userRegist/regist',
    })
  }
})