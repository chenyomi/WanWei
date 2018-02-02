var app = getApp()
var utils = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js'); //富文本
var timer = require('../../utils/timer.js');
Page({
  data: {
    showLoading: true,//数据加载中
    showAnimate: false,//加载动画
    hasMore: true, //是否有数据
    IsLoadMore: true,       //防止滚动下拉加载
    ImgUrl: app.globalData.ApiUrl, //图片URL

    ArticleID: 0,     //文章ID   
    CommentList: [],//评价列表数据
    pageIndex: 1, //页数
    pageSize: 5, //分页大小 
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
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
      CommentList: [],
      pageIndex: 1,
      ArticleID: options.ID
    });
    that.GetCommentList(that.data.ArticleID);
  },
  onShow: function () {
    var that = this;
    
  },

  //文章不存在 返回
  backpage: function () {
    var that = this
    wx.navigateBack({
      delta: 1
    })
  },

  //获取文章关联的评价列表
  GetCommentList(ArticleID) {
    var that = this;
    // wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Comment/GetListAndImgList',
      data: {
        pageindex: that.data.pageIndex,
        pagesize: that.data.pageSize,
        ArticleID: ArticleID,
        OpenID: app.globalData.UserData.OpenID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code != 1) {
          that.setData({
            hasMore: false,
            CommentList: []
          })
        } else {
          var thatlist = that.data.CommentList;
          var newlist = JSON.parse(res.data.list)
          for (var i = 0; i < newlist.length; i++) {
            newlist[i].imgSize = newlist[i].ImgList.length * 55;
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
            CommentList: thatlist,
            ComCount: res.data.count
          });
          console.log(that.data.CommentList)
          if (thatlist.length >= res.data.count) {
            that.setData({
              hasMore: false
            })
          }
        }
        // wx.hideNavigationBarLoading()
      },
      fail: function () {
        that.setData({
          hasMore: false
        })
        // wx.hideNavigationBarLoading()
      }
    })
  },
  //跳转到评价页面
  goConment: function (e) {
    var that = this;
    wx.navigateTo({
      url: '../comment/comment?ShopGoodsID=0&OrderID=0&ArticleID=' + that.data.ArticleID
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
        that.GetCommentList(that.data.ArticleID);
      }
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh')
    var that = this;
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
      hasMore: true,
      CommentList: []
    })
    that.GetCommentList(that.data.ArticleID);
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
          // wx.showToast({
          //   title: '点赞成功',
          //   icon: 'success',
          //   duration: 2000
          // })         
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
          // wx.showToast({
          //   title: '取消成功',
          //   icon: 'success',
          //   duration: 2000
          // })         
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