// pages/invite/index.js
Page({
  data: {
    statusBarHeight: 20
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });
  },

  goBack() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    return {
      title: '快来一起养熊吧！',
      path: '/pages/home/index',
      imageUrl: '' // 可设置自定义分享图片
    };
  }
});