function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function contains(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] == obj) {
      return true;
    }
  }
  return false;
}

function ChangeDateFormat(cellval) {

  var date = new Date(parseInt(cellval.replace("/Date(", "").replace(")/", ""), 10));

  var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;

  var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

  return date.getFullYear() + "-" + month + "-" + currentDate;

}

function formatStringToDate(value) {
  try {
    if (value == "") {
      return "";
    }
    var date = new Date(value);
    return date.Format('yyyy-MM-dd')
  } catch (ex) {
    return "";
  }
}
function formatStringToDateTime(value) {
  try {
    if (value == "") {
      return "";
    }
    var date = new Date(value);
    return date.Format('yyyy-MM-dd hh:mm')
  } catch (ex) {
    return "";
  }
}

function formatNumToDate(value) {
  try {
    var date = new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
    return date.Format('yyyy-MM-dd')
  } catch (ex) {
    return "";
  }
}
function formatNumToDateTime(value) {
  try {
    var date = new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
    return date.Format('yyyy-MM-dd hh:mm')
  } catch (ex) {
    return "";
  }
}
function formatNumToDateTimeOther(value) {
  try {
    var date = new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
    return date.Format('yyyy/MM/dd hh:mm')
  } catch (ex) {
    return "";
  }
}

Date.prototype.Format = function (fmt) { //author: meizz 
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
//是否是手机号码
function IsPhone(tel) {
  var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
  if (reg.test(tel)) {
    return true;
  } else {
    return false;
  };
}
function IsMail(str) {
  var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/i;
  if (reg.test(str)) {
    return true;
  } else {
    return false;
  };
}


function accSub(arg1, arg2) {
  var r1, r2, m, n;
  try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
  m = Math.pow(10, Math.max(r1, r2));
  n = (r1 >= r2) ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
} 
//BD-09（百度地图）转 GCJ-02(火星)
function BdmapEncryptToMapabc(bd_lat, bd_lon) {
  var point = new Object();
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var x = new Number(bd_lon - 0.0065);
  var y = new Number(bd_lat - 0.006);
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  var Mars_lon = z * Math.cos(theta);
  var Mars_lat = z * Math.sin(theta);
  point.lng = Mars_lon;
  point.lat = Mars_lat;
  return point;
}

module.exports = {
  formatTime: formatTime,
  formatNumToDate: formatNumToDate,
  formatNumToDateTime: formatNumToDateTime,
  formatStringToDate: formatStringToDate,
  IsPhone: IsPhone,
  contains: contains,
  IsMail: IsMail,
  accSub: accSub,
  BdmapEncryptToMapabc:BdmapEncryptToMapabc,
  formatStringToDateTime: formatStringToDateTime,
  formatNumToDateTimeOther:formatNumToDateTimeOther
}
