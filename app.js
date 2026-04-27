// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-d3geiy3nw5a3b3a1d',
        traceUser: true
      });
    }

    // 初始化本地存储数据
    this.initStorage();

    // 检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const openid = wx.getStorageSync('userOpenid');
    const loginTime = wx.getStorageSync('loginTime');
    const now = Date.now();

    // 登录有效期30天
    if (openid && loginTime && (now - loginTime < 30 * 24 * 60 * 60 * 1000)) {
      this.globalData.isLoggedIn = true;
      this.globalData.openid = openid;
    } else {
      this.globalData.isLoggedIn = false;
    }
  },

  initStorage() {
    // 初始化宠物数据（仅游客模式演示数据）
    if (!wx.getStorageSync('petsData')) {
      wx.setStorageSync('petsData', [
        { id: 1001, name: '团团', gender: '♂ 公', breed: '金丝熊', birthDate: '2023-12-01', deathDate: '', homeDate: '2024-01-15', avatar: '🐹' },
        { id: 1002, name: '圆圆', gender: '♀ 母', breed: '长毛金丝熊', birthDate: '2024-09-10', deathDate: '', homeDate: '2024-10-05', avatar: '🐻' }
      ]);
    }

    // 初始化提醒数据
    if (!wx.getStorageSync('todoListData')) {
      const today = this.getTodayStr();
      const threeAgo = new Date();
      threeAgo.setDate(threeAgo.getDate() - 3);
      wx.setStorageSync('todoListData', [
        { id: 1001, name: '换垫料', cycleType: 'weekly', lastCompleteDate: threeAgo.toISOString().slice(0, 10) },
        { id: 1002, name: '喂食营养糊', cycleType: 'daily', lastCompleteDate: today },
        { id: 1003, name: '体外驱虫', cycleType: 'monthly', lastCompleteDate: today }
      ]);
    }

    // 初始化用户信息
    if (!wx.getStorageSync('userProfile')) {
      wx.setStorageSync('userProfile', {
        avatar: '🐻‍❄️',
        avatarType: 'emoji',
        nickname: '小熊饲养员'
      });
    }

    // 初始化通知设置
    if (!wx.getStorageSync('notificationSettings')) {
      wx.setStorageSync('notificationSettings', {
        enabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        doNotDisturb: { enabled: false, startTime: '22:00', endTime: '08:00' }
      });
    }
  },

  getTodayStr() {
    return new Date().toISOString().slice(0, 10);
  },

  globalData: {
    userInfo: null,
    currentPetId: null,
    isLoggedIn: false,
    openid: null
  }
});