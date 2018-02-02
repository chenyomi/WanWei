// pages/index/index.js
var utils = require('../../utils/util.js');
var timer = require('../../utils/timer.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    ShareOpenID: '',
    projects: [],
    ImgUrl: app.globalData.ApiUrl, //图片地址
    IsTab: 1,//是否Tab页
    retUrl: '/pages/index/index', //返回当前页面地址
    day: 0,
    hr: 0,
    min: 0,
    sec: 0,
    pageIndex: 1, //页数
    pageSize: 20, //分页大小 
    isStart: 0, //是否开团
    dotDirection:0,
    TimeDifferent:0 //时间差
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.IsShare) {
      wx.setStorageSync('ShareOpenID', options.ShareOpenID);
      wx.setStorageSync('retUrl', that.data.retUrl);
      wx.setStorageSync('IsTab', that.data.IsTab);

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
    that.fetchProject()
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  //获取项目列表
  fetchProject() {
    var that = this

    console.log('CurrentOpenID' + app.globalData.UserData.OpenID);
    console.log('ShareOpenID' + that.data.ShareOpenID);
    wx.request({
      url: app.globalData.ApiUrl + '/Article/GetMiniList',
      data: {
        AdType: 0,
        ShareOpenID: that.data.ShareOpenID,
        IsOpenGroup: 0,
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

        } else {
          var thatlist = that.data.projects;
          var newlist = JSON.parse(res.data.list);
          var timerList = [];
          res.data.currenTime = utils.formatNumToDateTimeOther(res.data.currenTime);
          for (var i = 0; i < newlist.length; i++) {
            newlist[i].CreateTime = utils.formatStringToDate(newlist[i].CreateTime);
            if (newlist[i].AdType == 2) {
              newlist[i].lessTime = that.TimeOut(res.data.currenTime, newlist[i].SignUpEndTime);
              newlist[i].day = that.data.day;
              newlist[i].hr = that.data.hr;
            }           
            newlist[i].BookingProgress = newlist[i].HasBookingCount * 100 / newlist[i].BookingCount;
            newlist[i].Surplus = newlist[i].BookingCount - newlist[i].HasBookingCount;
            newlist[i].SignUpLess = newlist[i].SignUpCount - newlist[i].HasSignUpCount;                     
            thatlist.push(newlist[i]);
          }
          console.log(newlist)
          that.setData({
            projects: thatlist
          });
        }

        wx.stopPullDownRefresh()
      },
      fail: function () {
        wx.stopPullDownRefresh()
      }
    })
  },
  //计算时间差，获取倒计时
  TimeOut: function (data1, data2) {
    var that = this
    var data1 = new Date(data1).getTime();
    var data2 = new Date(data2).setHours(23, 59, 59);
    var date_ = data2 - data1;
    var lessTime = Math.floor(date_ / 1000);
    if (lessTime > 0) {
      timer.countDifferent(that, date_)
    }
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
  //分享
  onShareAppMessage: function () {
    var that = this;
    return {
      title: '玩味吃协',
      path: '/pages/index/index?IsShare=1&ShareOpenID=' + app.globalData.UserData.OpenID
    }
  },
  changeSwiper:function(e){
    var that= this;
    var count = that.data.projects;
    if (count < 2) {
      that.setData({
        dotDirection: 3
      })
    }
    else{
      if (e.detail.current == 0) {
        that.setData({
          dotDirection: 0
        })
      }
      else if (e.detail.current == (count.length - 1)) {
        that.setData({
          dotDirection: 1
        })
      }

      else {
        that.setData({
          dotDirection: 2
        })
      }
    }
   
  }
})