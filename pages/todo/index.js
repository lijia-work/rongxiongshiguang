// pages/todo/index.js
const util = require('../../utils/util.js');

Page({
  data: {
    todoContent: '',
    cycleIndex: 0,
    cycleOptions: [
      { value: 'daily', label: '每天', icon: '📅' },
      { value: 'weekly', label: '每周', icon: '📆' },
      { value: 'monthly', label: '每月', icon: '🗓️' },
      { value: 'custom', label: '自定义', icon: '⚙️' }
    ],
    startDate: '',
    todoList: [],
    statusBarHeight: 20
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20,
      startDate: util.getTodayStr()
    });
    this.loadTodoList();
  },

  goBack() {
    wx.navigateBack();
  },

  loadTodoList() {
    const todoList = wx.getStorageSync('todoListData') || [];
    // 计算下次提醒日期
    const processedList = todoList.map(item => {
      const nextDate = util.getDaysUntilNext(item.startDate, item.cycle);
      return {
        ...item,
        cycleLabel: this.getCycleLabel(item.cycle),
        nextDate: nextDate > 0 ? `${nextDate}天后` : '今天'
      };
    });
    this.setData({ todoList: processedList });
  },

  getCycleLabel(cycle) {
    const option = this.data.cycleOptions.find(o => o.value === cycle);
    return option ? option.label : '自定义';
  },

  onContentInput(e) {
    this.setData({ todoContent: e.detail.value });
  },

  onCycleChange(e) {
    this.setData({ cycleIndex: parseInt(e.detail.value) });
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
  },

  addTodo() {
    const { todoContent, cycleOptions, cycleIndex, startDate } = this.data;

    if (!todoContent || todoContent.trim().length < 2) {
      wx.showToast({ title: '请输入提醒内容', icon: 'none' });
      return;
    }

    if (!startDate) {
      wx.showToast({ title: '请选择开始日期', icon: 'none' });
      return;
    }

    const todo = {
      id: Date.now(),
      content: todoContent.trim(),
      cycle: cycleOptions[cycleIndex].value,
      icon: cycleOptions[cycleIndex].icon,
      startDate,
      createTime: Date.now()
    };

    let todoList = wx.getStorageSync('todoListData') || [];
    todoList.push(todo);
    wx.setStorageSync('todoListData', todoList);

    // 清空表单
    this.setData({
      todoContent: '',
      cycleIndex: 0,
      startDate: util.getTodayStr()
    });

    this.loadTodoList();
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  deleteTodo(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个提醒吗？',
      success: (res) => {
        if (res.confirm) {
          let todoList = wx.getStorageSync('todoListData') || [];
          todoList = todoList.filter(item => item.id !== id);
          wx.setStorageSync('todoListData', todoList);
          this.loadTodoList();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});