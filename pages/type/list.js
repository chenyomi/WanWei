var utils = require('../../utils/util.js');
var timer = require('../../utils/timer.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    projects: [],  			//项目列表数据
    scrollTop: 0,			//滚动条位置
    scrollHeight: 0,		//滚动视图高度
    hasMore: true,		    //是否加载数据
    IsLoadMore: true,
    retUrl: '/pages/project/list', //返回当前页面地址
    isListLoad: false,
    IsTab: 1,//是否Tab页
    pageIndex: 1,			//页码
    pageSize: 10,			//页数
    showTipLoading: false,//上拉下拉切换时显示底部提示
    ImgUrl: app.globalData.ApiUrl, //图片地址
    LableID:0,
    Type:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.ID){
      that.setData({
        LableID: options.ID
      })
      wx.setNavigationBarTitle({
        title: options.Name
      })
    }
    else if (options.TypeID){
      that.setData({
        Type: options.TypeID
      })
    }
    that.fetchProject();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  fetchProject() {
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Article/GetMiniList',
      data: {
        AdType: that.data.Type,
        ShareOpenID: '',
        CurrentOpenID: app.globalData.UserData.OpenID,
        pageindex: that.data.pageIndex,
        pagesize: that.data.pageSize,
        LableID: that.data.LableID
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

    if (that.data.IsLoadMore) {
      that.setData({
        showTipLoading: false,
        hasMore: false,
        IsLoadMore: false,
        pageIndex: 1,
        projects: []
      })
      that.fetchProject()
    }
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
  backpage: function () {
    wx.navigateBack({
      delta: 1
    })
  }
})