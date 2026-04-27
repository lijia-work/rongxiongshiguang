// pages/profile/index.js
const auth = require('../../utils/auth.js');
const cloudSync = require('../../utils/cloudSync.js');

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

    // 登录状态
    isLoggedIn: false,
    wechatAvatarUrl: '',
    lastSyncTime: '',

    // 登录弹窗
    showLoginModal: false,

    // 头像选择相关
    showAvatarModal: false,
    avatarOptions: ['🐹', '🐭', '🐰', '🐻', '🐼', '🦊', '🐨', '🐯'],
    selectedAvatar: '',
    tempCustomAvatar: '',
    selectedWechatAvatar: false,

    // 昵称编辑相关
    showNicknameModal: false,
    tempNickname: ''
  },

  onLoad() {
    this.initNavBar();
    this.loadUserInfo();
    this.loadNotificationStatus();
    this.checkLoginStatus();
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
    this.checkLoginStatus();
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

  // ========== 登录状态检查 ==========
  checkLoginStatus() {
    const isLoggedIn = auth.isLoggedIn();
    this.setData({ isLoggedIn });

    if (isLoggedIn) {
      // 获取微信头像URL
      const userProfile = wx.getStorageSync('userProfile');
      if (userProfile && userProfile.wechatAvatarUrl) {
        this.setData({ wechatAvatarUrl: userProfile.wechatAvatarUrl });
      }

      // 获取最后同步时间
      const lastSyncTime = wx.getStorageSync('lastSyncTime');
      if (lastSyncTime) {
        this.setData({
          lastSyncTime: this.formatTime(lastSyncTime)
        });
      }
    }
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
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

  // ========== 登录功能 ==========

  showLoginModal() {
    this.setData({ showLoginModal: true });
  },

  hideLoginModal() {
    this.setData({ showLoginModal: false });
  },

  // 选择微信头像回调
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    if (avatarUrl) {
      this.setData({
        wechatAvatarUrl: avatarUrl
      });

      // 保存微信头像
      const userInfo = {
        ...this.data.userInfo,
        avatar: avatarUrl,
        avatarType: 'image',
        wechatAvatarUrl: avatarUrl
      };
      this.setData({ userInfo });
      wx.setStorageSync('userProfile', userInfo);
    }
  },

  // 微信一键登录
  async handleLogin() {
    wx.showLoading({ title: '登录中...', mask: true });

    try {
      const result = await auth.wxLogin();

      if (result.success) {
        wx.hideLoading();

        // 更新本地用户信息
        if (result.userData) {
          const userInfo = {
            ...this.data.userInfo,
            nickname: result.userData.nickname || this.data.userInfo.nickname,
            avatar: result.userData.avatar || this.data.userInfo.avatar,
            avatarType: result.userData.avatarType || this.data.userInfo.avatarType
          };
          this.setData({ userInfo });
          wx.setStorageSync('userProfile', userInfo);
        }

        this.setData({
          isLoggedIn: true,
          showLoginModal: false
        });

        wx.showToast({ title: '登录成功', icon: 'success' });

        // 自动下载云端数据
        this.downloadFromCloud();
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      console.error('登录失败:', err);
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '退出登录后，云端数据仍会保留，下次登录可继续同步。确定退出吗？',
      success: (res) => {
        if (res.confirm) {
          auth.logout();
          this.setData({
            isLoggedIn: false,
            wechatAvatarUrl: '',
            lastSyncTime: ''
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  // ========== 数据同步 ==========

  async syncToCloud() {
    try {
      await cloudSync.uploadAllData();
      const now = Date.now();
      wx.setStorageSync('lastSyncTime', now);
      this.setData({
        lastSyncTime: this.formatTime(now)
      });
    } catch (err) {
      console.error('同步失败:', err);
    }
  },

  async downloadFromCloud() {
    try {
      const result = await cloudSync.downloadAllData();
      if (result.success) {
        this.loadUserInfo();
        const now = Date.now();
        wx.setStorageSync('lastSyncTime', now);
        this.setData({
          lastSyncTime: this.formatTime(now)
        });
      }
    } catch (err) {
      console.error('下载失败:', err);
    }
  },

  // ========== 头像选择功能 ==========

  showAvatarPicker() {
    this.setData({
      showAvatarModal: true,
      selectedAvatar: this.data.userInfo.avatarType === 'emoji' ? this.data.userInfo.avatar : '',
      tempCustomAvatar: this.data.userInfo.avatarType === 'image' && !this.data.userInfo.wechatAvatarUrl ? this.data.userInfo.avatar : '',
      selectedWechatAvatar: false
    });
  },

  hideAvatarModal() {
    this.setData({
      showAvatarModal: false,
      selectedAvatar: '',
      tempCustomAvatar: '',
      selectedWechatAvatar: false
    });
  },

  selectAvatar(e) {
    const emoji = e.currentTarget.dataset.emoji;
    this.setData({
      selectedAvatar: emoji,
      tempCustomAvatar: '',
      selectedWechatAvatar: false
    });
  },

  selectWechatAvatar() {
    this.setData({
      selectedWechatAvatar: true,
      selectedAvatar: '',
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
          selectedAvatar: '',
          selectedWechatAvatar: false
        });
      }
    });
  },

  async confirmAvatar() {
    const { selectedAvatar, tempCustomAvatar, selectedWechatAvatar, wechatAvatarUrl, isLoggedIn } = this.data;

    if (!selectedAvatar && !tempCustomAvatar && !selectedWechatAvatar) {
      wx.showToast({ title: '请选择头像', icon: 'none' });
      return;
    }

    let userInfo = { ...this.data.userInfo };

    if (selectedWechatAvatar && wechatAvatarUrl) {
      userInfo = {
        ...userInfo,
        avatar: wechatAvatarUrl,
        avatarType: 'image',
        wechatAvatarUrl: wechatAvatarUrl
      };
    } else if (tempCustomAvatar) {
      userInfo = {
        ...userInfo,
        avatar: tempCustomAvatar,
        avatarType: 'image',
        wechatAvatarUrl: userInfo.wechatAvatarUrl || ''
      };
    } else {
      userInfo = {
        ...userInfo,
        avatar: selectedAvatar,
        avatarType: 'emoji'
      };
    }

    this.setData({ userInfo });
    wx.setStorageSync('userProfile', userInfo);

    // 同步到云端
    if (isLoggedIn) {
      try {
        await cloudSync.syncUserProfile();
      } catch (err) {
        console.error('同步失败:', err);
      }
    }

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

  syncWechatNickname() {
    // 获取微信昵称（通过昵称输入框）
    wx.showModal({
      title: '提示',
      content: '请在下方输入框中直接输入您想使用的昵称',
      showCancel: false
    });
  },

  async confirmNickname() {
    const { tempNickname, isLoggedIn } = this.data;

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

    // 同步到云端
    if (isLoggedIn) {
      try {
        await cloudSync.syncUserProfile();
      } catch (err) {
        console.error('同步失败:', err);
      }
    }

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

  goToAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/index'
    });
  },

  goToPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/privacyPolicy/index'
    });
  },

  goToAgreementFromModal() {
    this.hideLoginModal();
    wx.navigateTo({
      url: '/pages/agreement/index'
    });
  },

  goToPrivacyPolicyFromModal() {
    this.hideLoginModal();
    wx.navigateTo({
      url: '/pages/privacyPolicy/index'
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