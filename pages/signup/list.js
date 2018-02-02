var utils = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    projects: [],  			//项目列表数据
    hasMore: true,		    //是否加载数据
    IsLoadMore: true,
    pageIndex: 1,			//页码
    pageSize: 15,			//页数
    scrollTop: 0,			//滚动条位置
    scrollHeight: 0,		//滚动视图高度
    ImgUrl: app.globalData.ApiUrl, //图片地址		   
  },
  onLoad: function (options) {
    var that = this;

    that.setData({
      scrollHeight: app.globalData.scrollHeight - 40
    });
    that.fetchProject();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function (e) {
    // 生命周期函数--监听页面显示
    var that = this;  
  },
  //获取项目列表
  fetchProject() {

    wx.showNavigationBarLoading()
    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Order/GetSignUpOrderList',
      data: {
        pageindex: that.data.pageIndex,
        pagesize: that.data.pageSize,
        OpenID: app.globalData.UserData.OpenID
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {

       
        if (res.data.code != 1) {
          that.setData({
            hasMore: false
          })
        } else {
          console.log(JSON.parse(res.data.list))

          var thatlist = that.data.projects;
          var newlist = JSON.parse(res.data.list);
          var currenTime = utils.formatNumToDateTimeOther(res.data.currenTime);
          var data1, data2, data_;
          for (var i = 0; i < newlist.length; i++) {
            newlist[i].AddDate = utils.formatStringToDate(newlist[i].AddDate);
            newlist[i].SiteTime = utils.formatStringToDate(newlist[i].SiteTime);
            // newlist[i].Difference = newlist[i].SignUpCount - newlist[i].HasSignUpCount;
            // data1 = new Date(newlist[i].SignUpEndTime)
            // data2 = new Date(currenTime);
            // data_ = data1.getTime() - data2.getTime();

            // if (data_ > 0) {
            //   newlist[i].isEnd = 'False'
            // }
            // else {
            //   newlist[i].isEnd = 'True'
            // }
            thatlist.push(newlist[i]);
          }
     
          that.setData({
            IsLoadMore: true,
            projects: thatlist
          });
          console.log(that.data.projects)
          if (thatlist.length >= res.data.count) {
            that.setData({
              hasMore: false,
            })
          }
        }
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
      },
      fail: function () {
        that.setData({
          hasMore: false
        })
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
      }
    })
  },
  //下拉刷新
  bindDownLoad: function () {
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
  viewProjectDetail: function (e) {
    var that = this
    var data = e.currentTarget.dataset;
    wx.navigateTo({
      url: "../project/detail?ID=" + data.id
    })
  },
  backpage: function () {
    wx.switchTab({
      url: '../user/index',
    })   
  }
})