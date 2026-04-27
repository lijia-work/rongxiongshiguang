// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  const { scene, page, width = 280 } = event;

  try {
    // 生成小程序码
    const res = await cloud.openapi.wxacode.getUnlimited({
      scene: scene || 'invite',
      page: page || 'pages/home/index',
      width: width,
      autoColor: false,
      lineColor: { r: 217, g: 161, b: 59 }, // 使用主题色 #D9A13B
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
      error: err
    };
  }
};