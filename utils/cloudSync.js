// utils/cloudSync.js - 云端数据同步管理模块

const auth = require('./auth.js');

/**
 * 上传所有本地数据到云端
 */
function uploadAllData() {
  return new Promise((resolve, reject) => {
    if (!auth.isLoggedIn()) {
      resolve({ success: false, message: '请先登录' });
      return;
    }

    wx.showLoading({ title: '同步中...', mask: true });

    // 收集所有本地数据
    const allData = {
      petsData: wx.getStorageSync('petsData') || [],
      diariesData: wx.getStorageSync('diariesData') || {},
      weightsData: wx.getStorageSync('weightsData') || {},
      todoListData: wx.getStorageSync('todoListData') || [],
      userProfile: wx.getStorageSync('userProfile') || {}
    };

    wx.cloud.callFunction({
      name: 'syncData',
      data: {
        action: 'syncAll',
        allData: allData
      },
      success: res => {
        wx.hideLoading();
        if (res.result.success) {
          wx.showToast({ title: '同步成功', icon: 'success' });
          resolve(res.result);
        } else {
          wx.showToast({ title: '同步失败', icon: 'none' });
          reject(new Error(res.result.error));
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '同步失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * 从云端下载所有数据到本地
 */
function downloadAllData() {
  return new Promise((resolve, reject) => {
    if (!auth.isLoggedIn()) {
      resolve({ success: false, message: '请先登录' });
      return;
    }

    wx.showLoading({ title: '加载中...', mask: true });

    wx.cloud.callFunction({
      name: 'getUserData',
      data: {},
      success: res => {
        wx.hideLoading();
        if (res.result.success && res.result.data) {
          const data = res.result.data;

          // 保存到本地存储
          if (data.petsData && data.petsData.length > 0) {
            wx.setStorageSync('petsData', data.petsData);
          }
          if (data.diariesData && Object.keys(data.diariesData).length > 0) {
            wx.setStorageSync('diariesData', data.diariesData);
          }
          if (data.weightsData && Object.keys(data.weightsData).length > 0) {
            wx.setStorageSync('weightsData', data.weightsData);
          }
          if (data.todoListData && data.todoListData.length > 0) {
            wx.setStorageSync('todoListData', data.todoListData);
          }
          if (data.userProfile) {
            wx.setStorageSync('userProfile', data.userProfile);
          }

          wx.showToast({ title: '数据已同步', icon: 'success' });
          resolve({ success: true, data: data });
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' });
          reject(new Error(res.result.error || '获取数据失败'));
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '加载失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * 同步单个宠物数据
 */
function syncPetData(pet) {
  return new Promise((resolve, reject) => {
    if (!auth.isLoggedIn()) {
      resolve({ success: true }); // 未登录时忽略
      return;
    }

    wx.cloud.callFunction({
      name: 'syncData',
      data: {
        action: 'upload',
        dataType: 'pets',
        data: wx.getStorageSync('petsData') || []
      },
      success: res => resolve(res.result),
      fail: err => reject(err)
    });
  });
}

/**
 * 同步日记数据
 */
function syncDiaryData() {
  return new Promise((resolve, reject) => {
    if (!auth.isLoggedIn()) {
      resolve({ success: true });
      return;
    }

    const diariesData = wx.getStorageSync('diariesData') || {};
    const diariesArray = [];
    for (const petId in diariesData) {
      diariesData[petId].forEach(diary => {
        diariesArray.push({ ...diary, petId: parseInt(petId) });
      });
    }

    wx.cloud.callFunction({
      name: 'syncData',
      data: {
        action: 'upload',
        dataType: 'diaries',
        data: diariesArray
      },
      success: res => resolve(res.result),
      fail: err => reject(err)
    });
  });
}

/**
 * 同步体重数据
 */
function syncWeightData() {
  return new Promise((resolve, reject) => {
    if (!auth.isLoggedIn()) {
      resolve({ success: true });
      return;
    }

    const weightsData = wx.getStorageSync('weightsData') || {};
    const weightsArray = [];
    for (const petId in weightsData) {
      weightsData[petId].forEach(weight => {
        weightsArray.push({ ...weight, petId: parseInt(petId) });
      });
    }

    wx.cloud.callFunction({
      name: 'syncData',
      data: {
        action: 'upload',
        dataType: 'weights',
        data: weightsArray
      },
      success: res => resolve(res.result),
      fail: err => reject(err)
    });
  });
}

/**
 * 同步提醒数据
 */
function syncTodoData() {
  return new Promise((resolve, reject) => {
    if (!auth.isLoggedIn()) {
      resolve({ success: true });
      return;
    }

    wx.cloud.callFunction({
      name: 'syncData',
      data: {
        action: 'upload',
        dataType: 'todos',
        data: wx.getStorageSync('todoListData') || []
      },
      success: res => resolve(res.result),
      fail: err => reject(err)
    });
  });
}

/**
 * 同步用户资料
 */
function syncUserProfile() {
  return new Promise((resolve, reject) => {
    if (!auth.isLoggedIn()) {
      resolve({ success: true });
      return;
    }

    wx.cloud.callFunction({
      name: 'syncData',
      data: {
        action: 'syncAll',
        allData: {
          userProfile: wx.getStorageSync('userProfile') || {}
        }
      },
      success: res => resolve(res.result),
      fail: err => reject(err)
    });
  });
}

module.exports = {
  uploadAllData,
  downloadAllData,
  syncPetData,
  syncDiaryData,
  syncWeightData,
  syncTodoData,
  syncUserProfile
};