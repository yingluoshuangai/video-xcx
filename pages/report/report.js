//获取应用实例
const app = getApp()

Page({
  data: ({
    reasonType:'请选择原因',
    reportReasonArray: [
      "色情低俗",
      "政治敏感",
      "涉嫌诈骗",
      "辱骂谩骂",
      "广告垃圾",
      "诱导分享",
      "引人不适",
      "过于暴力",
      "违法违纪",
      "其它原因"],
      videoId:'', //视频id
      publishUserId:'', //发布者id
  }),

  onLoad:function(params){
    var that = this
    console.log(params)
    that.setData({
      videoId: params.videoId,
      publishUserId: params.publishUserId
    })
  },

  changeMe:function(e){
    console.log(e)
    var that = this
    var index = e.detail.value
    var reasonType = that.data.reportReasonArray[index]
    that.setData({
      reasonType:reasonType
    })
  },

  //表单提交
  submitReport:function(e){
    var that = this
    console.log(e)
    var user = app.getGlobalUserInfo()
    var serverUrl = app.serverUrl
    var reportIndex = e.detail.value.reasonIndex
    var reportContent = e.detail.value.reasonContent
    if (reportIndex == null || reportIndex == undefined || reportIndex == ''){
      wx.showToast({
        title: '请选择举报理由',
        duration:1500,
        icon:'none'
      })
      return
    }
    var reportTitle = that.data.reportReasonArray[reportIndex]

    wx.request({
      url: serverUrl + '/userReport/saveUserReport',
      method:'POST',
      header:{
        'userId': user.id,
        'userToken': user.userToken
      },
      data:{
        reportUserId: user.id,
        dealUserId: that.data.publishUserId,
        dealVidelId: that.data.videoId,
        title: reportTitle,
        content:reportContent
      },
      success:function(res){
        wx.showToast({
          title: '举报成功',
          duration:2000,
          icon:'none',
          success:function(){
            wx.navigateBack()
          }
        })
      }
    })
  }
})