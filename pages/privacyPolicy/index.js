// pages/privacyPolicy/index.js
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
  }
});