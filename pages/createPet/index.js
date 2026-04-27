// pages/createPet/index.js
const util = require('../../utils/util.js');

Page({
  data: {
    // 表单数据
    selectedAvatar: '🐹',
    customAvatar: '',
    name: '',
    genderIndex: 0,
    genderOptions: ['未知', '公', '母'],
    breed: '',
    birthDate: '',
    deathDate: '',
    homeDate: '',

    // 头像选项
    avatarOptions: ['🐹', '🐭', '🐰', '🐻', '🐼', '🦊', '🐨', '🐯'],

    // 编辑模式
    isEdit: false,
    petId: null,

    // 导航栏
    statusBarHeight: 20
  },

  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });

    // 初始化默认到家日期为今天
    const today = util.getTodayStr();
    this.setData({ homeDate: today });

    // 编辑模式
    if (options.id) {
      const petId = parseInt(options.id);
      this.loadPet(petId);
    }
  },

  goBack() {
    wx.navigateBack();
  },

  loadPet(petId) {
    const pets = wx.getStorageSync('petsData') || [];
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      this.setData({
        isEdit: true,
        petId: petId,
        selectedAvatar: pet.avatar || '🐹',
        customAvatar: pet.customAvatar || '',
        name: pet.name,
        genderIndex: this.data.genderOptions.indexOf(pet.gender) || 0,
        breed: pet.breed || '',
        birthDate: pet.birthDate || '',
        deathDate: pet.deathDate || '',
        homeDate: pet.homeDate || ''
      });
    }
  },

  // 选择头像
  selectAvatar(e) {
    const emoji = e.currentTarget.dataset.emoji;
    this.setData({
      selectedAvatar: emoji,
      customAvatar: ''
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          customAvatar: tempFilePath,
          selectedAvatar: ''
        });
      }
    });
  },

  // 输入处理
  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onBreedInput(e) {
    this.setData({ breed: e.detail.value });
  },

  // 选择器处理
  onGenderChange(e) {
    this.setData({ genderIndex: parseInt(e.detail.value) });
  },

  onBirthDateChange(e) {
    this.setData({ birthDate: e.detail.value });
  },

  onDeathDateChange(e) {
    this.setData({ deathDate: e.detail.value });
  },

  onHomeDateChange(e) {
    this.setData({ homeDate: e.detail.value });
  },

  // 保存宠物
  savePet() {
    const { name, genderOptions, genderIndex, breed, birthDate, deathDate, homeDate, selectedAvatar, customAvatar, isEdit, petId } = this.data;

    // 验证
    if (!name || name.trim().length < 2) {
      wx.showToast({ title: '昵称至少2个字符', icon: 'none' });
      return;
    }

    if (name.length > 12) {
      wx.showToast({ title: '昵称最多12个字符', icon: 'none' });
      return;
    }

    if (!homeDate) {
      wx.showToast({ title: '请选择到家日期', icon: 'none' });
      return;
    }

    // 日期逻辑验证
    if (birthDate && deathDate && birthDate > deathDate) {
      wx.showToast({ title: '出生日期不能晚于死亡日期', icon: 'none' });
      return;
    }

    const today = util.getTodayStr();
    if (homeDate > today) {
      wx.showToast({ title: '到家日期不能晚于今天', icon: 'none' });
      return;
    }

    // 构建宠物数据
    const pet = {
      id: isEdit ? petId : Date.now(),
      name: name.trim(),
      avatar: selectedAvatar,
      customAvatar: customAvatar,
      gender: genderOptions[genderIndex],
      breed: breed.trim(),
      birthDate,
      deathDate,
      homeDate,
      createTime: isEdit ? undefined : Date.now(),
      updateTime: Date.now()
    };

    // 保存到存储
    let pets = wx.getStorageSync('petsData') || [];
    if (isEdit) {
      const index = pets.findIndex(p => p.id === petId);
      if (index !== -1) {
        pet.createTime = pets[index].createTime;
        pets[index] = pet;
      }
    } else {
      pets.push(pet);
    }

    wx.setStorageSync('petsData', pets);
    wx.showToast({
      title: isEdit ? '保存成功' : '创建成功',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 取消
  cancel() {
    wx.navigateBack();
  }
});