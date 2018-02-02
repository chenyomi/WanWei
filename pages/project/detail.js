var app = getApp()
var utils = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js'); //富文本
var timer = require('../../utils/timer.js');
Page({
  data: {
    showLoading: true,//数据加载中
    showAnimate: false,//加载动画
    hasMore: true, //是否有数据
    hasMore_:true, //留言
    IsLoadMore: true,       //防止滚动下拉加载
    ImgUrl: app.globalData.ApiUrl, //图片URL

    ArticleID: 0,     //文章ID   
    Article: [],   //文章数据    
    CommentList: [],//评价列表数据
    TransactionList: [],
    retUrl: '/pages/project/detail', //返回当前页面地址
    IsTab: 2,//是否Tab页
    collectionID: -1, //是否已收藏
    ShareOpenID: '', //分享人
    BackUrl: '/pages/project/list',
    scrollHeight: 0,
    IsShare: 0,//是否分享
    IsShowShare: 1,//是否显示分享按钮
    IsCanSignUp: 0,//是否显示报名按钮 0：显示；1：不显示
    pageIndex: 1, //页数
    pageSize: 5, //分页大小 
    IsEnable: true,
    IsDelete: false,
    IsClosed: false,
    day: 0,
    hr: 0,
    min: 0,
    sec: 0,
    second: 0,//秒总数
    differenceCount: 0,//报名剩余人数判断  
    tabToggle: 0, //报名tab切换
    showItem: 0, //切换交易记录
    TimeDifferent: 0,//剩余时间数
    SignUpCount:0 ,// 消费数量
    orderCount: 0 // 购买记录
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;

    console.log(wx.canIUse('button.open-type.share'))
    if (!wx.canIUse('button.open-type.share')) {
      that.setData({ IsShowShare: 0 })
    }
    that.setData({
      showAnimate: true
    })
    setTimeout(function () {
      that.setData({
        showAnimate: false
      })
    }, 2000)

    if (options.IsShare) {
      that.setData({
        IsShare: 1
      })
      var retUrl = that.data.retUrl;
      if (options.ID) {
        retUrl += "?ID=" + options.ID;
      }
      wx.setStorageSync('ShareOpenID', options.ShareOpenID);
      wx.setStorageSync('retUrl', retUrl);
      wx.setStorageSync('IsTab', that.data.IsTab);

      that.setData({
        ShareOpenID: options.ShareOpenID
      })
    }

    that.setData({
      scrollHeight: app.globalData.scrollHeight,
      ArticleID: options.ID
    });
    if (options.BackUrl) {
      that.setData({
        BackUrl: options.BackUrl
      })
    }
  },
  onReady: function () {
    var that = this;
    if (that.data.ShareOpenID) {
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return;
    }

    //防止模板消息进入获取不到用户OpenID
    if (app.globalData.UserData.OpenID == '') {
      var retUrl = that.data.retUrl;
      if (that.data.ArticleID) {
        retUrl += "?ID=" + that.data.ArticleID;
      }
      wx.setStorageSync('retUrl', retUrl);
      wx.setStorageSync('IsTab', that.data.IsTab);

      wx.redirectTo({
        url: '/pages/login/index'
      });
      return;
    }

    var ShareOpenID = wx.getStorageSync('ShareOpenID')
    if (ShareOpenID) {
      that.setData({
        ShareOpenID: ShareOpenID
      })
    }
    that.getArticle();
  },
  onShow: function () {
    var that = this;
    if (!that.data.IsShare) { //防止分享进入查询数据
      that.setData({
        showItem:0,
        CommentList: [],
        pageIndex: 1
      });
      that.GetCommentList(that.data.ArticleID);
      that.GetTransactionList(that.data.ArticleID)
    }
  },
  //分享
  onShareAppMessage: function () {
    var that = this;
    return {
      title: that.data.Article.Title,
      path: '/pages/project/detail?IsShare=1&ID=' + that.data.ArticleID + "&ShareOpenID=" + app.globalData.UserData.OpenID
    }
  },
  //返回列表
  gotolist: function () {
    var that = this
    wx.switchTab({
      url: that.data.BackUrl
    })
  },
  // 查看评价
  goComment: function () {
    var that = this;
    wx.navigateTo({
      url: '../project/cmt?ID=' + that.data.ArticleID
    })
  },

  //文章不存在 返回
  backpage: function () {
    var that = this
    wx.navigateBack({
      delta: 1
    })
  },
  //获取信息并修改浏览记录和分享次数
  getArticle: function () {
    // wx.showNavigationBarLoading()
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Article/GetModel',
      data: {
        ID: that.data.ArticleID,
        ShareOpenID: that.data.ShareOpenID,
        CurrentOpenID: app.globalData.UserData.OpenID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 1) {
          //          res.data.model.CreateTime = utils.formatNumToDate(res.data.model.CreateTime);
          if (res.data.model.AdType == 2) //活动类型
          {
           // res.data.model.SignUpBeginTime = utils.formatNumToDateTime(res.data.model.SignUpBeginTime);
            res.data.currenTime = utils.formatNumToDateTimeOther(res.data.currenTime);
            res.data.model.SignUpEndTime = utils.formatNumToDateTimeOther(res.data.model.SignUpEndTime);
            if (res.data.IsCanSignUp == 2) { //已开团，添加计时器
              timer.clear();
              that.TimeOut(res.data.currenTime, res.data.model.SignUpEndTime)
            }
          }
          that.setData({
            Article: res.data.model,
            collectionID: res.data.collectionID,
            showLoading: true,
            IsCanSignUp: res.data.IsCanSignUp,
            IsEnable: res.data.model.IsEnable,
            IsDelete: res.data.model.IsDelete,
            IsClosed: res.data.model.IsClosed,
            differenceCount: res.data.model.SignUpCount - res.data.model.HasSignUpCount,
            SignUpCount: res.data.SignUpCount
          });
          WxParse.wxParse('article', 'html', res.data.model.Content, that, 30);
        }
        else {
          that.setData({
            showLoading: false
          });
        }
      },
      fail: function () {
        that.setData({
          showLoading: false
        })
      }
    })
  },
  //获取对象信息
  getArticleModel: function () {
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
          if (res.data.model.AdType == 2) //活动类型
          {
           // res.data.model.SignUpBeginTime = utils.formatNumToDateTime(res.data.model.SignUpBeginTime);
            res.data.currenTime = utils.formatNumToDateTimeOther(res.data.currenTime);
            res.data.model.SignUpEndTime = utils.formatNumToDateTimeOther(res.data.model.SignUpEndTime);
            if (res.data.IsCanSignUp == 2) { //已开团，添加计时器
              timer.clear();
              that.TimeOut(res.data.currenTime, res.data.model.SignUpEndTime)
            }
          }
          that.setData({
            Article: res.data.model,
            showLoading: true,
            IsCanSignUp: res.data.IsCanSignUp,
            IsEnable: res.data.model.IsEnable,
            IsDelete: res.data.model.IsDelete,
            IsClosed: res.data.model.IsClosed,
           // differenceCount: res.data.model.SignUpCount - res.data.model.HasSignUpCount,
            SignUpCount: res.data.SignUpCount
          });
          WxParse.wxParse('article', 'html', res.data.model.Content, that, 30);
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
  //倒计时
  TimeOut: function (data1, data2) {
    var that = this
    var data1 = new Date(data1).getTime();
    var data2 = new Date(data2).setHours(23, 59, 59);
    var date_ = data2 - data1;
    if (date_ > 0) {
      timer.countdown(that, date_);
    }
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
            hasMore_: false,
            CommentList: []
          })
        } else {
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
            hasMore_: true,
            CommentList: thatlist,
            'Article.ComCount': res.data.count
          });
          console.log(that.data.CommentList)
          if (thatlist.length >= res.data.count) {
            that.setData({
              hasMore_: false
            })
          }
          console.log(that.data.hasMore_)
        }
      },
      fail: function () {
        that.setData({
          hasMore_: false
        })
      }
    })
  },//获取文章关联的交易记录列表
  GetTransactionList(ArticleID) {
    var that = this;
    // wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Order/GetListByArticle',
      data: {
        pageindex: that.data.pageIndex,
        pagesize: that.data.pageSize,
        ArticleID: ArticleID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code != 1) {
          that.setData({
            hasMore: false,
            TransactionList: []
          })
        } else {
          var thatlist = that.data.TransactionList;
          var newlist = JSON.parse(res.data.list)
          for (var i = 0; i < newlist.length; i++) {
            newlist[i].LinkPhoneNew = newlist[i].LinkPhone.substring(0, 3) + "****" + newlist[i].LinkPhone.substring(8, 11)
            thatlist.push(newlist[i]);
          }

          that.setData({
            IsLoadMore: true,
            hasMore: true,
            TransactionList: thatlist,
            orderCount: res.data.count
          });

          console.log(that.data.TransactionList)
          if (thatlist.length >= res.data.count) {
            that.setData({
              hasMore: false
            })
          }
        }
      },
      fail: function () {
        that.setData({
          hasMore: false
        })
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

  //跳转到报名页
  goSignUp: function (e) {
    var that = this;
    wx.request({
      url: app.globalData.ApiUrl + '/Order/GetIsCanSignUp',
      data: {
        ArticleID: that.data.ArticleID,
        OpenID: app.globalData.UserData.OpenID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code == 1) {
          wx.navigateTo({
            url: '../signup/index?ID=' + that.data.ArticleID
          })
        }
        else {
          wx.showToast({
            title: res.data.message,
            duration: 2000
          });
        }
      }
    });
  },
  //跳转到食材购买页
  goOrderUp: function (e) {
    var that = this;
    wx.navigateTo({
      url: '../order/submitOrder?ArticleID=' + that.data.ArticleID + '&OrderType=1'
    })
  },
  //添加收藏
  addCollection: function () {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Collection/AddCollection',
      data: {
        ArticleID: that.data.ArticleID,
        OpenID: app.globalData.UserData.OpenID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 1) {
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            collectionID: res.data.collectionID,
            'Article.ColCount': that.data.Article.ColCount + 1
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
  //移除收藏
  removeCollection: function () {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Collection/DeleteCollection',
      data: {
        ID: that.data.collectionID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 1) {
          wx.showToast({
            title: '取消成功',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            collectionID: 0,
            'Article.ColCount': that.data.Article.ColCount - 1
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
      if (that.data.hasMore || that.data.hasMore_) {
        that.setData({
          IsLoadMore: false,
          pageIndex: that.data.pageIndex + 1
        })
        if (that.data.showItem == 0) {
          that.GetCommentList(that.data.ArticleID);
        }
        else {
          that.GetTransactionList(that.data.ArticleID);
        }

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
      showItem: 0,
      hasMore: true,
      hasMore_: true,
      CommentList: []
    })
    that.getArticleModel();
    that.GetCommentList(that.data.ArticleID);
  },
  //一日行程toggle
  tabToggle0: function () {
    this.setData({
      tabToggle: 0
    })
  },
  //报名须知toggle
  tabToggle1: function () {
    this.setData({
      tabToggle: 1
    })
  },
  //留言toggle
  showMessage: function () {
    this.setData({
      showItem: 0,
      pageIndex: 1, //页数
      CommentList: [],
      hasMore_: true
    })
    this.GetCommentList(this.data.ArticleID);
  },
  //购买记录toggle
  showTransaction: function () {
    this.setData({
      showItem: 1,
      pageIndex: 1, //页数
      TransactionList: [],
      hasMore: true
    })
    this.GetTransactionList(this.data.ArticleID);
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
  },
  getHeight: function () {
    var that = this;
    if (wx.createSelectorQuery) {
      var messageH = 0;
      var fillH = 0;
      wx.createSelectorQuery().select('.message').fields({
        dataset: true,
        size: true,
      }, function (res) {
        messageH = res.height
        console.log(res.height);
        wx.createSelectorQuery().select('.details').fields({
          dataset: true,
          size: true,
        }, function (res) {
          fillH = res.height
          console.log(res.height)
          wx.pageScrollTo({
            scrollTop: fillH - messageH
          })
        }).exec()
      }).exec()
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.navigateTo({
        url: '../project/cmt?ID=' + that.data.ArticleID
      })
    }


    
  

  
  }
})