//app.js
App({
  serverUrl:"http://192.168.1.100:8081/video",
  userInfo:null,

  //添加userInfo到本地缓存
  setGlobalUserInfo: function(userInfo){
    wx.setStorageSync("userInfo", userInfo)
  },

  //从本地缓存获得userInfo
  getGlobalUserInfo: function(){
    return wx.getStorageSync("userInfo");
  },

  //从本地缓存删除userInfo
  removeGlobalUserInfo: function(){
    wx.removeStorageSync("userInfo");
  },

  //判断用户是否登陆 没有登陆跳转到登陆页面
  isLogin:function(){
    var user = this.getGlobalUserInfo();
    if(user == null || user == undefined || user == ''){
      wx.navigateTo({
        url: '../userLogin/login',
      })
    }
  }
  

})