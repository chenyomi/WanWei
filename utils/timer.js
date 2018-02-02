var day, hr, min, sec, second,t;
/* 毫秒级倒计时 */
function countdown(that, total_micro_second) {
  // 渲染倒计时时钟
  dateformat(total_micro_second)
  that.setData({
    second: second,
    day: day,
    hr: hr,
    min: min,
    sec: sec
  });
  
  if (total_micro_second <= 0) {
    
    return;
  }
  t = setTimeout(function () {
    // 放在最后--
    total_micro_second -= 1000;
    countdown(that, total_micro_second);
  }
    ,1000)
}
function clear(){
  clearTimeout(t)
}
//获取时间差
function countDifferent(that, total_micro_second) {
  // 渲染倒计时时钟
  dateformat(total_micro_second)
  that.setData({
    day: day,
    hr: hr,
    min: min,
    sec: sec
  });
}


function dateformat(micro_second) {
 
  // 秒总数
  second = Math.floor(micro_second / 1000);
  // 天数
  day = Math.floor(second / (24 * 3600));
  // 小时位
  hr = Math.floor((second - day * 24 * 3600) / 3600);
  // 分钟位
  min = Math.floor((second - day * 24 * 3600 - hr * 3600) / 60);
  // 秒位
  sec = (second - day * 24 * 3600 - hr * 3600 - min * 60);
  // 毫秒位，保留2位
}


module.exports = {
  countdown: countdown,
  countDifferent: countDifferent,
  clear: clear
}
