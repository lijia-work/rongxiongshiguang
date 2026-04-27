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
    // 注意：page必须是在app.json中注册的页面，且已上传体验版
    // 如果小程序未上传体验版，会报41030错误
    const res = await cloud.openapi.wxacode.getUnlimited({
      scene: scene || 'invite',
      page: 'pages/home/index', // 首页路径
      width: width,
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

    // 如果生成失败，返回错误信息
    // 常见错误41030：页面不存在或未上传体验版
    return {
      success: false,
      error: {
        errCode: err.errCode,
        errMsg: err.errMsg
      },
      tip: '请确保已上传小程序体验版'
    };
  }
};