// utils/util.js - 工具函数

/**
 * 计算陪伴天数
 */
function calcCompanionDays(homeDateStr, deathDateStr) {
  if (!homeDateStr) return 0;
  const start = new Date(homeDateStr);
  const end = deathDateStr && deathDateStr.trim() ? new Date(deathDateStr) : new Date();
  if (isNaN(start)) return 0;
  const diffTime = end - start;
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * 获取今天日期字符串
 */
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 计算距离下次的天数
 */
function getDaysUntilNext(lastDateStr, cycleType) {
  const last = new Date(lastDateStr);
  if (isNaN(last.getTime())) return 0;
  let next = new Date(last);
  if (cycleType === 'daily') next.setDate(last.getDate() + 1);
  else if (cycleType === 'weekly') next.setDate(last.getDate() + 7);
  else next.setDate(last.getDate() + 30);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
}

/**
 * 显示Toast提示
 */
function showToast(title, icon = 'none', duration = 2000) {
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration
  });
}

/**
 * 显示加载中
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title: title,
    mask: true
  });
}

/**
 * 隐藏加载
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示确认弹窗
 */
function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success(res) {
        resolve(res.confirm);
      }
    });
  });
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取周期显示文本
 */
function getCycleText(cycleType) {
  const map = {
    'daily': '每天重复',
    'weekly': '每周重复',
    'monthly': '每月重复'
  };
  return map[cycleType] || cycleType;
}

module.exports = {
  calcCompanionDays,
  getTodayStr,
  getDaysUntilNext,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  formatDate,
  getCycleText
};