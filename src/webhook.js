const rp = require('request-promise');

const defaultOptions = {
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
  },
  uri: '',
  json: true,
};

/**
 * 发送数据到webhook
 * @param {object} objMsg 发送的数据
 * @param {string} url webhook_url
 */
function sendMsg(objMsg, url) {
  const options = { ...defaultOptions };
  options.method = 'post';
  options.body = objMsg;
  options.uri = url;

  return rp(options);
}

module.exports = {
  sendMsg,
};
