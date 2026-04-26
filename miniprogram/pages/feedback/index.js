// pages/feedback/index.js
Page({
  data: {
    typeOptions: ['功能建议', '问题反馈', '其他'],
    typeIndex: 0,
    content: '',
    contact: '',
    images: []
  },

  onTypeChange(e) {
    this.setData({ typeIndex: parseInt(e.detail.value) });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
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

  submitFeedback() {
    const { typeOptions, typeIndex, content, contact, images } = this.data;

    // 验证
    if (!content || content.trim().length < 10) {
      wx.showToast({ title: '描述至少10个字符', icon: 'none' });
      return;
    }

    // 构建反馈数据
    const feedback = {
      id: Date.now(),
      type: typeOptions[typeIndex],
      content: content.trim(),
      contact: contact.trim(),
      images,
      createTime: Date.now()
    };

    // 保存到本地（实际项目中应提交到服务器）
    let feedbackList = wx.getStorageSync('feedbackList') || [];
    feedbackList.push(feedback);
    wx.setStorageSync('feedbackList', feedbackList);

    wx.showToast({ title: '提交成功', icon: 'success' });

    // 清空表单
    this.setData({
      typeIndex: 0,
      content: '',
      contact: '',
      images: []
    });
  }
});