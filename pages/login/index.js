const app = getApp()

Page({
  data: {
    scrollHeight: 0,
    retUrl: '/pages/project/list',
    token: '',
    IsTab: 1,
    messageText: '自动登录中',
    jumpPage: true,
    isShowIntro:false, //切换login页图片
    hasRetUrl:false, //是否存在返回链接
    IsTimeOut:1,//是否3秒后跳转
    junmpText:"跳转"
  },
  onLoad: function (options) {
    var that = this
    that.setData({
      scrollHeight: app.globalData.scrollHeight
    });
    var retUrl = wx.getStorageSync('retUrl');
    var IsTab = wx.getStorageSync('IsTab');
    console.log('1:' + retUrl + 'IsTab' + IsTab);
    if (IsTab) {
      that.setData({
        IsTab: IsTab
      })
    }
    if (retUrl) {
      that.setData({
        retUrl: retUrl,
        hasRetUrl:true
      })
    }
    console.log('2:' + that.data.retUrl + 'IsTab' + that.data.IsTab);

    wx.setStorageSync('retUrl', that.data.retUrl);
    wx.setStorageSync('IsTab', that.data.IsTab);

    const token = wx.getStorageSync('token')
    this.setData({
      token: token
    })
    //token && setTimeout(this.goIndex, 1500)

  },
  onShow: function () {
    var that = this
    that.GetUserInfo();
  },
  GetUserInfo: function () {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Home/GetUserInfo',
      data: {
        token: that.data.token
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          app.globalData.UserData = res.data.Model;
          that.setData({
            isShowIntro: true
          })
          that.setTimeRvent();
        }
        else {
          that.login();
        }
      },
      fail: function () {
        that.setData({
          messageText: '用户获取失败，服务器连接失败'
        })
      }
    })
  },

  //登录
  login: function () {
    var that = this
    console.log('login');
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: app.globalData.ApiUrl + '/Home/onLogin',
            data: {
              code: res.code
            },
            method: 'POST',
            success: function (res) {
              if (res.data.code == 1) {
                app.globalData.UserData = res.data.Model;
                var token = res.data.token
                wx.setStorageSync('token', token)
                wx.getUserInfo({
                  withCredentials:true,
                  success: function (res) {
                    app.globalData.userInfo = res.userInfo
                    that.updateInfo(res, token);
                    that.setData({
                      isShowIntro: true
                    });
                    that.setTimeRvent();
                  },
                  fail: function (res) {
                    that.setData({
                      isShowIntro: true
                    })
                    that.setTimeRvent();
                  },
                  complete:function(data)
                  {
                    
                  }
                })
              } else {
                that.setData({
                  messageText: '用户数据获取失败，请重新登录'
                })
              }
            },
            fail: function (res) {
              console.log(res)
              that.setData({
                messageText: '用户登录失败，服务器连接失败'
              })
            }
          })
        }
        else {
          that.setData({
            messageText: '获取用户登录态失败，请重新登录'
          })
        }
      },
      fail: function (res) {
        console.log(res)
        that.setData({
          messageText: '微信用户登录失败，请重新登录'
        })
      }
    })
  },
  //跳转到列表首页
  goIndex: function () {
    var that = this;
    console.log('goIndex,switchTab：/pages/project/list');
    that.setData({
      jumpPage: false
    })
    wx.switchTab({
      url: '/pages/project/list'
    })
  }, 
  //跳转到返回链接
  goUrl: function () {
    var that = this;
    if (that.data.retUrl) {
      that.setData({
        jumpPage: false
      })
      if (that.data.IsTab == 1) {
        console.log('switchTab' + that.data.retUrl);
        wx.switchTab(
          {
            url: that.data.retUrl
          })

      }
      else {
        console.log('redirectTo' + that.data.retUrl);
        wx.redirectTo({
          url: that.data.retUrl
        })
      }
    }
    else {
      that.setData({
        isShowIntro: true
      })
      that.setTimeRvent();
    }
  },
  //跳转按钮判断事件
  jumpEvent: function () {
    var that = this;
    that.setData({
      IsTimeOut: 0
    })
    if (that.data.hasRetUrl) {
      that.goUrl();
    }
    else {
      that.goIndex();
    }
  },
  //定时跳转事件
  setTimeRvent:function(){
    var that = this;
    var i =3

    setTimeout(function () {
      if(that.data.IsTimeOut)
      {
        if (that.data.hasRetUrl) {
          that.goUrl();
        }
        else {
          that.goIndex();
        }
       
      }
      clearTimeout(daoji)
    }, 4000);
    var daoji = setInterval(function () {
     that.setData({
       junmpText:i
     })
     console.log(that.data.junmpText)
     i--
    }, 1000);
  },
  //按钮事件到跳转页面
  btnReturnUrl: function () {
    var that = this;
    that.setData({
      isShowIntro: true
    })
    that.setTimeRvent();
  },
  //修改用户信息
  updateInfo: function (res, token) {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Home/UpdateUser',
      data: {
        // OpenID: app.globalData.UserData.OpenID,
        // nickName: res.userInfo.nickName,
        // avatarUrl: res.userInfo.avatarUrl,
        // country: res.userInfo.country,
        // province: res.userInfo.province,
        // city: res.userInfo.city,
        encryptedData: res.encryptedData,
        iv: res.iv,
        token: token
      },
      method: 'POST',
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  }
 
})