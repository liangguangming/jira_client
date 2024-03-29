const webhook = require('./webhook');

const baseUrl = process.env.WEBHOOK_URL;

/**
 * 发送数据到企业微信
 * @param {string} markdownContent 发送的数据
 */
function sendMsg(markdownContent) {
  const markdown = {
    msgtype: 'markdown',
    markdown: {
      content: markdownContent,
    },
  };

  return webhook.sendMsg(markdown, baseUrl);
}

module.exports = {
  sendMsg,
};
