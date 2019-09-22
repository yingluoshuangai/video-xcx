//上传视频
function uploadVideo() {
  var me = this; //注意this的作用域问题
  wx.chooseVideo({
    sourceType: ['album', 'camera'],
    compressed: true,
    maxDuration: 300,
    success(res) {
      console.log(res)
      var duration = res.duration
      var height = res.height
      var width = res.width
      var size = res.size
      var tempFilePath = res.tempFilePath
      var thumbTempFilePath = res.thumbTempFilePath

      if (duration > 300) {
        wx.showToast({
          title: '选择的视频不能大于300秒',
          icon: "none"
        })
      } else if (duration < 1) {
        wx.showToast({
          title: '选择的视频不能小于1秒',
          icon: "none"
        })
      } else {
        //进入选择bgm页面
        wx.navigateTo({
          url: '../chooseBgm/chooseBgm?' +
            'duration=' + duration +
            '&height=' + height +
            '&width=' + width +
            '&size=' + size +
            '&tempFilePath=' + tempFilePath +
            '&thumbTempFilePath=' + thumbTempFilePath,
        })
      }


    }
  })
}

//将方法暴露出去
module.exports = {
  uploadVideo: uploadVideo
}