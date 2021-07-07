/*
* 来客有礼小程序
搬运不知名大佬的脚本
* cron 45 4 * * *
* */
const $ = new Env('送豆得豆');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [];
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  });
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
  $.isLoginInfo = {};
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  $.activityId = '';
  $.completeNumbers = '';
  console.log(`开始获取活动信息`);
  for (let i = 0; i < cookiesArr.length && $.activityId === '' && i < 3; i++) {
    $.cookie = cookiesArr[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1]);
    $.isLogin = true;
    $.nickName = $.UserName;
    await TotalBean();
    $.isLoginInfo[$.UserName] = $.isLogin;
    if (!$.isLogin) {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue;
    }
    await getActivityInfo();
  }
  if($.activityId === ''){
    console.log(`获取活动ID失败`);
    return ;
  }
  let openCount = Math.floor((Number(cookiesArr.length)-1)/Number($.completeNumbers));
  console.log(`\n共有${cookiesArr.length}个账号，前${openCount}个账号可以开团\n`);
  $.openTuanList = [];
  console.log(`前${openCount}个账号开始开团\n`);
  for (let i = 0; i < cookiesArr.length && i < openCount; i++) {
    $.cookie = cookiesArr[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1]);
    $.index = i + 1;
    $.isLogin = true;
    $.nickName = $.UserName;
    if(!$.isLoginInfo[$.UserName]){
      await TotalBean();
      console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
      $.isLoginInfo[$.UserName] = $.isLogin;
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue;
      }
    }else {
      console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    }
    await openTuan();
  }
  console.log('\n开团信息\n'+JSON.stringify($.openTuanList));
  console.log(`\n开始互助\n`);
  let ckList = getRandomArrayElements(cookiesArr,cookiesArr.length);
  for (let i = 0; i < ckList.length && $.openTuanList.length > 0; i++) {
    $.cookie = ckList[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1])
    $.index = i + 1;
    $.isLogin = true;
    if(!$.isLoginInfo[$.UserName]){
      await TotalBean();
      $.isLoginInfo[$.UserName] = $.isLogin;
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue;
      }
    }
    await helpMain();
  }
  console.log(`\n开始领取奖励\n`);
  for (let i = 0; i < cookiesArr.length && i < openCount && $.openTuanList.length > 0; i++) {
    $.cookie = cookiesArr[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1])
    $.index = i + 1;
    $.isLogin = true;
    if(!$.isLoginInfo[$.UserName]){
      await TotalBean();
      $.isLoginInfo[$.UserName] = $.isLogin;
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue;
      }
    }
    console.log(`\n*****开始【京东账号${$.index}】${$.UserName}*****\n`);
    await rewardMain();
  }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();});

async function getActivityInfo(){
  $.activityList = [];
  await getActivityList();
  if($.activityList.length === 0){
    return ;
  }
  for (let i = 0; i < $.activityList.length; i++) {
    if($.activityList[i].status !== 'NOT_BEGIN'){
      $.activityId = $.activityList[i].activeId;
      break;
    }
  }
  await $.wait(3000);
  $.detail = {};
  await getActivityDetail();
  if(JSON.stringify($.detail) === '{}'){
    console.log(`获取活动详情失败`);
    return;
  }else{
    console.log(`获取活动详情成功`);
  }
  $.completeNumbers = $.detail.activityInfo.completeNumbers;
  console.log(`获取到的活动ID：${$.activityId},需要邀请${$.completeNumbers}人瓜分`);
}

async function getActivityList(){
  return new Promise((resolve) => {
    let options = {
      "url": `https://sendbeans.jd.com/common/api/bean/activity/get/entry/list/by/channel?channelId=14&channelType=H5&sendType=0&singleActivity=false&invokeKey=NRp8OPxZMFXmGkaE`,
      "headers": {
        "Host": "sendbeans.jd.com",
        "Origin": "https://sendbeans.jd.com",
        "Cookie": $.cookie,
        "Connection": "keep-alive",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://sendbeans.jd.com/dist/index.html?lng=120.273690&lat=31.525514&sid=c212f63c30c4bc6abfcc7889495d2acw&un_area=12_984_3382_0",
        "Accept-Encoding": "gzip, deflate, br",
        "openId": ""
      }
    };
    $.get(options, (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if(data.success){
          $.activityList = data.data.items;
        }else{
          console.log(JSON.stringify(data));
        }
      } catch (e) {
        console.log(e);
      } finally {
        resolve(data);
      }
    })
  });
}


