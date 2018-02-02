App({
  globalData: {
   // ApiUrl: 'https://mini.jingongbao.com/wanwei',
    //  ApiUrl: 'http://localhost:2021',
    ApiUrl: 'https://mini.jingongbao.com/wanweitest',    
    openID: "123456",
    userInfo: null,    
    UserData: {
      OpenID: '',
      RealName: '',
      Headimgurl: '',
      IsSubscribe: false,
      ShareCount: 0,
      IsVip: false,
      IsOnVip: false,
      Subscribe: '',
      Email: '',
      ColCount: 0,
      VisitCount: 0,
      ComCount: 0
    },
    scrollHeight: 0,
    windowWidth: 0
  },
  onLaunch: function () {
    var that = this;
    //清空页面跳转缓存
    wx.setStorageSync('retUrl', '');
    wx.setStorageSync('IsTab', '');

    //初始化缓存
    wx.setStorageSync('ShareOpenID', '');
   // this.initSetting();
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.scrollHeight = res.windowHeight;
        that.globalData.windowWidth = res.windowWidth;
        console.log(res.windowHeight)
      }
    })
  },
  onShow: function () {
    var that = this;
  },
  onHide: function () {
    var that = this;
  },
  //查询用户是否授权,预先授权
  initSetting: function () {
    if (wx.getSetting) {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userInfo']) { //用户是否授权
            wx.authorize({
              scope: 'scope.userInfo',
              success() {
                wx.getUserInfo()
              },
              complete() {
                // if (!res.authSetting['scope.address']) { //地址授权
                //   wx.authorize({
                //     scope: 'scope.address',
                //     success() {
                //       wx.chooseAddress()
                //     }
                //   })
                // }
              }
            })
          }
          else {
            // if (!res.authSetting['scope.address']) { //地址授权
            //   wx.authorize({
            //     scope: 'scope.address',
            //     success() {
            //       wx.chooseAddress()
            //     }
            //   })
            // }
          }
        }
      })
    }
  }
})