// pages/profile/index.js
Page({
  data: {
    userInfo: {
      avatar: '🐻‍❄️',
      avatarType: 'emoji',
      nickname: '小熊饲养员'
    },
    notificationStatus: '开'
  },

  onLoad() {
    this.loadUserInfo();
    this.loadNotificationStatus();
  },

  onShow() {
    this.loadUserInfo();
    this.loadNotificationStatus();
    // 设置自定义TabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userProfile') || {
      avatar: '🐻‍❄️',
      avatarType: 'emoji',
      nickname: '小熊饲养员'
    };
    this.setData({ userInfo });
  },

  loadNotificationStatus() {
    const settings = wx.getStorageSync('notificationSettings') || { enabled: true };
    this.setData({
      notificationStatus: settings.enabled ? '开' : '关'
    });
  },

  editProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit'
    });
  },

  goToNotification() {
    wx.navigateTo({
      url: '/pages/notification/index'
    });
  },

  goToPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/index'
    });
  },

  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/index'
    });
  },

  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/index'
    });
  },

  goToInvite() {
    wx.navigateTo({
      url: '/pages/invite/index'
    });
  }
});