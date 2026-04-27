// pages/diaryCreate/index.js
const util = require('../../utils/util.js');

Page({
  data: {
    petId: null,
    diaryId: null,
    isEdit: false,
    date: '',
    selectedMood: '😊',
    moodOptions: ['😊', '😄', '🥰', '😴', '😢', '😤'],
    content: '',
    images: [],
    statusBarHeight: 20
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });

    const petId = parseInt(options.petId);
    this.setData({
      petId,
      date: util.getTodayStr()
    });

    // 编辑模式
    if (options.id) {
      this.loadDiary(parseInt(options.id));
    }
  },

  goBack() {
    wx.navigateBack();
  },

  loadDiary(diaryId) {
    const allDiaries = wx.getStorageSync('diariesData') || {};
    const diaries = allDiaries[this.data.petId] || [];
    const diary = diaries.find(d => d.id === diaryId);

    if (diary) {
      this.setData({
        diaryId,
        isEdit: true,
        date: diary.date,
        selectedMood: diary.mood || '😊',
        content: diary.content,
        images: diary.images || []
      });
    }
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  selectMood(e) {
    this.setData({ selectedMood: e.currentTarget.dataset.mood });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  chooseImage() {
    const remain = 3 - this.data.images.length;
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({
          images: [...this.data.images, ...newImages]
        });
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
  },

  saveDiary() {
    const { petId, diaryId, date, selectedMood, content, images, isEdit } = this.data;

    // 验证
    if (!content || content.trim().length < 10) {
      wx.showToast({ title: '内容至少10个字符', icon: 'none' });
      return;
    }

    if (date > util.getTodayStr()) {
      wx.showToast({ title: '日期不能晚于今天', icon: 'none' });
      return;
    }

    const diary = {
      id: isEdit ? diaryId : Date.now(),
      date,
      mood: selectedMood,
      content: content.trim(),
      images,
      updateTime: Date.now()
    };

    // 保存
    let allDiaries = wx.getStorageSync('diariesData') || {};
    if (!allDiaries[petId]) {
      allDiaries[petId] = [];
    }

    if (isEdit) {
      const index = allDiaries[petId].findIndex(d => d.id === diaryId);
      if (index !== -1) {
        allDiaries[petId][index] = { ...allDiaries[petId][index], ...diary };
      }
    } else {
      diary.createTime = Date.now();
      allDiaries[petId].push(diary);
    }

    wx.setStorageSync('diariesData', allDiaries);
    wx.showToast({ title: '保存成功', icon: 'success' });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  deleteDiary() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇日记吗？',
      success: (res) => {
        if (res.confirm) {
          const { petId, diaryId } = this.data;
          let allDiaries = wx.getStorageSync('diariesData') || {};
          if (allDiaries[petId]) {
            allDiaries[petId] = allDiaries[petId].filter(d => d.id !== diaryId);
            wx.setStorageSync('diariesData', allDiaries);
          }
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  }
});