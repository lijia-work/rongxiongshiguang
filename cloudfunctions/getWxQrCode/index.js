// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 生成正式版小程序码
    // envVersion: 'release' 表示正式线上版本
    const res = await cloud.openapi.wxacode.get({
      path: 'pages/home/index',
      width: 280,
      autoColor: false,
      lineColor: { r: 217, g: 161, b: 59 },
      isHyaline: false,
      envVersion: 'release'
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