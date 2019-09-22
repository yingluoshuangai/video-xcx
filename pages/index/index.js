//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    totalPage: 1,//页数
    pageNum: 1,//页码
    pageSize: 5,//页面容量
    videoList: [],
    screenWidth: 350, //屏幕宽度
    videoUrlPre : app.serverUrl,
    searchContent:{}//查询条件
  },

  onLoad: function(params) {
    var me = this;
    //获取系统参数，调整视频宽度
    var systemInfo = wx.getSystemInfoSync() 
    me.setData({
      screenWidth: systemInfo.screenWidth
    });

    var videoDesc = params.searchValue;//搜索页面的值
    me.setData({
      searchContent: { 'videoDesc': videoDesc}
    });
    var pageNum = me.data.pageNum;
    me.findVideoList(pageNum);
  },

  //上拉事件
  onReachBottom : function(){
    var me = this;
    var currentPage = me.data.pageNum;//当前页
    var totalPage = me.data.totalPage;//总页数
    if(currentPage == totalPage){
      wx.showToast({
        title: '已经到底啦~~',
        icon : 'none'
      })
      return
    }
    //查询视频
    me.findVideoList(currentPage + 1);

  },
  
  //下拉事件
  onPullDownRefresh : function(){
    var me = this;
    wx.showNavigationBarLoading();//页面优化，导航栏出现加载动画
    me.findVideoList(1);
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();//页面优化，当页面刷新完成，主动关闭加载动画
  },

  //获取视频
  findVideoList : function(pageNum){
    var me = this;
    wx.showLoading({
      title: '请等待',
    })
    var serverUrl = app.serverUrl;
    var pageSize = me.data.pageSize;
    var searchContent = me.data.searchContent;
    wx.request({
      url: serverUrl + '/video/findList?pageNum=' + pageNum + '&pageSize=' + pageSize,
      method: "POST",
      header:{
        'userId': app.getGlobalUserInfo().id,
        'userToken':app.getGlobalUserInfo().userToken
      },
      data: searchContent,
      success: function (res) {
        wx.hideLoading();
        console.log(res);

        if (pageNum == 1) {//如果第一页需要将videoList清空，否则下滑刷新，会导致原来的视频依然在最前面
          me.setData({
            videoList: []
          });
        }

        var videoList = me.data.videoList;
        me.setData({
          videoList: videoList.concat(res.data.data.list),
          totalPage: res.data.data.pages,
          pageNum : res.data.data.pageNum
        });

      }
    })
  },

  //视频点击事件
  showVideoInfo:function(e){
    var that = this;
    var videoList = that.data.videoList;
    var arrindex = e.target.dataset.arrindex;//视频下标
    var videoInfo = JSON.stringify(videoList[arrindex]);// 页面传递对象 需要转成String进行
    //跳转到视频详情页
    wx.navigateTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo,
    })
  }

})