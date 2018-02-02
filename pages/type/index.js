// pages/type/index.js
var app = getApp();

Page({
  data: {
    TypeList: [],
    ImgUrl: app.globalData.ApiUrl, //图片地址
  },
  onLoad: function (options) {

  },
  onReady: function () {
    var that = this;
    that.GetTypeList();
  },
  onShow: function () {

  },
  //下拉刷新
  onPullDownRefresh: function () {
    console.log('bindUpLoad')
    var that = this;
    that.GetTypeList()
  },
  //获取标签关联的列表
  GetTypeList() {
    var that = this;
    wx.request({
      url: app.globalData.ApiUrl + '/LableInfo/GetAllList',
      data: {},
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        if (res.data.code != 1) {
          that.setData({
            TypeList: []
          })
        } else {
          var thatlist = [];
          var newlist = JSON.parse(res.data.list)
          for (var i = 0; i < newlist.length; i++) {
            thatlist.push(newlist[i]);
          }
          that.setData({
            TypeList: thatlist
          })
        }
        wx.stopPullDownRefresh()
      },
      fail: function () {
        wx.stopPullDownRefresh()
      }
    })
  },
  goList: function (e) {
    var that = this;
    wx.navigateTo({
      url: "../type/list?ID=" + e.currentTarget.dataset.id + "&Name=" + e.currentTarget.dataset.name
    })
  }
})