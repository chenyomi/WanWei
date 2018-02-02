// pages/goods/detail.js
var app = getApp();
var utils = require('../../utils/util.js');
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
    GoodsID: 0,
    GoodsModel: {},
    ShopsModel: {
      Lng: '',
      Lat: '',
      Address: '',
      Name: ''
    },
    imgUrls: [
    ],
    CommentList: [],
    pageIndex: 1,			//页码
    pageSize: 10			//页数
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      GoodsID: options.GoodsID,
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

  },
  onReady: function () {
    // 页面渲染完成
    var that = this;
    that.GetShopGoodsModel();
    that.GetCommentList()
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
  GetShopGoodsModel: function () {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/ShopGoods/GetShopGoodsModel',
      data: {
        ID: that.data.GoodsID,
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          var imglist = JSON.parse(res.data.list)

          that.setData({
            GoodsModel: res.data.model,
            imgUrls: imglist,
            IsLoadMore: true,
            showLoading: true
          });
          WxParse.wxParse('article', 'html', res.data.model.Description, that, 30);
          console.log(that.data.GoodsModel)
          that.GetShopModel()
        }
        else {
          that.setData({
            showLoading: false
          });
        }
        wx.stopPullDownRefresh(); //页面下拉刷新返回
      },
      fail: function () {
        that.setData({
          showLoading: false
        })
        wx.stopPullDownRefresh(); //页面下拉刷新返回
      }
    })
  },
  //获取商家信息
  GetShopModel: function () {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Shop/GetShopModel',
      data: {
        ID: that.data.GoodsModel.ShopID,
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            ShopsModel: res.data.model,
          });
          console.log(that.data.ShopsModel)
        }
      },
      fail: function () {
      }
    })
  },
  //获取食品的评价列表
  GetCommentList() {
    var that = this;
    wx.request({
      url: app.globalData.ApiUrl + '/Comment/GetImgListByGoods',
      data: {
        pageindex: that.data.pageIndex,
        pagesize: that.data.pageSize,
        ShopGoodsID: that.data.GoodsID,
        OpenID: app.globalData.UserData.OpenID
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
            newlist[i].CreateTime = utils.formatStringToDateTime(newlist[i].CreateTime);
            newlist[i].ReturnDate = utils.formatStringToDateTime(newlist[i].ReturnDate);
            if (!newlist[i].Headimgurl) {
              newlist[i].Headimgurl = "/images/user.png";
            }
            if (!newlist[i].RealName) {
              newlist[i].RealName = "匿名";
            }
            thatlist.push(newlist[i]);
          }
          that.setData({
            IsLoadMore: true,
            hasMore: true,
            CommentList: thatlist
          });
          if (newlist.length >= res.data.count) {
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
      },
      fail: function () {
        that.setData({
          hasMore: true
        })
      }
    })
  },
  //跳转到食材购买页
  goOrderUp: function (e) {
    var that = this;
    wx.redirectTo({
      url: '../order/submitOrder?ArticleID=' + that.data.GoodsID + '&OrderType=2'
    })
  },
  //跳转到商家页
  GoShop: function () {
    var that = this;
    wx.redirectTo({
      url: '../shops/detail?ShopID=' + that.data.GoodsModel.ShopID
    })
  },
  //电话
  phone: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.ShopsModel.TelePhone //仅为示例，并非真实的电话号码
    })

  },
  //打开地图
  openMap: function () {
    var that = this;
    if (that.data.ShopsModel.Lat) {
      var point = utils.BdmapEncryptToMapabc(that.data.ShopsModel.Lat, that.data.ShopsModel.Lng)
      wx.openLocation({
        latitude: point.lat,
        longitude: point.lng,
        address: that.data.ShopsModel.Address,
        name: that.data.ShopsModel.Name,
        scale: 18
      })
    }
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
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh')
    var that = this;
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
      hasMore: true,
      CommentList: []
    })
    that.GetShopGoodsModel();
    that.GetCommentList()
  },
  //添加点赞
  AddCommend: function (e) {
    var that = this;
    var data = e.currentTarget.dataset;
    var index = data.index;
    wx.request({
      url: app.globalData.ApiUrl + '/Comment/AddCommend',
      data: {
        ID: data.id,
        OpenID: app.globalData.UserData.OpenID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.data.CommentList[index].CommendCount = res.data.CommendCount;
          that.data.CommentList[index].CommendID = res.data.commend;
          that.setData({
            CommentList: that.data.CommentList
          })
        }
        else {
          wx.showToast({
            title: res.data.message,
            duration: 2000
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '出错啦',
          icon: 'offline',
          duration: 2000
        })
      }
    })
  },
  //删除点赞
  DeleteCommend: function (e) {
    var that = this;
    var data = e.currentTarget.dataset;
    var index = data.index;
    var ID = that.data.CommentList[index].CommendID;
    wx.request({
      url: app.globalData.ApiUrl + '/Comment/DeleteCommend',
      data: {
        ID: ID,
        CommentID: data.id,
        OpenID: app.globalData.UserData.OpenID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.data.CommentList[index].CommendCount = res.data.CommendCount;
          that.data.CommentList[index].CommendID = 0;
          that.setData({
            CommentList: that.data.CommentList
          })
        }
        else {
          wx.showToast({
            title: res.data.message,
            duration: 2000
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '出错啦',
          icon: 'offline',
          duration: 2000
        })
      }
    })
  }
})