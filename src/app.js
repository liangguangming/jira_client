const moment = require('moment');
const cron = require('cron');

const jiraClient = require('./jiraClient');
const wechat = require('./wechat');
const dingding = require('./dingding');

const TIME_RANGE = process.env.RANGE;
const RANGE_NUM = Number(process.env.RANGE_NUM || 0);

function setColor(str, level) {
  let tmpStr = '';
  switch (level) {
    case 'info':
    case 'comment':
    case 'warn':
      tmpStr = `<font color="${level}">${str}</font>`;
      break;
    default:
      tmpStr = `<font color="comment">${str}</font>`;
  }

  return tmpStr;
}

function launch() {
  const baseTime = moment().format('YYYY-MM-DD');
  const searchOptions = {
    maxResults: 1000,
    jql: `worklogDate >= ${moment(baseTime).subtract(RANGE_NUM, TIME_RANGE).format('YYYY-MM-DD')} and worklogDate < ${moment().add(1, 'd').format('YYYY-MM-DD')}`,
    startAt: 0,
    fields: 'project,issuetype,resolution,summary,priority,status,parent,issuelinks,worklog,customfield_10008,customfield_10009,issue,customfield_10014,customfield_10030',
  };

  jiraClient.search(searchOptions).then((res) => {
    const { issues } = res;
    let str = `# ${moment().format('YYYY-MM-DD')} worklog\n`;
    let issueNum = 1;
    issues.forEach((issue) => {
      const { worklogs } = issue.fields.worklog;
      const { summary } = issue.fields;
      const { key } = issue;
      let totalWorklog = 0;
      let subWorklog = '';
      worklogs.forEach((worklog) => {
        // eslint-disable-next-line max-len
        const isAfter = moment(worklog.started).isAfter(moment(baseTime).subtract(RANGE_NUM, TIME_RANGE));
        if (isAfter) {
          totalWorklog += worklog.timeSpentSeconds;
          subWorklog += `- ${worklog.author.displayName} ${worklog.comment || ''}  ${setColor(worklog.timeSpent)}\n`;
        }
      });
      str += `${issueNum}. [${key}](https://nradio.atlassian.net/browse/${key})  **${summary}**  ${setColor(`${totalWorklog / 3600}h`)}\n`;
      str += subWorklog;
      issueNum += 1;
    });

    // 不能超过4096个字节
    wechat.sendMsg(str);
    dingding.sendMsg(str);
  });
}

const { CronJob } = cron;
const job = new CronJob(process.env.CRON || '00 00 21 * * *', (() => {
  launch();
}), null, true, 'Asia/Hong_Kong');
job.start();
