// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const openid = wxContext.OPENID;
  const appid = wxContext.APPID;

  try {
    // 查询用户是否已存在
    const userRecord = await db.collection('users').where({
      _openid: openid
    }).get();

    let userData = null;

    if (userRecord.data.length === 0) {
      // 新用户，创建记录
      const newUser = {
        _openid: openid,
        nickname: '小熊饲养员',
        avatarType: 'emoji',
        avatar: '🐻‍❄️',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      };

      const result = await db.collection('users').add({
        data: newUser
      });

      userData = {
        _id: result._id,
        ...newUser
      };
    } else {
      // 老用户，更新登录时间
      userData = userRecord.data[0];
      await db.collection('users').doc(userData._id).update({
        data: {
          updateTime: db.serverDate()
        }
      });
    }

    return {
      success: true,
      openid: openid,
      userData: {
        _id: userData._id,
        nickname: userData.nickname,
        avatar: userData.avatar,
        avatarType: userData.avatarType
      }
    };
  } catch (err) {
    console.error('登录失败:', err);
    return {
      success: false,
      error: err.message
    };
  }
};