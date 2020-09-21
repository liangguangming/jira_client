# nradio_cloud_jira_client
获取每天jira的worklog
## RANGE 获取worklog的范围
- d 天
- w 周
- M 月
## TOKEN
JIRA的登录token的base64值
## 搜索条件
```sh
# 扩展搜索条件
SEARCH_EXTENDJQL=
# 搜索包含的fields
SEARCH_FIELDS=project,issuetype,resolution,summary,priority,status,parent,issuelinks,worklog,customfield_10008,customfield_10009,issue,customfield_10014,customfield_10030
```
