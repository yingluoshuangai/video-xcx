const app = getApp()
var videoUtil = require('../../util/upload-video.js')

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",//默认头像
    faceUrlPrefix: app.serverUrl, //头像前缀
    isMe:true, //是否本人 
    isFollow:false, //是否关注
    publisherId:'',//关注者id
    serverUrl:app.serverUrl,

    //作品 收藏 关注 的样式
    videoSelClass:"video-info", //默认样式
    isSelectedWork:"video-info-selected", //选中样式
    isSelectedLike:"",
    isSelectedFollow:"",

    myVideoList:[],
    totalPage:'1',
    pageNum:'1',
    pageSize:'5',
    currentTag: 'me', //当前所在tag页 me 作品页 like 收藏页 follow 关注页

  },

  //加载页面时，查询用户信息 #why#
  onLoad:function(params){
    var me = this;//注意this的作用域问题
    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var userId = app.getGlobalUserInfo().id;
    //debugger
    // 如果publisher有值 表明是别人访问主页
    var publisherId = params.publisherId
    if(publisherId != null && publisherId != undefined && publisherId != '' && publisherId != userId){
        userId = publisherId
        me.setData({
          isMe:false,
          publisherId:publisherId
        })
      //判断用户是否关注
      wx.request({
        url: app.serverUrl + '/user/isFollow?userId=' + publisherId + '&fansId=' + user.id,
        method: 'POST',
        header: {
          'userId': user.id,
          'userToken': user.userToken
        },
        success: function (res) {
          console.log(res)
          if (res.data.data == '1') {
            //关注中
            me.setData({
              isFollow: true
            })

          }
        }
      })
    }

    wx.showLoading({
      title: '请等待',
    })
    wx.request({
      url: serverUrl + '/user/findOne?userId=' + userId,
      method : 'POST',
      header:{
        'userId':user.id,
        'userToken': user.userToken
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

    me.doSelectWork();//展示作品页面
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
  },

  //关注与取消关注
  followMe:function(e){
    var that = this
    var publisherId = that.data.publisherId
    var user = app.getGlobalUserInfo()
    var followType = e.currentTarget.dataset.followtype;
    var url = ''
    //关注或者取消关注
    if(followType == 0){
      //取消关注
      url = app.serverUrl + '/user/noAttention?userId=' + publisherId + '&fansId=' + user.id
    }else if(followType == 1){
      //关注
      url = app.serverUrl + '/user/attention?userId=' + publisherId + '&fansId=' + user.id
    }
    wx.request({
      url: url,
      method:'POST',
      header:{
        'userId': user.id,
        'userToken': user.userToken
      },
      success:function(res){
        console.log(res)
        that.setData({
          isFollow:!that.data.isFollow
        })
      }
    })
  },

  // 作品 收藏 关注 点击事件
  //作品 点击事件
  doSelectWork:function(){
    var that = this
    that.setData({
      isSelectedWork: "video-info-selected", //为作品按钮添加选中样式
      isSelectedLike: "",
      isSelectedFollow: "",
      currentTag: 'me',
      myVideoList:[],
      pageNum:'1',
      totalPage:'1',
    })
    var user = app.getGlobalUserInfo();
    var url = app.serverUrl + '/video/findListByMe?userId=' + user.id
      + '&pageNum=' + that.data.pageNum + '&pageSize=' + that.data.pageSize
    this.getVideoList(url)
  },
 
  //收藏 点击事件
  doSelectLike:function(){
    var that = this
    that.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected", //选中样式
      isSelectedFollow: "",
      currentTag: 'like',
      myVideoList: [],
      pageNum: '1',
      totalPage: '1',
    })

    var user = app.getGlobalUserInfo();
    var url = app.serverUrl + '/video/findListByLike?loginUserId=' + user.id
      + '&pageNum=' + that.data.pageNum + '&pageSize=' + that.data.pageSize
    this.getVideoList(url)
  },

  //关注 点击事件
  doSelectFollow:function(){
    var that = this
    that.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected", //选中样式
      currentTag: 'follow',
      myVideoList: [],
      pageNum: '1',
      totalPage: '1',
    })

    var user = app.getGlobalUserInfo();
    var url = app.serverUrl + '/video/findListByFollow?fansId=' + user.id
      + '&pageNum=' + that.data.pageNum + '&pageSize=' + that.data.pageSize
    this.getVideoList(url)
  },

  //获得视频列表
  getVideoList:function(url){
    var that = this
    var user = app.getGlobalUserInfo();

    wx.request({
      url: url,
      method:'POST',
      header:{
        'userId': user.id,
        'userToken': user.userToken
      },
      success:function(res){
        console.log(res)
        var myVideoList = that.data.myVideoList
        that.setData({
          myVideoList:myVideoList.concat(res.data.data.list),
          totalPage: res.data.data.pages,
          pageNum: res.data.data.pageNum
        })
      }
    })
  },

  //上拉事件
  onReachBottom: function () {
    var that = this
    var user = app.getGlobalUserInfo();
    var pageNum = that.data.pageNum + 1
    var pageSize = that.data.pageSize

    if('me' == that.data.currentTag){
      var url = app.serverUrl + '/video/findListByMe?userId=' + user.id
        + '&pageNum=' + pageNum + '&pageSize=' + pageSize
      that.getVideoList(url)
    }
    if('like' == that.data.currentTag){
      var url = app.serverUrl + '/video/findListByLike?loginUserId=' + user.id
        + '&pageNum=' + pageNum + '&pageSize=' + pageSize
      that.getVideoList(url)
    }
    if('follow' == that.data.currentTag){
      var url = app.serverUrl + '/video/findListByFollow?fansId=' + user.id
        + '&pageNum=' + pageNum + '&pageSize=' + pageSize
      that.getVideoList(url)
    }
  },

  //视频点击事件
  showVideo:function(e){
    var that = this;
    var videoList = that.data.myVideoList;
    var arrindex = e.target.dataset.arrindex;//视频下标
    var videoInfo = JSON.stringify(videoList[arrindex]);// 页面传递对象 需要转成String进行
    //跳转到视频详情页
    wx.navigateTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo,
    })
  }

})
