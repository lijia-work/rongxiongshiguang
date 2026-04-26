// pages/invite/index.js
Page({
  data: {},

  onShareAppMessage() {
    return {
      title: '快来一起养熊吧！',
      path: '/pages/home/index',
      imageUrl: '' // 可设置自定义分享图片
    };
  }
});