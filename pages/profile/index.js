// pages/profile/index.js
Page({
  data: {
    userInfo: {
      avatar: '🐻‍❄️',
      avatarType: 'emoji',
      nickname: '小熊饲养员'
    },
    notificationStatus: '开',
    statusBarHeight: 0,
    navBarTop: 0,

    // 头像选择相关
    showAvatarModal: false,
    avatarOptions: ['🐹', '🐭', '🐰', '🐻', '🐼', '🦊', '🐨', '🐯'],
    selectedAvatar: '',
    tempCustomAvatar: '',

    // 昵称编辑相关
    showNicknameModal: false,
    tempNickname: ''
  },

  onLoad() {
    this.initNavBar();
    this.loadUserInfo();
    this.loadNotificationStatus();
  },

  // 初始化导航栏高度
  initNavBar() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = systemInfo.statusBarHeight || 20;
    const navBarTop = menuButton.bottom + (menuButton.top - statusBarHeight);
    this.setData({
      statusBarHeight,
      navBarTop
    });
  },

  onShow() {
    this.loadUserInfo();
    this.loadNotificationStatus();
    // 设置自定义TabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  // 响应TabBar中间加号按钮点击
  onTabAddTap() {
    wx.navigateTo({
      url: '/pages/createPet/index'
    });
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

  // ========== 头像选择功能 ==========

  showAvatarPicker() {
    this.setData({
      showAvatarModal: true,
      selectedAvatar: this.data.userInfo.avatarType === 'emoji' ? this.data.userInfo.avatar : '',
      tempCustomAvatar: this.data.userInfo.avatarType === 'image' ? this.data.userInfo.avatar : ''
    });
  },

  hideAvatarModal() {
    this.setData({
      showAvatarModal: false,
      selectedAvatar: '',
      tempCustomAvatar: ''
    });
  },

  selectAvatar(e) {
    const emoji = e.currentTarget.dataset.emoji;
    this.setData({
      selectedAvatar: emoji,
      tempCustomAvatar: ''
    });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          tempCustomAvatar: tempFilePath,
          selectedAvatar: ''
        });
      }
    });
  },

  confirmAvatar() {
    const { selectedAvatar, tempCustomAvatar } = this.data;

    if (!selectedAvatar && !tempCustomAvatar) {
      wx.showToast({ title: '请选择头像', icon: 'none' });
      return;
    }

    const userInfo = {
      ...this.data.userInfo,
      avatar: tempCustomAvatar || selectedAvatar,
      avatarType: tempCustomAvatar ? 'image' : 'emoji'
    };

    this.setData({ userInfo });
    wx.setStorageSync('userProfile', userInfo);
    wx.showToast({ title: '保存成功', icon: 'success' });
    this.hideAvatarModal();
  },

  // ========== 昵称编辑功能 ==========

  showNicknameEditor() {
    this.setData({
      showNicknameModal: true,
      tempNickname: this.data.userInfo.nickname
    });
  },

  hideNicknameModal() {
    this.setData({
      showNicknameModal: false,
      tempNickname: ''
    });
  },

  onNicknameInput(e) {
    this.setData({
      tempNickname: e.detail.value
    });
  },

  confirmNickname() {
    const { tempNickname } = this.data;

    if (!tempNickname || tempNickname.trim().length < 2) {
      wx.showToast({ title: '昵称至少2个字符', icon: 'none' });
      return;
    }

    const userInfo = {
      ...this.data.userInfo,
      nickname: tempNickname.trim()
    };

    this.setData({ userInfo });
    wx.setStorageSync('userProfile', userInfo);
    wx.showToast({ title: '保存成功', icon: 'success' });
    this.hideNicknameModal();
  },

  // ========== 阻止冒泡 ==========
  stopPropagation() {},

  // ========== 页面跳转 ==========
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