const app = getApp()

Page({
  data: {

  },

  //注册表单 点击事件
  doRegist: function(e) {
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;

    //校验
    if (username.length == 0 || password.length == 0) {
      wx.showToast({ //弹框
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000 //3s后关闭
      })
    } else {
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '请等待...',
      })
      wx.request({ //发送请求
        url: serverUrl + '/regist',
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
          wx.hideLoading();
          var status = res.data.status;
          if (status == 1) { //注册成功
            wx.showToast({
              title: '注册成功',
              duration: 3000
            });
            app.setGlobalUserInfo(res.data.data);//将用户信息保存到本地缓存
            //页面跳转
            wx.navigateTo({
              url: '../mine/mine',
            })
          } else { //注册失败
            wx.showToast({
              title: res.data.detail,
              icon: 'none',
              duration: 3000
            })
          }

        }
      })
    }
  },
  
  //跳转到登陆页面
  goLoginPage: function() {
    wx.navigateTo({
      url: '../userLogin/login',
    })
  }
})