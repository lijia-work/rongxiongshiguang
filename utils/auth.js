// utils/auth.js - 登录授权管理模块

/**
 * 检查是否已登录
 */
function isLoggedIn() {
  return wx.getStorageSync('userOpenid') && wx.getStorageSync('loginTime');
}

/**
 * 获取用户openid
 */
function getOpenid() {
  return wx.getStorageSync('userOpenid');
}

/**
 * 微信登录
 * 使用云开发获取用户openid
 */
function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        if (res.result.success) {
          // 保存登录信息
          wx.setStorageSync('userOpenid', res.result.openid);
          wx.setStorageSync('loginTime', Date.now());

          // 如果有用户数据，保存到本地
          if (res.result.userData) {
            const userData = res.result.userData;
            wx.setStorageSync('userProfile', {
              nickname: userData.nickname,
              avatar: userData.avatar,
              avatarType: userData.avatarType
            });
          }

          resolve({
            success: true,
            openid: res.result.openid,
            userData: res.result.userData
          });
        } else {
          reject(new Error(res.result.error || '登录失败'));
        }
      },
      fail: err => {
        reject(err);
      }
    });
  });
}

/**
 * 退出登录
 */
function logout() {
  wx.removeStorageSync('userOpenid');
  wx.removeStorageSync('loginTime');
}

/**
 * 更新用户资料到云端
 */
function updateUserProfile(profile) {
  return new Promise((resolve, reject) => {
    const openid = getOpenid();
    if (!openid) {
      resolve({ success: true }); // 未登录时只保存本地
      return;
    }

    wx.cloud.callFunction({
      name: 'syncData',
      data: {
        action: 'upload',
        dataType: 'profile',
        data: profile
      },
      success: res => {
        resolve(res.result);
      },
      fail: err => {
        reject(err);
      }
    });
  });
}

module.exports = {
  isLoggedIn,
  getOpenid,
  wxLogin,
  logout,
  updateUserProfile
};