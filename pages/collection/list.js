var utils = require('../../utils/util.js');
var app = getApp();

Page({
    data: {
        list: [],
        hasMore: true,    //是否加载数据
        IsLoadMore: true,       //防止滚动下拉加载
        pageIndex: 1,
        pageSize: 10,
        scrollTop: 0,
        scrollHeight: 0,
        ImgUrl: app.globalData.ApiUrl, //图片地址
        delBtnWidth: 90,//删除按钮宽度单位（rpx）    
        IsDelete: true, //是否显示删除
    },
    onLoad: function () {
        var that = this
        that.setData({
            scrollHeight: app.globalData.scrollHeight - 40
        });
        that.fetchProject()
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
            url: app.globalData.ApiUrl + '/Collection/GetCollectionList',
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
                        newlist[i].FinishTime = utils.formatStringToDate(newlist[i].FinishTime);                        
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

    //点击删除按钮事件
    delItem: function (e) {
        var that = this;

        var index = e.target.dataset.id;
        console.log(index)
        var ID = that.data.list[index].ID;
        wx.showModal({
            title: '提示',
            content: '是否删除？',
            success: function (res) {
                if (res.confirm) {
                    wx.request({
                        url: app.globalData.ApiUrl + '/Collection/DeleteCollection',
                        data: {
                            ID: ID
                        },
                        method: 'POST',
                        header: {
                            "Content-Type": "application/json,application/json"
                        },
                        success: function (res) {
                            console.log(res.data)
                            if (res.data.code == 1) {
                                //获取列表中要删除项的下标
                                // var list = that.data.list;
                                // //移除列表中下标为index的项
                                // list.splice(index, 1);
                                // //更新列表的状态
                                // that.setData({
                                //     list: list
                                // });
                                that.setData({
                                    hasMore: true,
                                    list: [],
                                    pageIndex: 1
                                })
                                that.onLoad()
                            }
                        },
                        fail: function () {
                            wx.stopPullDownRefresh()
                            wx.hideNavigationBarLoading()
                        }
                    })


                } else {
                    // initdata(that)
                }
            }
        })
    },
    backpage: function () {   
        wx.navigateBack({
            delta: 1
        })
    }
})