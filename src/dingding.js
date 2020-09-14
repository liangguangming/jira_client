const moment = require('moment');
const webhook = require('./webhook');

const baseUrl = process.env.WEBHOOK_DINGDING;

/**
 * 发送数据到钉钉
 * @param {string} markdownContent 发送的数据
 */
function sendMsg(markdownContent) {
  const markdown = {
    msgtype: 'markdown',
    markdown: {
      title: `${moment().format('YYYY-MM-DD')}日 worklog`,
      text: markdownContent,
    },
  };

  return webhook.sendMsg(markdown, baseUrl);
}

module.exports = {
  sendMsg,
};
