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
  const { action, dataType, data } = event;

  try {
    if (action === 'upload') {
      // 上传数据到云端
      return await uploadData(openid, dataType, data);
    } else if (action === 'download') {
      // 从云端下载数据
      return await downloadData(openid, dataType);
    } else if (action === 'syncAll') {
      // 同步所有数据
      return await syncAllData(openid, data);
    }
  } catch (err) {
    console.error('同步失败:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

// 上传单个数据类型
async function uploadData(openid, dataType, data) {
  const collectionName = getCollectionName(dataType);

  // 先删除旧数据
  await db.collection(collectionName).where({
    _openid: openid
  }).remove();

  // 批量插入新数据
  if (data && data.length > 0) {
    const dataWithOpenid = data.map(item => ({
      ...item,
      _openid: openid,
      updateTime: db.serverDate()
    }));

    // 分批插入，每批最多100条
    const batchSize = 100;
    for (let i = 0; i < dataWithOpenid.length; i += batchSize) {
      const batch = dataWithOpenid.slice(i, i + batchSize);
      await db.collection(collectionName).add({
        data: batch
      });
    }
  }

  return {
    success: true,
    message: `${dataType}数据已同步`
  };
}

// 下载数据
async function downloadData(openid, dataType) {
  const collectionName = getCollectionName(dataType);

  const result = await db.collection(collectionName).where({
    _openid: openid
  }).get();

  // 移除云数据库特有字段
  const cleanData = result.data.map(item => {
    const cleanItem = { ...item };
    delete cleanItem._openid;
    delete cleanItem._id;
    return cleanItem;
  });

  return {
    success: true,
    data: cleanData
  };
}

// 同步所有数据
async function syncAllData(openid, allData) {
  const results = {};

  // 同步宠物数据
  if (allData.petsData) {
    results.petsData = await uploadData(openid, 'pets', allData.petsData);
  }

  // 同步日记数据
  if (allData.diariesData) {
    // 日记数据是按petId分组的对象
    const diariesArray = [];
    for (const petId in allData.diariesData) {
      allData.diariesData[petId].forEach(diary => {
        diariesArray.push({
          ...diary,
          petId: parseInt(petId)
        });
      });
    }
    results.diariesData = await uploadData(openid, 'diaries', diariesArray);
  }

  // 同步体重数据
  if (allData.weightsData) {
    const weightsArray = [];
    for (const petId in allData.weightsData) {
      allData.weightsData[petId].forEach(weight => {
        weightsArray.push({
          ...weight,
          petId: parseInt(petId)
        });
      });
    }
    results.weightsData = await uploadData(openid, 'weights', weightsArray);
  }

  // 同步提醒数据
  if (allData.todoListData) {
    results.todoListData = await uploadData(openid, 'todos', allData.todoListData);
  }

  // 同步用户资料
  if (allData.userProfile) {
    const userRecord = await db.collection('users').where({
      _openid: openid
    }).get();

    if (userRecord.data.length > 0) {
      await db.collection('users').doc(userRecord.data[0]._id).update({
        data: {
          nickname: allData.userProfile.nickname,
          avatar: allData.userProfile.avatar,
          avatarType: allData.userProfile.avatarType,
          updateTime: db.serverDate()
        }
      });
    }
    results.userProfile = { success: true };
  }

  return {
    success: true,
    results: results
  };
}

// 获取集合名称
function getCollectionName(dataType) {
  const map = {
    'pets': 'pets',
    'diaries': 'diaries',
    'weights': 'weights',
    'todos': 'todos'
  };
  return map[dataType] || dataType;
}