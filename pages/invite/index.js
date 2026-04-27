// pages/invite/index.js
const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    qrcodeUrl: '',
    qrcodeLoading: true
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });

    this.getWxQrCode();
  },

  goBack() {
    wx.navigateBack();
  },

  // 获取小程序码
  async getWxQrCode() {
    try {
      // 先尝试从缓存获取
      const cachedQrCode = wx.getStorageSync('appQrCodeUrl');
      const cacheTime = wx.getStorageSync('appQrCodeTime');
      const now = Date.now();

      // 缓存有效期7天
      if (cachedQrCode && cacheTime && (now - cacheTime < 7 * 24 * 60 * 60 * 1000)) {
        this.setData({ qrcodeUrl: cachedQrCode, qrcodeLoading: false });
        return;
      }

      // 通过云函数获取小程序码
      const res = await wx.cloud.callFunction({
        name: 'getWxQrCode',
        data: {
          scene: 'invite',
          page: 'pages/home/index',
          width: 280
        }
      });

      console.log('云函数返回:', res);

      if (res.result && res.result.success && res.result.fileID) {
        // 获取临时URL
        const fileRes = await wx.cloud.getTempFileURL({
          fileList: [res.result.fileID]
        });

        console.log('临时URL返回:', fileRes);

        if (fileRes.fileList && fileRes.fileList[0] && fileRes.fileList[0].tempFileURL) {
          const qrcodeUrl = fileRes.fileList[0].tempFileURL;
          this.setData({ qrcodeUrl, qrcodeLoading: false });
          // 缓存小程序码URL
          wx.setStorageSync('appQrCodeUrl', qrcodeUrl);
          wx.setStorageSync('appQrCodeTime', now);
        }
      } else {
        throw new Error('云函数返回结果异常');
      }
    } catch (err) {
      console.error('获取小程序码失败:', err);
      this.setData({ qrcodeLoading: false });
      // 显示提示，让用户知道可以使用分享功能
      wx.showToast({
        title: '小程序码加载失败，可使用分享功能',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 重新加载小程序码
  reloadQrCode() {
    this.setData({ qrcodeLoading: true, qrcodeUrl: '' });
    wx.removeStorageSync('appQrCodeUrl');
    wx.removeStorageSync('appQrCodeTime');
    this.getWxQrCode();
  },

  // 保存分享海报
  async savePoster() {
    if (!this.data.qrcodeUrl) {
      wx.showToast({ title: '小程序码加载中，请稍后', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '生成海报中...', mask: true });

    try {
      // 下载小程序码到本地
      const downloadRes = await new Promise((resolve, reject) => {
        wx.downloadFile({
          url: this.data.qrcodeUrl,
          success: resolve,
          fail: reject
        });
      });

      const qrcodePath = downloadRes.tempFilePath;

      // 创建Canvas绘制海报
      const query = wx.createSelectorQuery();
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res[0] || !res[0].node) {
            wx.hideLoading();
            wx.showToast({ title: '生成失败，请重试', icon: 'none' });
            return;
          }

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio;

          canvas.width = 300 * dpr;
          canvas.height = 400 * dpr;
          ctx.scale(dpr, dpr);

          // 绘制背景
          const gradient = ctx.createLinearGradient(0, 0, 300, 400);
          gradient.addColorStop(0, '#FEF3E4');
          gradient.addColorStop(1, '#F7E5D3');
          ctx.fillStyle = gradient;
          ctx.roundRect(0, 0, 300, 400, 24);
          ctx.fill();

          // 绘制标题区域背景
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.roundRect(20, 20, 260, 80, 16);
          ctx.fill();

          // 绘制Logo
          ctx.font = '36px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🐹', 60, 70);

          // 绘制App名称
          ctx.font = 'bold 20px Arial';
          ctx.fillStyle = '#3E2C1F';
          ctx.textAlign = 'left';
          ctx.fillText('绒熊时光', 100, 55);

          // 绘制Slogan
          ctx.font = '12px Arial';
          ctx.fillStyle = '#B45F2B';
          ctx.fillText('记录与小熊的温暖时光', 100, 78);

          // 绘制小程序码
          const qrImg = canvas.createImage();
          await new Promise((resolve, reject) => {
            qrImg.onload = resolve;
            qrImg.onerror = reject;
            qrImg.src = qrcodePath;
          });

          ctx.drawImage(qrImg, 90, 130, 120, 120);

          // 绘制提示文字
          ctx.font = '12px Arial';
          ctx.fillStyle = '#B3A28E';
          ctx.textAlign = 'center';
          ctx.fillText('长按识别小程序码', 150, 275);

          // 绘制底部文字
          ctx.font = '14px Arial';
          ctx.fillStyle = '#3E2C1F';
          ctx.fillText('快来一起养熊吧！', 150, 320);

          ctx.font = '11px Arial';
          ctx.fillStyle = '#B3A28E';
          ctx.fillText('记录陪伴的每一天', 150, 345);

          // 生成图片
          wx.canvasToTempFilePath({
            canvas: canvas,
            success: (saveRes) => {
              // 保存到相册
              wx.saveImageToPhotosAlbum({
                filePath: saveRes.tempFilePath,
                success: () => {
                  wx.hideLoading();
                  wx.showModal({
                    title: '保存成功',
                    content: '分享海报已保存到相册，可发朋友圈分享给好友',
                    showCancel: false,
                    confirmText: '好的'
                  });
                },
                fail: (err) => {
                  wx.hideLoading();
                  if (err.errMsg.includes('auth deny')) {
                    wx.showModal({
                      title: '提示',
                      content: '需要您授权保存图片到相册',
                      confirmText: '去授权',
                      success: (modalRes) => {
                        if (modalRes.confirm) {
                          wx.openSetting();
                        }
                      }
                    });
                  } else {
                    wx.showToast({ title: '保存失败，请重试', icon: 'none' });
                  }
                }
              });
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '生成失败，请重试', icon: 'none' });
            }
          });
        });
    } catch (err) {
      console.error('保存海报失败:', err);
      wx.hideLoading();
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  },

  onShareAppMessage() {
    return {
      title: '快来一起养熊吧！',
      path: '/pages/home/index',
      imageUrl: ''
    };
  }
});