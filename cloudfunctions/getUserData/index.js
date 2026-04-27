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

  try {
    const result = {
      success: true,
      data: {}
    };

    // 获取宠物数据
    const petsResult = await db.collection('pets').where({
      _openid: openid
    }).get();
    result.data.petsData = cleanData(petsResult.data);

    // 获取日记数据
    const diariesResult = await db.collection('diaries').where({
      _openid: openid
    }).get();
    // 按petId分组
    const diariesData = {};
    diariesResult.data.forEach(item => {
      const petId = item.petId;
      if (!diariesData[petId]) {
        diariesData[petId] = [];
      }
      const cleanItem = { ...item };
      delete cleanItem._openid;
      delete cleanItem._id;
      delete cleanItem.petId;
      diariesData[petId].push(cleanItem);
    });
    result.data.diariesData = diariesData;

    // 获取体重数据
    const weightsResult = await db.collection('weights').where({
      _openid: openid
    }).get();
    const weightsData = {};
    weightsResult.data.forEach(item => {
      const petId = item.petId;
      if (!weightsData[petId]) {
        weightsData[petId] = [];
      }
      const cleanItem = { ...item };
      delete cleanItem._openid;
      delete cleanItem._id;
      delete cleanItem.petId;
      weightsData[petId].push(cleanItem);
    });
    result.data.weightsData = weightsData;

    // 获取提醒数据
    const todosResult = await db.collection('todos').where({
      _openid: openid
    }).get();
    result.data.todoListData = cleanData(todosResult.data);

    // 获取用户资料
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get();
    if (userResult.data.length > 0) {
      const userData = userResult.data[0];
      result.data.userProfile = {
        nickname: userData.nickname,
        avatar: userData.avatar,
        avatarType: userData.avatarType
      };
    }

    return result;
  } catch (err) {
    console.error('获取数据失败:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

// 清理数据
function cleanData(data) {
  return data.map(item => {
    const cleanItem = { ...item };
    delete cleanItem._openid;
    delete cleanItem._id;
    return cleanItem;
  });
}