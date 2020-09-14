const rp = require('request-promise');

const baseUrl = process.env.BASE_URL;

const defaultOptions = {
  method: 'get',
  headers: {
    Authorization: `Basic ${process.env.TOKEN}`,
    'Content-Type': 'application/json',
  },
  json: true,
};

/**
 * 获取某个issue的信息
 * @param {string} issueName issue的名字
 */
function getIssue(issueName) {
  const options = { ...defaultOptions };
  options.method = 'get';
  options.uri = `${baseUrl}/rest/api/2/issue/${issueName}`;
  return rp(options);
}

/**
 * 搜索issue
 * @param {Object} paramsOptions 搜索条件
 */
function search(paramsOptions) {
  const options = { ...defaultOptions };
  options.method = 'get';
  options.uri = `${baseUrl}/rest/api/2/search`;
  options.qs = { ...paramsOptions };
  return rp(options);
}

module.exports = {
  getIssue,
  search,
};
