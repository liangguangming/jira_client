const rp = require('request-promise');

const baseUrl = process.env.WEBHOOK_URL;

const defaultOptions = {
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
  },
  uri: baseUrl,
  json: true,
};

/**
 * 发送数据到企业微信
 * @param {object} objMsg 发送的数据
 */
function sendMsg(objMsg) {
  const options = { ...defaultOptions };
  options.method = 'post';
  options.body = objMsg;
  return rp(options);
}

module.exports = {
  sendMsg,
};
