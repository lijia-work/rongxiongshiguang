// pages/diaryList/index.js
Page({
  data: {
    petId: null,
    pet: {},
    diaryList: []
  },

  onLoad(options) {
    const petId = parseInt(options.petId);
    this.setData({ petId });
    this.loadPet(petId);
    this.loadDiaries(petId);
  },

  loadPet(petId) {
    const pets = wx.getStorageSync('petsData') || [];
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      this.setData({ pet });
    }
  },

  loadDiaries(petId) {
    const allDiaries = wx.getStorageSync('diariesData') || {};
    const diaryList = allDiaries[petId] || [];
    // 按日期倒序排列
    diaryList.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.setData({ diaryList });
  },

  createDiary() {
    wx.navigateTo({
      url: `/pages/diaryCreate/index?petId=${this.data.petId}`
    });
  },

  viewDiary(e) {
    const diaryId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/diaryCreate/index?petId=${this.data.petId}&id=${diaryId}`
    });
  },

  onShow() {
    // 返回时刷新列表
    if (this.data.petId) {
      this.loadDiaries(this.data.petId);
    }
  }
});