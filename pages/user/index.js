// pages/user/index.js
var app = getApp()
Page({
  data: {
    retUrl: '/pages/user/index', //返回当前页面地址
    IsTab: 1,//是否Tab页
    ImgUrl: app.globalData.ApiUrl, //图片地址
    RealName: '',
    Headimgurl: '/images/user.png',
    Point:0,//积分
    UserInfo: {}, //用户数据
    showModel: false //显示模态框
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    var that = this;
  },
  onShow: function () {
    // 页面显示
    var that = this;
    that.GetUserInfo();
  },
  GetUserInfo: function () {
    var that = this
    const token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.ApiUrl + '/Home/GetUserInfo',
      data: {
        token: token
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          app.globalData.UserData = res.data.Model;
          if(res.data.Model.Point)
          {
            that.setData({
              Point: res.data.Model.Point
            });
          }
          that.setData({
            UserInfo: res.data.Model
          });
          if (that.data.UserInfo.Headimgurl) {
            that.setData({
              Headimgurl: that.data.UserInfo.Headimgurl
            });
          }
          else {
            that.setData({
              Headimgurl: '/images/user.png'
            });
          }

          if (that.data.UserInfo.RealName) {
            that.setData({
              RealName: that.data.UserInfo.RealName
            });
          }
          else {
            that.setData({
              RealName: '匿名'
            });
          }
        }
        else {
          wx.setStorageSync('retUrl', that.data.retUrl);
          wx.setStorageSync('IsTab', that.data.IsTab);

          wx.redirectTo({
            url: '/pages/login/index'
          })
        }
      },
      fail: function () {
        wx.setStorageSync('retUrl', that.data.retUrl);
        wx.setStorageSync('IsTab', that.data.IsTab);

        wx.redirectTo({
          url: '/pages/login/index'
        })
      }
    })
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //跳转到我的预约列表页
  goBespeakList: function () {
    wx.navigateTo({
      url: "../bespeak/list"
    })
  },

  goSignUpList: function () {
    wx.navigateTo({
      url: "../signup/list"
    })
  },
  //跳转到我的订单列表页
  goOrderList: function () {
    wx.navigateTo({
      url: "../order/list"
    })
  },
  //跳转到我的收藏列表页
  goCollectionList: function () {
    wx.navigateTo({
      url: "../collection/list"
    })
  },
  //跳转到我的浏览列表页
  goVisitList: function () {
    wx.navigateTo({
      url: "../visit/list"
    })
  },
  goSetting: function () {
    wx.openSetting({
      success(res) {
        console.log(res);
      }
    })
  },
  //跳转到用户的收货地址页
  goAddress: function () {
    var that = this;
    // if (wx.getSetting) {
    //   wx.getSetting({
    //     success(res) {
    //       if (!res.authSetting['scope.address']) { //地址是否授权
    //         wx.showToast({
    //           title: '地址未授权,请先去我的授权设置',
    //           icon: 'null',
    //           duration: 2000
    //         });   
    //       }
    //       else{
    if (wx.chooseAddress) {
      wx.chooseAddress({
        success: function (res) {
          wx.request({
            url: app.globalData.ApiUrl + '/Address/Post_SetAddress',
            data: {
              userName: res.userName,
              postalCode: res.postalCode,
              provinceName: res.provinceName,
              cityName: res.cityName,
              countyName: res.countyName,
              detailInfo: res.detailInfo,
              nationalCode: res.nationalCode,
              telNumber: res.telNumber,
              OpenID: app.globalData.UserData.OpenID
            },
            method: 'POST',
            header: {
              "Content-Type": "application/json,application/json"
            },
            success: function (res) {
              if (res.data.code == 1) {
                wx.showToast({
                  title: '收货地址保存成功',
                  icon: 'null',
                  duration: 2000
                });
              }
              else {
                console.log(res)
              }
            },
            fail: function (err) {
              wx.showToast({
                title: '收货地址获取失败',
                icon: 'null',
                duration: 2000
              });
            }
          });
        },
        fail: function (err) {
          console.log(err.errMsg);
          if (err.errMsg =="chooseAddress:fail auth deny") {
            wx.showToast({
              title: '地址未授权,请先去我的授权设置',
              icon: 'null',
              duration: 2000
            });
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })

    }
    //     }
    //   }
    // })
    // }
    // else {
    //   wx.showModal({
    //     title: '提示',
    //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    //   })
    // }
  },
  //跳转到我的留言列表页
  goCommentList: function () {
    wx.navigateTo({
      url: "../comment/list"
    })
  }
})