// pages/comment/comment.js
var app = getApp();
Page({
  data: {
    ArticleID: 0,
    ShopGoodsID: 0,
    OrderID: 0,
    Star: 0,
    content: '',
    BackID: 0,
    BackUrl: '',
    FileList: [],
    ImgUrl: app.globalData.ApiUrl, //图片地址
    ButtonControll: true //按钮提交控制
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      OrderID: options.OrderID,
      ShopGoodsID: options.ShopGoodsID,
      ArticleID: options.ArticleID
    });
    if (options && options.BackUrl) {
      that.setData({
        BackUrl: options.BackUrl + "?ID=" + options.BackID
      })
    }
  },
  // 图片点击事件
  wxParseImgTap: function (e) {
    var that = this;

    var nowImgUrl = e.target.dataset.src;
    var nowImgArr = []
    for (var i = 0; i < that.data.FileList.length; i++) {
      nowImgArr.push(that.data.ImgUrl + that.data.FileList[i].Url);
      console.log(nowImgArr)
    }
    wx.previewImage({
      current: nowImgUrl, // 当前显示图片的http链接
      urls: nowImgArr // 需要预览的图片http链接列表
    })
  },

  //选择评价等级 
  star: function (e) {
    var that = this;
    var data = e.currentTarget.dataset;
    that.setData({
      Star: data.star
    });
  },
  //选择图片
  chooseImg: function (e) {
    var that = this;
    if (that.data.FileList.length >= 10) {
      wx.showToast({
        title: '最多上传9张',
        icon: 'offline',
        duration: 2000
      })
      return;
    }
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        that.uploadImg(tempFilePaths)
      }
    })
  },
  //删除图片
  delImg: function (e) {
    var that = this;
    var data = e.currentTarget.dataset.id;

    var arr = that.data.FileList;
    console.log(arr)
    var newarr = arr.splice(data, 1)
    that.setData({
      FileList: arr
    })
  },
  //上传图片
  uploadImg: function (arr) {
    var that = this;
    if (arr.length != 0) {
      wx.uploadFile({
        url: app.globalData.ApiUrl + '/Upload/BatchUpload',
        filePath: arr[0],
        name: 'file',
        formData: {
          'folder': 'CommentAttachment'
        },
        success: function (res) {
          var data = JSON.parse(res.data);
          if (data.Result) {

            var strList = data.FileList[0].split('&&');
            var item = {};
            item.Name = strList[0];
            item.Url = strList[1];
            item.Size = strList[2];

            var thatlist = that.data.FileList;
            thatlist.push(item);
            that.setData({
              FileList: thatlist
            })

            //do something
            arr.splice(0, 1);
            that.uploadImg(arr);
          }
          else {

            wx.showToast({
              title: '文件上传失败',
              icon: 'offline',
              duration: 2000
            })
            that.setData({
              FileList: []
            })
          }
        }
      })
    }
  },
  //提交评价
  bindFormSubmit: function (e) {
    var that = this;
    if (that.data.FileList.length >= 10) {
      wx.showToast({
        title: '最多上传9张',
        icon: 'offline',
        duration: 2000
      })
      return;
    }
    that.setData({
      ButtonControll: false
    })
    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.ApiUrl + '/Comment/AddComment',
      data: {
        OrderID: that.data.OrderID,
        Star: that.data.Star,
        Content: e.detail.value.textarea,
        ShopGoodsID: that.data.ShopGoodsID,
        ArticleID: that.data.ArticleID,
        OpenID: app.globalData.UserData.OpenID,
        Attachments: JSON.stringify(that.data.FileList),
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json,application/json"
      },
      success: function (res) {
        that.setData({
          ButtonControll: true
        })
        console.log(res.data)
        if (res.data.code == 1) {
          if (that.data.BackUrl) {
            wx.redirectTo({
              url: that.data.BackUrl
            })
          }
          else {
            wx.navigateBack({
              delta: 1
            })
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'null',
            duration: 2000
          });
        }
        wx.hideNavigationBarLoading()
      },
      fail: function () {
        that.setData({
          ButtonControll: true
        })
        wx.hideNavigationBarLoading()
      }
    })

  },
  backpage: function () {
    wx.navigateBack({
      delta: 1
    })
  }
})