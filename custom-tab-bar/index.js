// custom-tab-bar/index.js
Component({
  data: {
    selected: 0
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setData({
        selected: data.index
      });
    },

    // 中间加号按钮点击
    onAddTap() {
      // 触发全局事件，让当前页面处理
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && typeof currentPage.onTabAddTap === 'function') {
        currentPage.onTabAddTap();
      }
    }
  }
});
