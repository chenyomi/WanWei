// pages/goods/detail.js
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js'); //富文本
Page({
  data: {
    showLoading: true,//数据加载中
    showAnimate: false,//加载动画
    hasMore: true, //是否有数据
    IsLoadMore: true,       //防止滚动下拉加载
    ImgUrl: app.globalData.ApiUrl, //图片URL

    scrollTop: 0, // 滚动位置
    scrollHeight: 0, //屏幕高度
    ShopID: 0,
    ShopsModel: {},
    imgUrls: [
    ],
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    swiperHeight: 0,
    CommentList: [],
    pageIndex: 1,			//页码
    pageSize: 1,			//页数
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      ShopID: options.ShopID,
      scrollHeight: app.globalData.scrollHeight - 50
    })
    that.setData({
      showAnimate: true
    })
    setTimeout(function () {
      that.setData({
        showAnimate: false
      })
    }, 2000)
    that.GetShopShopsModel();
    that.GetCommentList()
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
  //获取食材明细信息
  GetShopShopsModel: function () {
    var that = this
    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Shop/GetShopModel',
      data: {
        ID: that.data.ShopID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          var imglist = JSON.parse(res.data.list)

          that.setData({
            ShopsModel: res.data.model,
            imgUrls: imglist,
            IsLoadMore: true,
            showLoading: true
          });
          WxParse.wxParse('article', 'html', res.data.model.Description, that, 30);
          console.log(that.data.ShopsModel)
        }
        else {
          that.setData({
            showLoading: false
          });
        }
        wx.hideNavigationBarLoading()
      },
      fail: function () {
        that.setData({
          showLoading: false
        })
        wx.hideNavigationBarLoading()
      }
    })
  },
  //获取食品的评价列表
  GetCommentList() {
    var that = this;
    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Comment/GetListByGoodsAndImgList',
      data: {
        pageindex: that.data.pageIndex,
        pagesize: that.data.pageSize,
        // ShopGoodsID: that.data.GoodsID
        ShopGoodsID: 7
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 1) {
          var thatlist = that.data.CommentList;
          var newlist = JSON.parse(res.data.list)
          for (var i = 0; i < newlist.length; i++) {
            newlist[i].imgSize = newlist[i].ImgList.length * 55;   
            thatlist.push(newlist[i]);           
          }
          that.setData({
            IsLoadMore: true,
            CommentList: thatlist
          });
          if (newlist.length >= that.data.ShopsModel.ComCount) {
            that.setData({
              hasMore: false
            })
          }
        }
        else {
          that.setData({
            hasMore: true
          })
        }
        wx.hideNavigationBarLoading()
      },
      fail: function () {
        that.setData({
          hasMore: true
        })
        wx.hideNavigationBarLoading()
      }
    })
  },
 
  //轮播高度
  imageLoad: function (e) {
    var that = this;
    var o = e.detail.height / e.detail.width;
    var height = app.globalData.windowWidth * o;
    if (height < that.data.swiperHeight || that.data.swiperHeight == 0)
      that.setData({
        swiperHeight: height
      })
  },
  // 图片点击事件
  viewImg: function (e) {
    var that = this;
    console.log(e)
    var nowImgUrl = e.currentTarget.dataset.src;
    var parentId = e.currentTarget.dataset.id
    var nowImgArr = []
    for (var i = 0; i < that.data.CommentList[parentId].ImgList.length; i++) {
      nowImgArr.push(that.data.ImgUrl + that.data.CommentList[parentId].ImgList[i].Url)
      console.log(that.data.CommentList[parentId].ImgList[i].Url)
    }
    console.log(nowImgUrl)
    console.log(nowImgArr)
    wx.previewImage({
      current: nowImgUrl, // 当前显示图片的http链接
      urls: nowImgArr // 需要预览的图片http链接列表
    })
  },
  //返回主页
  gohome: function () {
    wx.switchTab({
      url: '../project/list'
    })
  },
  //文章不存在 返回
  backpage: function () {
    var that = this
    wx.navigateBack({
      delta: 1
    })
  },
  //上拉触底事件
  onReachBottom: function () {
    console.log('onReachBottom')
    var that = this
    if (that.data.IsLoadMore) {
      if (that.data.hasMore) {
        that.setData({
          IsLoadMore: false,
          pageIndex: that.data.pageIndex + 1
        })
        that.GetCommentList()
      }
    }
  },
  //下拉刷新
  onPullDownRefresh:function(){
    console.log('onPullDownRefresh')
    var that =this;
    wx.stopPullDownRefresh()
    that.setData({
      showAnimate: true
    })
    setTimeout(function () {
      that.setData({
        showAnimate: false
      })
    }, 2000)
    that.setData({
      pageIndex: 1,
      hasMore: false,
      CommentList: []
    })
    that.GetShopShopsModel();
    that.GetCommentList()
  }
})