async function openTuan(){
  $.detail = {};
  $.rewardRecordId = '';
  await getActivityDetail();
  if(JSON.stringify($.detail) === '{}'){
    console.log(`获取活动详情失败`);
    return;
  }else{
    $.rewardRecordId = $.detail.rewardRecordId;
    console.log(`获取活动详情成功`);
  }
  await $.wait(3000);
  if(!$.rewardRecordId){
    if(!$.detail.invited){
      await invite();
      await $.wait(1000);
      await getActivityDetail();
      await $.wait(3000);
      $.rewardRecordId = $.detail.rewardRecordId;
      console.log(`【京东账号${$.index}】${$.UserName} 瓜分ID:${$.rewardRecordId}`);
    }
  }else{
    console.log(`【京东账号${$.index}】${$.UserName} 瓜分ID:${$.rewardRecordId}`);
  }
  $.openTuanList.push({
    'user':$.UserName,
    'rewardRecordId':$.rewardRecordId,
    'completed':$.detail.completed,
    'rewardOk':$.detail.rewardOk
  });
}

async function helpMain(){
  $.canHelp = true;
  for (let j = 0; j < $.openTuanList.length && $.canHelp; j++) {
    $.oneTuanInfo =  $.openTuanList[j];
    if( $.UserName === $.oneTuanInfo['user']){
      continue;
    }
    if( $.oneTuanInfo['completed']){
      continue;
    }
    console.log(`${$.UserName}去助力${$.oneTuanInfo['user']}`);
    $.detail = {};
    $.rewardRecordId = '';
    await getActivityDetail();
    if(JSON.stringify($.detail) === '{}'){
      console.log(`获取活动详情失败`);
      return;
    }else{
      $.rewardRecordId = $.detail.rewardRecordId;
      console.log(`获取活动详情成功`);
    }
    await $.wait(3000);
    await help();
    await $.wait(2000);
  }
}

async function rewardMain(){
  $.detail = {};
  $.rewardRecordId = '';
  await getActivityDetail();
  if(JSON.stringify($.detail) === '{}'){
    console.log(`获取活动详情失败`);
    return;
  }else{
    $.rewardRecordId = $.detail.rewardRecordId;
    console.log(`获取活动详情成功`);
  }
  await $.wait(3000);
  if($.rewardRecordId && $.detail.completed && !$.detail.rewardOk){
    await rewardBean();
    await $.wait(2000);
  }else if($.rewardRecordId && $.detail.completed && $.detail.rewardOk){
    console.log(`奖励已领取`);
  }else{
    console.log(`未满足条件，不可领取奖励`);
  }
}
async function rewardBean(){
  return new Promise((resolve) => {
    let options = {
      "url": `https://draw.jdfcloud.com/common/api/bean/activity/sendBean?rewardRecordId=${$.rewardRecordId}&jdChannelId=&userSource=mp&appId=wxccb5c536b0ecd1bf&invokeKey=NRp8OPxZMFXmGkaE`,
      "headers":  {
        'content-type' : `application/json`,
        'Connection' : `keep-alive`,
        'Accept-Encoding' : `gzip,compress,br,deflate`,
        'App-Id' : `wxccb5c536b0ecd1bf`,
        'Lottery-Access-Signature' : `wxccb5c536b0ecd1bf1537237540544h79HlfU`,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'openId' : `oPcgJ4_X7uCMeTgGmar-rmiWst1Y`,
        'Host' : `draw.jdfcloud.com`,
        'Referer' : `https://servicewechat.com/wxccb5c536b0ecd1bf/733/page-frame.html`,
        'cookie' : $.cookie,
      }
    };
    $.get(options, (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if(data.success){
          console.log(`领取豆子奖励成功`);
        }else{
          console.log(JSON.stringify(data));
        }
      } catch (e) {
        console.log(e);
      } finally {
        resolve(data);
      }
    })
  });
}

function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

