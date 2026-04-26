// pages/petDetail/index.js
const util = require('../../utils/util.js');

Page({
  data: {
    pet: {},
    days: 0,
    petId: null
  },

  onLoad(options) {
    const petId = parseInt(options.id);
    this.setData({ petId });
    this.loadPet(petId);
  },

  loadPet(petId) {
    const pets = wx.getStorageSync('petsData') || [];
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      const days = util.calcCompanionDays(pet.homeDate, pet.deathDate);
      this.setData({ pet, days });
    }
  },

  goToWeight() {
    wx.navigateTo({
      url: `/pages/weight/index?id=${this.data.petId}`
    });
  },

  goToDiary() {
    wx.navigateTo({
      url: `/pages/diaryList/index?petId=${this.data.petId}`
    });
  },

  editPet() {
    wx.navigateTo({
      url: `/pages/createPet/index?id=${this.data.petId}`
    });
  },

  createAnother() {
    wx.navigateTo({
      url: '/pages/createPet/index'
    });
  }
});