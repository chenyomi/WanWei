
var utils = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    projects: [],  			//项目列表数据
    projectsHot: [],  			//项目推荐列表数据
    hasMore: true,		    //是否加载数据
    IsLoadMore: true, //防止滚动加载
    retUrl: '/pages/project/list', //返回当前页面地址
    IsTab: 1,//是否Tab页
    pageIndex: 1,			//页码
    pageSize: 10,			//页数
    showTipLoading: false,//上拉下拉切换时显示底部提示
    scrollTop: 0,			//滚动条位置
    scrollHeight: 0,		//滚动视图高度		  
    ShareOpenID: '',		     //分享人     
    ImgUrl: app.globalData.ApiUrl //图片地址
  },
  onLoad: function (options) {
    var that = this;
    if (options.IsShare) {
      wx.setStorageSync('ShareOpenID', options.ShareOpenID);
      wx.setStorageSync('retUrl', that.data.retUrl);
      wx.setStorageSync('IsTab', that.data.IsTab);

      that.setData({
        ShareOpenID: options.ShareOpenID,
      })
    }
  },
  onReady: function () {
    // 页面渲染完成
    var that = this;
    //登陆拦截需要在onReady方法里面加，其他时候加安卓手机会webView加载失败
    if (that.data.ShareOpenID) {
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return;
    }
    var ShareOpenID = wx.getStorageSync('ShareOpenID')
    if (ShareOpenID) {
      that.setData({
        ShareOpenID: ShareOpenID
      })
    }
    that.setData({
      scrollHeight: app.globalData.scrollHeight
    });
    that.getHotProject();
    that.fetchProject();  
  },
  onShow: function (e) {
    // 生命周期函数--监听页面显示
    var that = this;
  },
  //获取推荐列表
  fetchProject() {
    var that = this

    console.log('CurrentOpenID' + app.globalData.UserData.OpenID);
    console.log('ShareOpenID' + that.data.ShareOpenID);
    wx.request({
      url: app.globalData.ApiUrl + '/Article/GetMiniList',
      data: {
        AdType: 0,
        ShareOpenID: that.data.ShareOpenID,
        CurrentOpenID: app.globalData.UserData.OpenID,
        pageindex: that.data.pageIndex,
        pagesize: that.data.pageSize
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {

        console.log(res.data)
        if (res.data.code != 1) {
          that.setData({
            hasMore: false
          })
        } else {
          var thatlist = that.data.projects;
          var newlist = JSON.parse(res.data.list);       
          res.data.currenTime = utils.formatNumToDateTimeOther(res.data.currenTime);
          for (var i = 0; i < newlist.length; i++) {
            if (newlist[i].AdType == 2) //活动类型判断
            {
              newlist[i].SignUpLess = newlist[i].SignUpCount - newlist[i].HasSignUpCount;
              newlist[i].lessTime = that.TimeOut(res.data.currenTime, newlist[i].SignUpEndTime);
            }
            thatlist.push(newlist[i]);
          }
          that.setData({
            IsLoadMore: true,
            projects: thatlist
          });
          if (thatlist.length >= res.data.count) {
            that.setData({
              hasMore: false,
            })
          }
        }
        that.setData({
          showTipLoading: true
        })
        wx.stopPullDownRefresh()
      },
      fail: function () {
        that.setData({
          hasMore: false
        })
        wx.stopPullDownRefresh()
      }
    })
  },
  //获取置顶列表数据
  getHotProject: function () {
    var that = this;
    wx.request({
      url: app.globalData.ApiUrl + '/Article/GetMiniList',
      data: {
        AdType: -1,
        IsTop:1,
        ShareOpenID: '',
        CurrentOpenID: app.globalData.UserData.OpenID,
        pageindex: 1,
        pagesize: 50
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {

        console.log(res.data)
        if (res.data.code != 1) {
          that.setData({
            projectsHot: []
          });
        } else {
          var thatlist = [];
          var newlist = JSON.parse(res.data.list);
          for (var i = 0; i < newlist.length; i++) {
            thatlist.push(newlist[i]);
          }
          console.log(newlist)
          that.setData({
            projectsHot: thatlist
          });
        }
      },
      fail: function () {
      }
    })
  },
  //计算时间差
  TimeOut: function (data1, data2) {
    var that = this
    var data1 = new Date(data1).getTime();
    var data2 = new Date(data2).setHours(23, 59, 59);
    var date_ = data2 - data1;
    var lessTime = Math.floor(date_ / 1000);
    return lessTime;
  },
  //查看明细
  viewProjectDetail: function (e) {
    var that = this
    var data = e.currentTarget.dataset;
    wx.navigateTo({
      url: "../project/detail?ID=" + data.id
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    console.log('bindUpLoad')
    var that = this;
      that.setData({
        showTipLoading: false,
        hasMore: false,
        IsLoadMore: false,
        pageIndex: 1,
        projects: []
      })
      that.getHotProject();  
      that.fetchProject();    
  },
  //上拉刷新
  onReachBottom: function () {
    console.log('bindDownLoad')
    var that = this

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
  //分享
  onShareAppMessage: function () {
    var that = this;
    return {
      title: '玩味吃协',
      path: '/pages/project/list?IsShare=1&ShareOpenID=' + app.globalData.UserData.OpenID
    }
  },
  //跳转分类列表页
  goList: function (e) {
    var that = this;
    wx.navigateTo({
      url: "../type/list?TypeID=" + e.currentTarget.dataset.id 
    })
  }
})