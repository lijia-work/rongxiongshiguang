// pages/notification/index.js
Page({
  data: {
    reminderEnabled: true,
    soundEnabled: true,
    vibrateEnabled: false,
    reminderTime: '09:00',
    statusBarHeight: 20
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });
    this.loadSettings();
  },

  goBack() {
    wx.navigateBack();
  },

  loadSettings() {
    const settings = wx.getStorageSync('notificationSettings') || {};
    this.setData({
      reminderEnabled: settings.reminderEnabled !== false,
      soundEnabled: settings.soundEnabled !== false,
      vibrateEnabled: settings.vibrateEnabled || false,
      reminderTime: settings.reminderTime || '09:00'
    });
  },

  saveSettings() {
    const { reminderEnabled, soundEnabled, vibrateEnabled, reminderTime } = this.data;
    wx.setStorageSync('notificationSettings', {
      reminderEnabled,
      soundEnabled,
      vibrateEnabled,
      reminderTime
    });
  },

  toggleReminder() {
    this.setData({
      reminderEnabled: !this.data.reminderEnabled
    }, this.saveSettings);
  },

  toggleSound() {
    this.setData({
      soundEnabled: !this.data.soundEnabled
    }, this.saveSettings);
  },

  toggleVibrate() {
    this.setData({
      vibrateEnabled: !this.data.vibrateEnabled
    }, this.saveSettings);
  },

  setReminderTime() {
    wx.showActionSheet({
      itemList: ['08:00', '09:00', '10:00', '12:00', '18:00', '20:00'],
      success: (res) => {
        const times = ['08:00', '09:00', '10:00', '12:00', '18:00', '20:00'];
        this.setData({
          reminderTime: times[res.tapIndex]
        }, this.saveSettings);
      }
    });
  }
});