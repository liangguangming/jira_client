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

function setLink(key, str) {
  return `[${str || key}](https://nradio.atlassian.net/browse/${key})`;
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
    const issueMap = new Map();
    issues.forEach((issue) => {
      const { worklogs } = issue.fields.worklog;
      const { summary } = issue.fields;
      let { key } = issue;
      const issueKey = key;
      if (!issue.fields.issuetype.subtask) {
        if (!issueMap.has(key)) {
          const initObj = {
            issueSummary: summary,
            totalWorklog: 0,
            worklogs: [],
          };
          issueMap.set(key, initObj);
        }
      }
      if (issue.fields.parent) {
        key = issue.fields.parent.key;
        if (!issueMap.has(key)) {
          const initObj = {
            issueSummary: issue.fields.parent.fields.summary,
            totalWorklog: 0,
            worklogs: [],
          };
          issueMap.set(key, initObj);
        }
      }
      const issueInfo = issueMap.get(key);
      worklogs.forEach((worklog) => {
        // eslint-disable-next-line max-len
        const isAfter = moment(worklog.started).isAfter(moment(baseTime).subtract(RANGE_NUM, TIME_RANGE));
        if (isAfter) {
          const worklogInfo = {
            author: worklog.author.displayName,
            key: issueKey,
            summary,
            comment: worklog.comment,
            timeSpentSeconds: worklog.timeSpentSeconds,
            timeSpent: worklog.timeSpent,
          };
          issueInfo.worklogs.push(worklogInfo);
        }
      });
    });
    issueMap.forEach((issueData, key) => {
      let subWorklog = '';
      const tmpIssue = { ...issueData };
      const { worklogs } = tmpIssue;
      worklogs.forEach((worklog) => {
        const isSubtask = worklog.key !== key;
        tmpIssue.totalWorklog += worklog.timeSpentSeconds;
        subWorklog += `- ${isSubtask ? `${setLink(key)} /` : ''} ${setLink(worklog.key)} ${setLink(key, worklog.summary)} ${worklog.author} ${worklog.comment || ''}  ${setColor(worklog.timeSpent)}\n`;
      });
      str += `${issueNum}. ${setLink(key)}  **${tmpIssue.issueSummary}**  ${setColor(`${tmpIssue.totalWorklog / 3600}h`)}\n`;
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
