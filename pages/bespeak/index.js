var utils = require('../../utils/util.js');
var app = getApp()
Page({
  data: {
    showLoading: true,//数据加载中   
    IsEnable: true,
    IsDelete: false,
    IsClosed: false,
    ArticleID: 0,
    Article: {},
    retUrl: '/pages/bespeak/index', //返回当前页面地址
    IsTab: 2,//是否Tab页
    ArticleTitle: '',
    PeopleCount: 1,//人数
    LinkPhone: '',//联系手机
    ConsigneeName: '',//联系人
    ButtonControll: true, //禁止重复提交
    SignUpBeginTime: '',//出发日期
    SignUpMoney: '',//价格
    showModel: false,
    payOrderID: 0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (app.globalData.UserData.OpenID == '') {
      var retUrl = that.data.retUrl;
      if (options.ArticleID) {
        retUrl += "?ArticleID=" + options.ArticleID;
      }
      wx.setStorageSync('retUrl', retUrl);
      wx.setStorageSync('IsTab', that.data.IsTab);

      wx.redirectTo({
        url: '/pages/login/index'
      });
      return;
    }

    that.setData({
      ArticleID: options.ArticleID
    })
    that.getArticle();

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //获取信息
  getArticle: function () {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Article/GetMiniModelByID',
      data: {
        ID: that.data.ArticleID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 1) {
          res.data.model.SignUpBeginTime = utils.formatNumToDateTime(res.data.model.SignUpBeginTime);
          that.setData({
            showLoading: true,
            SignUpMoney: res.data.model.SignUpMoney,
            SignUpBeginTime: res.data.model.SignUpBeginTime,
            IsEnable: res.data.model.IsEnable,
            IsDelete: res.data.model.IsDelete,
            IsClosed: res.data.model.IsClosed,
            ArticleTitle: res.data.model.Title,
            Article: res.data.model
          });
        }
        else {
          that.setData({
            showLoading: false
          });
        }
        that.GetPreOrderBySignUp()
      },
      fail: function () {
        that.setData({
          showLoading: false
        })
      }
    })
  },
  //获取上次的预约订单
  GetPreOrderBySignUp: function () {
    var that = this;
    wx.request({
      url: app.globalData.ApiUrl + '/Order/GetPreBookingOrder',
      data: {
        OpenID: app.globalData.UserData.OpenID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 1) {
          that.setData({
            ConsigneeName: res.data.model.ConsigneeName,
            LinkPhone: res.data.model.LinkPhone
          })
        }
      }
    })
  },
  //添加
  add: function (e) {
    var that = this;
    that.data.PeopleCount++;
    that.setData({
      PeopleCount: that.data.PeopleCount,
    })
  },
  //减少
  del: function (e) {
    var that = this;
    that.data.PeopleCount--;
    that.setData({
      PeopleCount: that.data.PeopleCount,
    })
  },
  //设置联系手机
  bindinputByLinkPhone: function (e) {
    var that = this;
    that.setData({
      LinkPhone: e.detail.value
    })
  },
  //设置联系人
  bindinputByConsigneeName: function (e) {
    var that = this;
    that.setData({
      ConsigneeName: e.detail.value
    })
  },
  //提交
  bindFormSubmit: function (e) {
    var that = this;
    console.log(e.detail.formId)
    if (e.detail.value.ConsigneeName == "") {
      wx.showToast({
        title: '联系人不能为空！',
        icon: 'null',
        duration: 2000
      })
      return;
    }
    if (e.detail.value.LinkPhone == "") {
      wx.showToast({
        title: '手机号不能为空！',
        icon: 'null',
        duration: 2000
      });
      return;
    }
    else {
      if (!utils.IsPhone(e.detail.value.LinkPhone)) {//判断手机是否合法
        wx.showToast({
          title: '手机号不正确！',
          icon: 'null',
          duration: 2000
        });
        return;
      }
    }
    if (that.data.PeopleCount <= 0) {
      wx.showToast({
        title: '人数不能为零！',
        icon: 'null',
        duration: 2000
      });
      return;
    }
    that.setData({
      ButtonControll: false
    })
    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Order/Booking',
      data: {
        ArticleID: that.data.ArticleID,
        PayMoney: that.data.Article.BookingMoney,
        OpenID: app.globalData.UserData.OpenID,
        LinkPhone: that.data.LinkPhone,
        ConsigneeName: that.data.ConsigneeName,
        ArticleTitle: that.data.ArticleTitle,
        PeopleCount: that.data.PeopleCount,
        FormID: e.detail.formId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        that.setData({
          ButtonControll: true
        })
        if (res.data.code == 1) {
          if (res.data.wxPayJsApiParam) {
            var wxPayJsApiParam = JSON.parse(res.data.wxPayJsApiParam);
            wx.requestPayment({
              'timeStamp': wxPayJsApiParam.timeStamp,
              'nonceStr': wxPayJsApiParam.nonceStr,
              'package': wxPayJsApiParam.package,
              'signType': wxPayJsApiParam.signType,
              'paySign': wxPayJsApiParam.paySign,
              'success': function () {
                that.sendMessage({ prepay_id: e.detail.formId, OrderID: res.data.OrderID })
                that.setData({
                  payOrderID: res.data.OrderID,
                  showModel: true
                })
              }
            })
          }
          else {
            wx.showToast({
              title: '微信支付调用失败',
              icon: 'null',
              duration: 2000
            });
          }

        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'null',
            duration: 2000
          });
        }
        wx.hideNavigationBarLoading()
      },
      fail: function () {
        that.setData({
          ButtonControll: true
        })
        wx.hideNavigationBarLoading()
        wx.showToast({
          title: '预约失败',
          icon: 'null',
          duration: 2000
        });
      }
    })
  },
  //关闭model
  closeModel: function (e) {
    var that = this;
    console.log(e.detail.formId)
    that.setData({
      showModel: false
    })
    that.SetOrderFormID(e.detail.formId)
    wx.redirectTo({
      url: '../bespeak/list',
    })
  },
  //设置订单FormID
  SetOrderFormID: function (formId) {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Order/SetOrderFormID',
      data: {
        FormID: formId,
        OrderID: that.data.payOrderID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 1) {
          console.log('设置成功')
        }
        else {
          wx.showToast({
            title: res.data.message,
            icon: 'null',
            duration: 2000
          });
        }
      },
      fail: function () {
        wx.showToast({
          title: 'formID设置失败',
          icon: 'null',
          duration: 2000
        });
      }
    });
  },
  //发送消息
  sendMessage: function (e) {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Order/SendBookingMessage',
      data: {
        prepay_id: e.prepay_id,
        OpenID: app.globalData.UserData.OpenID,
        OrderID: e.OrderID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 1) {
        }
        else {
          wx.showToast({
            title: res.data.message,
            icon: 'null',
            duration: 2000
          });
        }
      },
      fail: function () {
        wx.showToast({
          title: '消息发送失败！',
          icon: 'null',
          duration: 2000
        });
      }
    });
  },
  //返回
  backpage: function () {
    wx.navigateBack({
      delta: 1
    })
  }

})