var utils = require('../../utils/util.js');

var app = getApp()
Page({
  data: {
    list: [],
    hasMore: true,    //是否加载数据
    IsLoadMore: true,       //防止滚动下拉加载
    pageIndex: 1,
    pageSize: 10,
    scrollTop: 0,
    scrollHeight: 0,
    ImgUrl: app.globalData.ApiUrl //图片地址     
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    that.setData({
      scrollHeight: app.globalData.scrollHeight - 40
    });
    that.fetchProject()
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
  viewProjectDetail: function (e) {
    var that = this
    var data = e.currentTarget.dataset;
    wx.navigateTo({
      url: "../project/detail?ID=" + data.id
    })
  },
  fetchProject() {
    wx.showNavigationBarLoading()

    var that = this
    wx.request({
      url: app.globalData.ApiUrl + '/Comment/GetListByUserAndImgList',
      data: {
        pageindex: that.data.pageIndex,
        pagesize: that.data.pageSize,
        OpenID: app.globalData.UserData.OpenID,
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code != 1) {
          that.setData({
            hasMore: false,
          })
        } else {
          var thatlist = that.data.list;
          var newlist = JSON.parse(res.data.list);
          for (var i = 0; i < newlist.length; i++) {
            newlist[i].CreateTime = utils.formatStringToDate(newlist[i].CreateTime);
            newlist[i].imgSize = newlist[i].ImgList.length * 55;
            thatlist.push(newlist[i]);
          }
          that.setData({
            IsLoadMore: true,
            list: thatlist
          });
          console.log(that);
          if (thatlist.length >= res.data.count) {
            that.setData({
              hasMore: false,
            })
          }
        }

        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
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
  backpage: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  // 图片点击事件
  viewImg: function (e) {
    var that = this;
    console.log(e)
    var nowImgUrl = e.currentTarget.dataset.src;
    var parentId = e.currentTarget.dataset.id
    var nowImgArr = []
    console.log(that.data.list)
    for (var i = 0; i < that.data.list[parentId].ImgList.length; i++) {
      nowImgArr.push(that.data.ImgUrl + that.data.list[parentId].ImgList[i].Url)
    }
    wx.previewImage({
      current: nowImgUrl, // 当前显示图片的http链接
      urls: nowImgArr // 需要预览的图片http链接列表
    })
  },
})