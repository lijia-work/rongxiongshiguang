// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 使用 wxacode.get 方法生成小程序码（更稳定）
    // path 必须是完整路径，且在 app.json 中注册
    const res = await cloud.openapi.wxacode.get({
      path: 'pages/home/index', // 完整页面路径
      width: 280,
      autoColor: false,
      lineColor: { r: 217, g: 161, b: 59 },
      isHyaline: false,
      envVersion: 'trial'
    });

    // 上传到云存储
    const uploadRes = await cloud.uploadFile({
      cloudPath: `qrcodes/app_qrcode_${Date.now()}.png`,
      fileContent: res.buffer
    });

    return {
      success: true,
      fileID: uploadRes.fileID
    };
  } catch (err) {
    console.error('生成小程序码失败:', err);
    return {
      success: false,
      error: {
        errCode: err.errCode,
        errMsg: err.errMsg
      }
    };
  }
};