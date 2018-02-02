// pages/order/orderList.js
var app = getApp()
Page({
  data: {
    showTipLoading: false,//显示底部提示
    widthMove: '0px',
    windowWidth: 0,
    isActive: 2, // 0：未支付；1：已支付；2：全部订单
    scrollTop: 0, // 滚动位置
    scrollHeight: 0, //屏幕高度
    OrderList: [], //文章列表数据
    hasMore: true, //是否显示拼命加载中…	
    IsLoadMore: true,       //防止滚动下拉加载
    pageIndex: 1, //页数
    pageSize: 8, //分页大小
    ImgUrl: app.globalData.ApiUrl //图片地址
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          scrollHeight: res.windowHeight - 75
        })
      }
    })
    that.setData({
      OrderList: [],
      pageIndex: 1
    })
    that.fetchProject()
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    var that = this;
    // wx.getStorage({
    //   key: 'fresh',
    //   success: function (res) {
    //     console.log(res.data)
    //     if (res.data == 1) {
 
    // wx.setStorage({
    //   key: "fresh",
    //   data: 0
    // })
    //     }
    //   }
    // })
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //获取订单列表
  fetchProject: function (orderType) {
    var that = this
    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Order/GetMiniList',
      data: {
        pageindex: that.data.pageIndex,
        pagesize: that.data.pageSize,
        State: that.data.isActive,
        OpenID: app.globalData.UserData.OpenID,
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {

        if (res.data.code != 1) {
          that.setData({
            hasMore: false,
            OrderList: []
          })
        } else {
          console.log(res.data)
          var thatlist = that.data.OrderList;
          var orderlist = JSON.parse(res.data.list)
          for (var i = 0; i < orderlist.length; i++) {
            thatlist.push(orderlist[i]);
          }
          that.setData({
            IsLoadMore: true,
            OrderList: thatlist
          });

          if (orderlist.length < that.data.pageSize) {
            that.setData({
              hasMore: false,
            })
          }
        }
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()

      },
      fail: function () {
        that.setData({
          hasMore: false,
          OrderList: []
        })
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
      }
    })
  },
  //全部订单
  tabTo2: function () {
    var that = this;
    that.setData({
      pageIndex: 1,
      hasMore: true,
      isActive: 2,
      OrderList: []
    }),

      that.fetchProject();
  },
  //未支付
  tabTo0: function () {
    var that = this;
    that.setData({
      pageIndex: 1,
      hasMore: true,
      isActive: 0,
      OrderList: []
    }),

      that.fetchProject();
  },
  //已支付
  tabTo1: function () {
    var that = this;
    that.setData({
      pageIndex: 1,
      hasMore: true,
      isActive: 1,
      OrderList: []
    }),

      that.fetchProject();
  },
  //跳转到评价页面
  goConment: function (e) {
    var that = this;
    var data = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../comment/comment?ShopGoodsID=0&OrderID=' + data.id + '&ArticleID=0'
    })
  },
  //跳转到订单明细
  goOrder: function (e) {
    var data = e.currentTarget.dataset;

    wx.navigateTo({
      url: '../order/detail?ID=' + data.id
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    console.log('bindUpLoad')
    var that = this;

    if (that.data.IsLoadMore) {
      that.setData({
        showTipLoading: false,
        hasMore: false,
        IsLoadMore: false,
        pageIndex: 1,
        OrderList: []
      })
      that.fetchProject()
    }



  },
  //上拉刷新
  onReachBottom: function () {
    var that = this;
    console.log('bindDownLoad')
    that.setData({
      showTipLoading: true
    })
    if (that.data.IsLoadMore) {
      if (that.data.hasMore) {
        that.setData({
          IsLoadMore: false,
          pageIndex: that.data.pageIndex + 1
        })
        that.fetchProject()
      }
    }
  },
  backpage: function () {
    wx.switchTab({
      url: '../user/index'
    })
  }
})