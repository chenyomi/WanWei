// pages/order/orderDetail.js
var app = getApp()
var utils = require('../../utils/util.js');
Page({
  data: {
    OrderID: 0,   //订单ID
    OrderDetailData: {}, //订单明细数据
    OrderList: [],
    ImgUrl: app.globalData.ApiUrl, //图片地址
    retUrl: '/pages/order/detail', //返回当前页面地址
    IsTab: 2,//是否Tab页
    hasMore: true, //是否有数据
    IsLoadMore: false,          
    isConment: true,//是否可以评价
    scrollTop: 0, // 滚动位置
    scrollHeight: 0, //屏幕高度
    ButtonControll:true //禁止重复提交
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    that.setData({
      OrderID: options.ID
    })
    if (app.globalData.UserData.OpenID=='')
    {
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
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight - 40
        })
      }
    })
   
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var that =this;
    // 页面显示
    that.GetOrderDetail();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //获取订单明细信息
  GetOrderDetail: function () {
    var that = this
    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Order/GetMiniModel',
      data: {
        ID: that.data.OrderID,
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          var thatlist = [];
          console.log(res.data)
          var orderlist = JSON.parse(res.data.list)        
          res.data.model.PayDate = utils.formatNumToDate(res.data.model.PayDate);
          res.data.model.CommentDate = utils.formatNumToDate(res.data.model.CommentDate);
          that.setData({
            OrderDetailData: res.data.model,
            OrderList: orderlist,
            IsLoadMore:true
          });
          console.log(orderlist)
        }
        else {
          that.setData({
            hasMore: false
          });
        }
        wx.hideNavigationBarLoading()
      },
      fail: function () {
        that.setData({
          hasMore: false
        })
        wx.hideNavigationBarLoading()
      }
    })
  },
  //跳转到食材明细页
  GoGoods: function (e) {
    var data = e.currentTarget.dataset;
    // wx.redirectTo({
    //   url: '../project/detail?ID=' + data.id
    // })
    wx.redirectTo({
      url: '../goods/detail?GoodsID=' + data.id
    })
  },
  //跳转到评价页面
  // goConment: function (e) {
  //   var that = this;
  //   wx.navigateTo({
  //     url: '../comment/comment?ShopGoodsID=0&OrderID=' + that.data.OrderID+'&ArticleID=0'
  //   })
  // },
  //调用支付
  GetJsApiParameters: function () {
    var subGoods = [];
    var that = this;
    var PayMoney = 0;
    
    for (var i = 0; i < that.data.OrderList.length; i++) {
      if (that.data.OrderList[i].GoodsNumber > 0) {
        subGoods.push({
          GoodsID: that.data.OrderList[i].GoodsID,
          GoodsNumber: that.data.OrderList[i].GoodsNumber,
          GoodsName: that.data.OrderList[i].GoodsName,
          Price: that.data.OrderList[i].Price
        });
        PayMoney += that.data.OrderList[i].Price * that.data.OrderList[i].GoodsNumber;
      }
    }
    if (PayMoney <= 0) {
      wx.showToast({
        title: '价格小于零，不能支付！',
        icon: 'null',
        duration: 2000
      });
      return;
    }
    that.setData({
      ButtonControll : false
    })
    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Order/GetJsApiParameters',
      data: {
        detail: JSON.stringify(subGoods),
        OrderID: that.data.OrderID,
        PayMoney: PayMoney,
        OpenID: app.globalData.UserData.OpenID
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
                that.GetOrderDetail();
              },
              'fail': function (res) {
              }
            })
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
          title: '微信支付调用失败',
          icon: 'null',
          duration: 2000
        });
      }
    })
  },
  //返回订单页面
  backpage: function () {

    wx.redirectTo({
      url: "../order/list"
    })
  }
})