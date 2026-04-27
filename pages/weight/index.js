// pages/weight/index.js
const util = require('../../utils/util.js');

Page({
  data: {
    petId: null,
    pet: {},
    recordDate: '',
    weight: '',
    weightList: [],
    currentWeight: '--',
    statusBarHeight: 20
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });

    const petId = parseInt(options.id);
    this.setData({
      petId,
      recordDate: util.getTodayStr()
    });
    this.loadPet(petId);
    this.loadWeights(petId);
  },

  goBack() {
    wx.navigateBack();
  },

  loadPet(petId) {
    const pets = wx.getStorageSync('petsData') || [];
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      this.setData({ pet });
    }
  },

  loadWeights(petId) {
    const allWeights = wx.getStorageSync('weightsData') || {};
    const weightList = allWeights[petId] || [];
    // 按日期倒序排列
    weightList.sort((a, b) => new Date(b.date) - new Date(a.date));

    const currentWeight = weightList.length > 0 ? weightList[0].weight : '--';
    this.setData({ weightList, currentWeight });
  },

  onDateChange(e) {
    this.setData({ recordDate: e.detail.value });
  },

  onWeightInput(e) {
    this.setData({ weight: e.detail.value });
  },

  addWeight() {
    const { petId, recordDate, weight } = this.data;

    // 验证
    if (!weight || isNaN(parseFloat(weight))) {
      wx.showToast({ title: '请输入有效体重', icon: 'none' });
      return;
    }

    const weightNum = parseFloat(weight);
    if (weightNum < 10 || weightNum > 500) {
      wx.showToast({ title: '体重范围: 10-500g', icon: 'none' });
      return;
    }

    if (recordDate > util.getTodayStr()) {
      wx.showToast({ title: '日期不能晚于今天', icon: 'none' });
      return;
    }

    const record = {
      id: Date.now(),
      date: recordDate,
      weight: weightNum,
      createTime: Date.now()
    };

    // 保存
    let allWeights = wx.getStorageSync('weightsData') || {};
    if (!allWeights[petId]) {
      allWeights[petId] = [];
    }
    allWeights[petId].push(record);
    wx.setStorageSync('weightsData', allWeights);

    // 清空表单
    this.setData({
      weight: '',
      recordDate: util.getTodayStr()
    });

    this.loadWeights(petId);
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  deleteWeight(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const { petId } = this.data;
          let allWeights = wx.getStorageSync('weightsData') || {};
          if (allWeights[petId]) {
            allWeights[petId] = allWeights[petId].filter(w => w.id !== id);
            wx.setStorageSync('weightsData', allWeights);
          }
          this.loadWeights(petId);
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});