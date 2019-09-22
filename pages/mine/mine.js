const app = getApp()
var videoUtil = require('../../util/upload-video.js')

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",//默认头像
    faceUrlPrefix: app.serverUrl //头像前缀
  },

  //加载页面时，查询用户信息 #why#
  onLoad:function(){
    var me = this;//注意this的作用域问题
    var serverUrl = app.serverUrl;
    var userId = app.getGlobalUserInfo().id;
    wx.showLoading({
      title: '请等待',
    })
    wx.request({
      url: serverUrl + '/user/findOne?userId=' + userId,
      method : 'POST',
      header:{
        'userId':userId,
        'userToken': app.getGlobalUserInfo().userToken
      },
      success:function(res){
        console.log(res);
        wx.hideLoading();
        var status = res.data.status;
        if (status == 1){//成功
          var userInfo = res.data.data;
          var faceUrl = "../resource/images/noneface.png";//默认头像
          if(userInfo.faceImage != null && userInfo.faceImage != '' && userInfo.faceImage != undefined){
            faceUrl = me.data.faceUrlPrefix + userInfo.faceImage;
          }
          me.setData({
            fansCounts: userInfo.fansCounts,//粉丝数
            followCounts: userInfo.followCounts,//关注
            receiveLikeCounts: userInfo.receiveLikeCounts,//获赞数
            faceUrl: faceUrl//头像
          })
        }else if(status == 502){//用户信息验证失败
          wx.showToast({
            title: res.data.detail,
            duration:3000,
            icon:'none',
            success:function(){
              wx.navigateTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }
    })
  },

  //注销事件
  logout: function (e) {
    var userId = app.getGlobalUserInfo().id;
    //校验
    if (userId == null || userId.length == 0) {
      wx.showToast({
        title: '无法获得userId',
        icon: 'none',
        duration: 3000
      })
    } else {
      //发送请求
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '请等待',
      })
      wx.request({
        url: serverUrl + '/logout?userId=' + userId,
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res);
          wx.hideLoading();
          var status = res.data.status;
          if (status == 1) {//成功
            wx.showToast({
              title: '注销成功',
              duration: 3000
            })
            app.removeGlobalUserInfo();
            wx.navigateTo({
              url: '../userLogin/login',
            })
          }
        }
      })
    }


  },

  //上传头像
  changeFace: function () {
    var serverUrl = app.serverUrl
    var userId = app.getGlobalUserInfo().id;
    var me = this;//在下面赋值时，避免作用域的问题

    //选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)

        wx.showLoading({
          title: '请等待',
        })
        //上传图片
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + userId,
          filePath: tempFilePaths[0],
          name: 'files',
          header: {
            'content-type': 'multipart/form-data'
          },
          success(res) {
            wx.hideLoading();
            console.log(res);
            var data = JSON.parse(res.data);//注意文件上传回调的data是String类型而不是Json对象
            console.log(data);
            if(data.status == 1){//上传成功
              wx.showToast({
                title: '上传成功',
                icon: 'success'
              })
              me.setData({//修改头像地址
                faceUrl : me.data.faceUrlPrefix + data.data
              });
            }else{//上传失败
            wx.showToast({
              title: '上传失败',
              icon : 'none',
              duration : 3000
            })

            }

          }
        })


      }
    })
  },

  //上传视频
  uploadVideo : function(){
    videoUtil.uploadVideo();
  }


})