async function help() {
  await new Promise((resolve) => {
    let options = {
      "url": `https://draw.jdfcloud.com/common/api/bean/activity/participate?activityId=${$.activityId}&inviteUserPin=${encodeURIComponent($.oneTuanInfo['user'])}&invokeKey=NRp8OPxZMFXmGkaE&timestap=${Date.now()}`,
      "headers":  {
        'content-type' : `application/json`,
        'Connection' : `keep-alive`,
        'Accept-Encoding' : `gzip,compress,br,deflate`,
        'App-Id' : `wxccb5c536b0ecd1bf`,
        'Lottery-Access-Signature' : `wxccb5c536b0ecd1bf1537237540544h79HlfU`,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'openId' : `oPcgJ4_X7uCMeTgGmar-rmiWst1Y`,
        'Host' : `draw.jdfcloud.com`,
        'Referer' : `https://servicewechat.com/wxccb5c536b0ecd1bf/733/page-frame.html`,
        'cookie' : $.cookie,
      }
    };
    $.post(options, (err, resp, res) => {
      try {
        if (res) {
          res = JSON.parse(res);
          if(res.data.result === 5){
            $.oneTuanInfo['completed'] = true;
          }else if(res.data.result === 0 || res.data.result === 1){
            $.canHelp = false;
          }
          console.log(JSON.stringify(res));
        }
      } catch (e) {
        console.log(e);
      } finally {
        resolve(res);
      }
    })
  });
}

async function invite() {
  const url = `https://draw.jdfcloud.com/common/api/bean/activity/invite?openId=oPcgJ4_X7uCMeTgGmar-rmiWst1Y&activityId=${$.activityId}&userSource=mp&formId=123&jdChannelId=&fp=&appId=wxccb5c536b0ecd1bf&invokeKey=NRp8OPxZMFXmGkaE`;
  const method = `POST`;
  const headers = {
    'content-type' : `application/json`,
    'Connection' : `keep-alive`,
    'Accept-Encoding' : `gzip,compress,br,deflate`,
    'App-Id' : `wxccb5c536b0ecd1bf`,
    'Lottery-Access-Signature' : `wxccb5c536b0ecd1bf1537237540544h79HlfU`,
    "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    'openId' : `oPcgJ4_X7uCMeTgGmar-rmiWst1Y`,
    'Host' : `draw.jdfcloud.com`,
    'Referer' : `https://servicewechat.com/wxccb5c536b0ecd1bf/733/page-frame.html`,
    'cookie' : $.cookie,
  };
  const body = `{}`;
  const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body
  };
  return new Promise(async resolve => {
    $.post(myRequest, (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if(data.success){
          console.log(`发起瓜分成功`);
        }else{
          console.log(JSON.stringify(data));
        }
      } catch (e) {
        console.log(data);
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}


async function getActivityDetail() {
  const url = `https://draw.jdfcloud.com/common/api/bean/activity/detail?activityId=${$.activityId}&userOpenId=oPcgJ4_X7uCMeTgGmar-rmiWst1Y&timestap=${Date.now()}&userSource=mp&jdChannelId=&appId=wxccb5c536b0ecd1bf&invokeKey=NRp8OPxZMFXmGkaE`;
  const method = `GET`;
  const headers = {
    'cookie' : $.cookie,
    'openId' : `oPcgJ4_X7uCMeTgGmar-rmiWst1Y`,
    'Connection' : `keep-alive`,
    'App-Id' : `wxccb5c536b0ecd1bf`,
    'content-type' : `application/json`,
    'Host' : `draw.jdfcloud.com`,
    'Accept-Encoding' : `gzip,compress,br,deflate`,
    "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    'Lottery-Access-Signature' : `wxccb5c536b0ecd1bf1537237540544h79HlfU`,
    'Referer' : `https://servicewechat.com/wxccb5c536b0ecd1bf/733/page-frame.html`,
  };
  const myRequest = {url: url, method: method, headers: headers};
  return new Promise(async resolve => {
    $.get(myRequest, (err, resp, data) => {
      try {
        //console.log(data);
        data = JSON.parse(data);
        if(data.success){
          $.detail = data.data;
        }
      } catch (e) {
        //console.log(data);
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: $.cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
