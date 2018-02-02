var utils = require('../../utils/util.js');
var app = getApp()
Page({
  data: {
    OrderType: 1, //1：文章；2:食材
    ArticleID: 0, //文章ID或者食材ID
    GoodsList: [], //食材列表      
    GoodsNum: 0,    //食材总数
    LinkPhone: '', //手机号码
    ConsigneeName: '',//联系人
    Address: '',//收货地址
    sumPrice: 0,     //总价
    retUrl: '/pages/order/submitOrder', //返回当前页面地址
    IsTab: 2,//是否Tab页
    showModel: false,
    payOrderID: 0,
    ImgUrl: app.globalData.ApiUrl, //图片URL
    ButtonControll: true //禁止重复提交
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    //防止模板消息进入获取不到用户OpenID
    if (app.globalData.UserData.OpenID == '') {
      var retUrl = that.data.retUrl;
      if (options.ArticleID) {
        retUrl += "?ArticleID=" + options.ArticleID + "&OrderType=" + options.ArticleID;
      }
      wx.setStorageSync('retUrl', retUrl);
      wx.setStorageSync('IsTab', that.data.IsTab);

      wx.redirectTo({
        url: '/pages/login/index'
      });
      return;
    }
    that.setData({
      OrderType: options.OrderType,
      ArticleID: options.ArticleID
    })
    if (options.OrderType == 1) {
      that.GetGoodsList();
    }
    else if (options.OrderType == 2) {
      that.GetShopGoodsModel();
    }
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
  //获取食材列表
  GetGoodsList: function () {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/ShopGoods/GetShopGoodsListByArticle',
      data: {
        ArticleID: that.data.ArticleID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {

        if (res.data.code == 1) {
          var newlist = JSON.parse(res.data.list);
          for (var i = 0; i < newlist.length; i++) {
            newlist[i].GoodsNumber = 0;
          }
          that.setData({
            GoodsList: newlist
          });
          that.GetAddressModel();
        } else {
          that.setData({
            GoodsList: []
          })
        }
      },
      fail: function () {

      }
    })
  },
  //获取食材
  GetShopGoodsModel: function () {
    var that = this
    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/ShopGoods/GetShopGoodsModel',
      data: {
        ID: that.data.ArticleID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          var newlist = [];
          res.data.model.GoodsNumber = 0;
          newlist.push(res.data.model);
          that.setData({
            GoodsList: newlist
          });
          that.GetAddressModel();
        } else {
          that.setData({
            GoodsList: []
          })
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
  //获取收货地址
  GetAddressModel: function () {
    var that = this

    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Address/GetMiniModel',
      data: {
        OpenID: app.globalData.UserData.OpenID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            LinkPhone: res.data.model.telNumber,
            ConsigneeName: res.data.model.userName,
            Address: res.data.model.provinceName + res.data.model.cityName + res.data.model.countyName + res.data.model.detailInfo
          })
        }
        wx.hideNavigationBarLoading()
      },
      fail: function () {
        wx.hideNavigationBarLoading()
      }
    })

  },
  //添加
  add: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    that.data.GoodsList[index].GoodsNumber++;
    var totalPrice = 0;
    var GoodsSum = 0;
    for (var i = 0; i < that.data.GoodsList.length; i++) {
      totalPrice += that.data.GoodsList[i].Price * that.data.GoodsList[i].GoodsNumber;
      GoodsSum += that.data.GoodsList[i].GoodsNumber;
    }
    // var ID = that.data.GoodsList[index].ID;
    that.setData({
      GoodsList: that.data.GoodsList,
      GoodsNum: GoodsSum,
      sumPrice: totalPrice
    })
  },
  //减少
  del: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    if (that.data.GoodsList[index].GoodsNumber <= 0) {
      return;
    }
    that.data.GoodsList[index].GoodsNumber--;
    var totalPrice = 0;
    var GoodsSum = 0;
    for (var i = 0; i < that.data.GoodsList.length; i++) {
      totalPrice += that.data.GoodsList[i].Price * that.data.GoodsList[i].GoodsNumber;
      GoodsSum += that.data.GoodsList[i].GoodsNumber;
    }
    // var ID = that.data.GoodsList[index].ID;
    that.setData({
      GoodsList: that.data.GoodsList,
      GoodsNum: GoodsSum,
      sumPrice: totalPrice
    })
  },
  //跳转选择收货地址
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
    //       else {
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
                that.setData({
                  LinkPhone: res.data.model.telNumber,
                  ConsigneeName: res.data.model.userName,
                  Address: res.data.model.provinceName + res.data.model.cityName + res.data.model.countyName + res.data.model.detailInfo
                })
              }
              else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'null',
                  duration: 2000
                });
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
          if (err.errMsg == "chooseAddress:fail auth deny") {
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
    //       }
    //     }
    //   })
    // }
    // else {
    //   wx.showModal({
    //     title: '提示',
    //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    //   })
    // }
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
  //设置收货地址
  bindinputByAddress: function (e) {
    var that = this;
    that.setData({
      Address: e.detail.value
    })
  },
  //提交订单
  bindFormSubmit: function (e) {

    console.log(e.detail.formId)
    var subGoods = [];
    var that = this;
    if (that.data.GoodsList.length == 0) {
      wx.showToast({
        title: '食材为空，不能提交！',
        icon: 'null',
        duration: 2000
      });
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
    if (e.detail.value.ConsigneeName == "") {
      wx.showToast({
        title: '联系人不能为空！',
        icon: 'null',
        duration: 2000
      })
      return;
    }
    if (e.detail.value.Address == "") {
      wx.showToast({
        title: '收货地址不能为空！',
        icon: 'null',
        duration: 2000
      })
      return;
    }
    var PayMoney = 0;
    for (var i = 0; i < that.data.GoodsList.length; i++) {
      if (that.data.GoodsList[i].GoodsNumber > 0) {
        subGoods.push({
          GoodsID: that.data.GoodsList[i].ID,
          GoodsNumber: that.data.GoodsList[i].GoodsNumber,
          GoodsName: that.data.GoodsList[i].GoodsName,
          Price: that.data.GoodsList[i].Price
        });
        PayMoney += that.data.GoodsList[i].Price * that.data.GoodsList[i].GoodsNumber;
      }
    }
    if (PayMoney <= 0) {
      wx.showToast({
        title: '请选择食材！',
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
      url: app.globalData.ApiUrl + '/Order/GenerateOrder',
      data: {
        detail: JSON.stringify(subGoods),
        OrderType: that.data.OrderType,
        ArticleID: that.data.ArticleID,
        LinkPhone: e.detail.value.LinkPhone,
        PayMoney: PayMoney,
        OpenID: app.globalData.UserData.OpenID,
        OrderMessage: e.detail.value.OrderMessage,
        ConsigneeName: e.detail.value.ConsigneeName,
        FormID: e.detail.formId,
        Address: e.detail.value.Address
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
                that.sendMessage({ prepay_id: e.detail.formId, OrderID: res.data.OrderID });
                that.setData({
                  payOrderID: res.data.OrderID,
                  showModel: true
                })
                // wx.redirectTo({
                //   url: '../order/detail?ID=' + res.data.OrderID
                // })
              },
              'fail': function () {
                wx.redirectTo({
                  url: "../order/list"
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
          title: '订单提交失败！',
          icon: 'null',
          duration: 2000
        });
      }
    })
  },
  //发送消息
  sendMessage: function (e) {
    wx.showNavigationBarLoading()
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Order/SendMessage',
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
          // wx.navigateTo({
          //   url: '../orderDetail/orderDetail?ID=' + e.OrderID
          // })
        }
        else {
          wx.showToast({
            title: res.data.message,
            icon: 'null',
            duration: 2000
          });
        }
        wx.hideNavigationBarLoading()
      },
      fail: function () {
        wx.hideNavigationBarLoading()
        wx.showToast({
          title: '消息发送失败！',
          icon: 'null',
          duration: 2000
        });
      }

    });
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
      url: '../order/detail?ID=' + that.data.payOrderID
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
  backpage: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  //跳转产品详情
  goGoods:function(e){
    var that = this;
    console.log(e.currentTarget.dataset.id)
    wx.redirectTo({
      url: '../goods/detail?GoodsID=' + e.currentTarget.dataset.id
    })
  }
})