// pages/home/index.js
const util = require('../../utils/util.js');

Page({
  data: {
    pets: [],
    filteredPets: [],
    searchKeyword: '',
    reminderText: '暂无待办提醒',
    reminderBadge: '0',
    showActionMenu: false,
    showSearchBar: false,
    statusBarHeight: 0,
    navBarTop: 0
  },

  onLoad() {
    this.initNavBar();
    this.loadPets();
    this.loadTodoPreview();
  },

  // 初始化导航栏高度
  initNavBar() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = systemInfo.statusBarHeight || 20;
    const navBarTop = menuButton.bottom + (menuButton.top - statusBarHeight);
    this.setData({
      statusBarHeight,
      navBarTop
    });
  },

  onShow() {
    this.loadPets();
    this.loadTodoPreview();
    // 设置自定义TabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  // 响应TabBar中间加号按钮点击
  onTabAddTap() {
    this.showActionMenu();
  },

  // 加载宠物列表
  loadPets() {
    const pets = wx.getStorageSync('petsData') || [];
    const petsWithDays = pets.map(pet => ({
      ...pet,
      days: util.calcCompanionDays(pet.homeDate, pet.deathDate)
    }));
    this.setData({
      pets: petsWithDays,
      filteredPets: this.filterPets(petsWithDays, this.data.searchKeyword)
    });
  },

  // 过滤宠物
  filterPets(pets, keyword) {
    if (!keyword) return pets;
    return pets.filter(pet => pet.name.includes(keyword));
  },

  // 加载提醒预览
  loadTodoPreview() {
    const todoList = wx.getStorageSync('todoListData') || [];
    if (todoList.length === 0) {
      this.setData({
        reminderText: '暂无待办提醒，点击＋新建',
        reminderBadge: '0'
      });
      return;
    }

    let overdue = 0;
    let nearest = null;
    let nearestDays = Infinity;

    todoList.forEach(todo => {
      const days = util.getDaysUntilNext(todo.lastCompleteDate, todo.cycleType);
      if (days <= 0) {
        overdue++;
      } else if (days < nearestDays) {
        nearestDays = days;
        nearest = todo;
      }
    });

    if (overdue > 0) {
      this.setData({
        reminderText: `⚠️ 有 ${overdue} 个提醒已逾期`,
        reminderBadge: overdue.toString()
      });
    } else if (nearest) {
      this.setData({
        reminderText: `${nearest.name} · 距下次还有${nearestDays}天`,
        reminderBadge: '待办'
      });
    } else {
      this.setData({
        reminderText: '所有任务已完成 🎉',
        reminderBadge: '0'
      });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({
      searchKeyword: keyword,
      filteredPets: this.filterPets(this.data.pets, keyword)
    });
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      filteredPets: this.data.pets
    });
  },

  // 搜索框失去焦点时收起
  onSearchBlur() {
    // 如果没有搜索内容，则收起搜索框
    if (!this.data.searchKeyword) {
      this.setData({
        showSearchBar: false
      });
    }
  },

  // 切换搜索框显示
  toggleSearch() {
    this.setData({
      showSearchBar: !this.data.showSearchBar
    });
    // 如果收起且没有内容，清空搜索
    if (!this.data.showSearchBar && !this.data.searchKeyword) {
      this.setData({
        filteredPets: this.data.pets
      });
    }
  },

  // 跳转宠物详情
  goToPetDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/petDetail/index?id=${id}`
    });
  },

  // 跳转创建宠物
  goToCreatePet() {
    this.hideActionMenu();
    wx.navigateTo({
      url: '/pages/createPet/index'
    });
  },

  // 跳转日记创建
  goToDiaryCreate() {
    this.hideActionMenu();
    wx.navigateTo({
      url: '/pages/diaryCreate/index'
    });
  },

  // 跳转待办
  goToTodo() {
    this.hideActionMenu();
    wx.navigateTo({
      url: '/pages/todo/index'
    });
  },

  // 显示操作菜单
  showActionMenu() {
    this.setData({ showActionMenu: true });
  },

  // 隐藏操作菜单
  hideActionMenu() {
    this.setData({ showActionMenu: false });
  },

  // 阻止冒泡
  stopPropagation() {}
});