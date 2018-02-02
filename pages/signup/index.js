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
    PreArticle: {
      ID: 0,
      BookingPayMoney: 0
    },
    index:0,
    ArticleSiteList:[],//场次集合
    SiteList:["请选择场次日期"],//场次日期集合
    ArticleSiteID:0,//活动场次编号
    retUrl: '/pages/signup/index', //返回当前页面地址
    IsTab: 2,//是否Tab页
    ArticleTitle: '',
    PayMoney: 0,
    PeopleCount: 0,//人数
    LinkPhone: '',//联系手机
    ConsigneeName: '',//联系人
    ButtonControll: true, //禁止重复提交
    SignUpBeginTime: '',//出发日期
    SignUpMoney: 0,//价格
    hasOrderBefore: 0 //是否有预约订单
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    //防止模板消息进入获取不到用户OpenID
    if (app.globalData.UserData.OpenID == '') {
      var retUrl = that.data.retUrl;
      if (options.ID) {
        retUrl += "?ID=" + options.ID;
      }
      wx.setStorageSync('retUrl', retUrl);
      wx.setStorageSync('IsTab', that.data.IsTab);

      wx.redirectTo({
        url: '/pages/login/index'
      });
      return;
    }
    that.setData({
      ArticleID: options.ID
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
           // SignUpMoney: res.data.model.SignUpMoney,
           // SignUpBeginTime: res.data.model.SignUpBeginTime,
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
        that.getArticleSiteList()
       // that.GetPreOrderByBooking()
      },
      fail: function () {
        that.setData({
          showLoading: false
        })
      }
    })
  },
  //获取活动场次
  getArticleSiteList: function () {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/ArticleSite/GetMiniList',
      data: {
        ArticleID: that.data.ArticleID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 1) {   
          var newlist = JSON.parse(res.data.list);
          var list = ["请选择场次日期"];
         
          for (var i = 0; i < newlist.length;i++)   
          {            
            newlist[i].SignUpEndTime = utils.formatStringToDate(newlist[i].SignUpEndTime);
            list.push(newlist[i].SignUpEndTime);
          }
          that.setData({         
            SiteList: list,
            ArticleSiteList: newlist
          });
        }
        else {
          that.setData({
            SiteList:[],
            ArticleSiteList: []
          });
        }      
      }
    })
  },
  //获取该报名的预约订单
  GetPreOrderByBooking: function () {
    var that = this;
    wx.request({
      url: app.globalData.ApiUrl + '/Order/GetPreOrderByBooking',
      data: {
        OpenID: app.globalData.UserData.OpenID,
        ArticleID: that.data.ArticleID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 1) {
          var money = utils.accSub(res.data.model.PeopleNum * that.data.Article.SignUpMoney, res.data.model.BookingPayMoney);
          that.setData({
            ConsigneeName: res.data.model.ConsigneeName,
            LinkPhone: res.data.model.LinkPhone,
            PeopleCount: res.data.model.PeopleNum,
            PreArticle: res.data.model,
            PayMoney: money,
            hasOrderBefore: 1
          })
        }
      }
    })
  },
  //选择场次
  bindChange:function(e)
  {
    var that = this;
    var selectIndex = parseInt(e.detail.value);
    if (selectIndex==0)
    {
      that.setData({
        index: 0,
        SignUpMoney: 0,
        PayMoney: 0,
        ArticleSiteID: 0
      })
      return;
    }
    
    var money = utils.accSub(that.data.PeopleCount * that.data.ArticleSiteList[selectIndex-1].SignUpMoney, that.data.PreArticle.BookingPayMoney);
    if (money <= 0) {
      money = 0;
    }
    that.setData({
      index: selectIndex,
      SignUpMoney: that.data.ArticleSiteList[selectIndex-1].SignUpMoney,
      PayMoney: money,
      ArticleSiteID: that.data.ArticleSiteList[selectIndex-1].ID
    })
    
  },
  //添加
  add: function (e) {
    var that = this;
    that.data.PeopleCount++;
    var money = utils.accSub(that.data.PeopleCount * that.data.SignUpMoney, that.data.PreArticle.BookingPayMoney);
    if (money <= 0) {
      money = 0;
    }
    that.setData({
      PeopleCount: that.data.PeopleCount,
      PayMoney: money
    })
  },
  //减少
  del: function (e) {
    var that = this;
    that.data.PeopleCount--;
    var money = utils.accSub(that.data.PeopleCount * that.data.SignUpMoney, that.data.PreArticle.BookingPayMoney);
    if (money <= 0) {
      money = 0;
    }
    that.setData({
      PeopleCount: that.data.PeopleCount,
      PayMoney: money
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
    if (that.data.ArticleSiteID <= 0) {
      wx.showToast({
        title: '请选择活动场次！',
        icon: 'null',
        duration: 2000
      });
      return;
    }

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
    if (that.data.PayMoney <= 0) {
      wx.showToast({
        title: '价格不能小于零！',
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
      url: app.globalData.ApiUrl + '/Order/SignUp',
      data: {
        ArticleID: that.data.ArticleID,
        SiteID: that.data.ArticleSiteID,
        PayMoney: that.data.PayMoney,
        OpenID: app.globalData.UserData.OpenID,
        LinkPhone: that.data.LinkPhone,
        ConsigneeName: that.data.ConsigneeName,
        ArticleTitle: that.data.ArticleTitle,
        BookingID: that.data.PreArticle.ID,
        FormID: e.detail.formId,
        PeopleCount: that.data.PeopleCount
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
                wx.redirectTo({
                  url: '../signup/list',
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
          title: '报名失败',
          icon: 'null',
          duration: 2000
        });
      }
    })
  },
  //发送消息
  sendMessage: function (e) {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Order/SendSignUpMessage',
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
        // else {
        //   wx.showToast({
        //     title: res.data.message,
        //     icon: 'null',
        //     duration: 2000
        //   });
        // }
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