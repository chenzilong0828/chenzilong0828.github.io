import request from './request';
import md5 from 'md5';

// 从localStorage获取appKey和appSecret
const getAppKey = () => localStorage.getItem('appKey');
const getAppSecret = () => localStorage.getItem('appSecret');

// 生成签名
export const generateSign = (timestamp) => {
  const appKey = getAppKey();
  const appSecret = getAppSecret();
  const temp = `${appKey}${timestamp}${appSecret}`;
  return md5(temp);
};

export const getAccessToken = async () => {
  const timestamp = Date.now();
  const sign = generateSign(timestamp);
  const appKey = getAppKey();

  return request.get(`/intelligent-device-manage/openapi/getAccessToken/${appKey}`, {
    params: {
      timestamp,
      sign
    }
  });
};

// 设备状态上报
export function deviceStatusReport(data) {
  return request({
    url: '/intelligent-device-manage/openapi/deviceStatusReport',
    method: 'post',
    headers: {
      'token': localStorage.getItem('accessToken') || '' // 从 localStorage 获取 token
    },
    data: [data]
  });
}

// 设备位置上报
export function deviceLocationReport(data) {
  return request({
    url: '/intelligent-device-manage/openapi/deviceLocationReport',
    method: 'post',
    headers: {
      'token': localStorage.getItem('accessToken') || ''
    },
    data: data  // 直接发送对象，不要包装成数组
  });
}

// 设备事件上报
export function deviceEventReport(data) {
  return request({
    url: '/intelligent-device-manage/openapi/deviceEventReport',
    method: 'post',
    headers: {
      'token': localStorage.getItem('accessToken') || ''
    },
    data
  })
}

// 添加设备任务上报接口
export function deviceTaskReport(data) {
  return request({
    url: '/intelligent-device-manage/openapi/deviceTaskReport',
    method: 'post',
    headers: {
      'token': localStorage.getItem('accessToken') || ''
    },
    data
  })
}

// MQTT消息发送
export function mqttSendMsg(data) {
  return request({
    url: '/intelligent-device-mock/mock/mqtt/sendMsg',
    method: 'post',
    headers: {
      'sessionId': localStorage.getItem('sessionId') || ''
    },
    data
  });
}

// TCP消息数据获取
export function getTcpMsgData(data) {
  return request({
    url: '/intelligent-device-mock/mock/tcp/getMsgData',
    method: 'post',
    headers: {
      'sessionId': localStorage.getItem('sessionId') || ''
    },
    data
  });
}

// TCP消息发送
export function tcpSendMsg(data) {
  return request({
    url: '/intelligent-device-mock/mock/tcp/sendMsg',
    method: 'post',
    headers: {
      'sessionId': localStorage.getItem('sessionId') || ''
    },
    data
  });
}

// 获取字典数据列表
export function getDictDataList(dictType) {
  return request({
    url: '/intelligent-device-manage/openapi/getDictDataList',
    method: 'get',
    params: {
      dictType
    }
  });
} 