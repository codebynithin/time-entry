const { checkConfig } = require('./init-config');
const { removeEmpty } = require('./utils');
const { getStatus, getTasksByDate } = require('./get-report');
const { logTaskHoursAndSync } = require('./log-task-hours-and-sync');
const { addNewTask } = require('./add-task');
const { updateTask, deleteTask } = require('./update-delete-task');
const { getGitlabActivities } = require('./get-gitlab-activities');
const { getZohoTasks } = require('./get-zoho-tasks');
const axios = require('axios');
const { ACTIONS } = require('./enums/actions.enum');
const processArgs = async (type, value) => {
  try {
    await checkConfig();

    const values = value ? removeEmpty(value?.split(' -')) : value;

    switch (type) {
      case ACTIONS.ADD: {
        await addNewTask(values);

        break;
      }

      case ACTIONS.UPDATE: {
        await updateTask(values);

        break;
      }

      case ACTIONS.DELETE: {
        console.log(await deleteTask(values));

        break;
      }

      case ACTIONS.STATUS: {
        await getStatus(values);

        break;
      }

      case ACTIONS.ENTRIES: {
        console.table(await getTasksByDate(values));

        break;
      }

      case ACTIONS.ZOHO: {
        console.log('Final status: ', await logTaskHoursAndSync());

        break;
      }

      case ACTIONS.GITLAB: {
        await getGitlabActivities(values);

        break;
      }

      case ACTIONS.MERGE: {
        const tasks = await getZohoTasks({ params: { type: ['2'] } });
        const taskIds = tasks
          .filter((task) => task.gitlab_iid)
          .map((task) => ({ taskId: task.taskId, gitlabIid: task.gitlab_iid }));

        if (!taskIds.length) {
          console.log('No active tasks with GitLab IIDs found');
          break;
        }

        const mergeRequests = await Promise.all(
          taskIds.map(async ({ taskId, gitlabIid }) => {
            try {
              const response = await axios.get(
                `${process.env.GITLAB_API_URL}/projects/${process.env.GITLAB_PROJECT_ID}/merge_requests/${gitlabIid}`,
                {
                  headers: {
                    'PRIVATE-TOKEN': process.env.GITLAB_TOKEN,
                  },
                },
              );
              return {
                taskId,
                gitlabIid,
                status: response.data.state,
                assignee: response.data.assignee?.name || 'Unassigned',
                title: response.data.title,
                webUrl: response.data.web_url,
              };
            } catch (error) {
              return {
                taskId,
                gitlabIid,
                status: 'error',
                error: error.response?.status === 404 ? 'MR not found' : 'Failed to fetch MR',
              };
            }
          }),
        );

        console.table(
          mergeRequests.map((mr) => ({
            'Task ID': mr.taskId,
            'MR IID': mr.gitlabIid,
            Status: mr.status,
            Assignee: mr.assignee || '-',
            Title: mr.title || '-',
            URL: mr.webUrl || '-',
            Error: mr.error || '-',
          })),
        );

        break;
      }

      case ACTIONS.VERSION: {
        const path = require('path');
        const packageJson = require(path.resolve(__dirname, '../package.json'));
        const packageVersion = packageJson.version;

        console.log('Package version:', packageVersion);

        break;
      }

      case ACTIONS.HELP: {
        console.log(`usage: timectl \t[version] [help] [init] [switch]
        \t[add] [update] [delete] [status] [entries] [zoho]\n`);
        console.log(`Below are common Time Entry commands utilized in various scenarios:\n
Start a time entry:
  init \t\t: Initialize and input necessary information.
  switch \t: Switch between the default projects.

Work on the Current Change:
  add \t\t: Add your time details.
  update \t: Update existing time details.
  delete \t: Remove existing time details.

Examine the History:
  entries \t: View each time entry's details by date.
  status \t: View daily status of time entries.
  zoho \t\t: Update time entries remotely.

Running 'timectl help' will list available subcommands and provide some conceptual guides.`);
        break;
      }

      default: {
        console.error(`timectl: '${type}' is not a timectl command. See 'timectl help'.`);

        return;
      }
    }
  } catch (error) {
    console.log(error);
  }

  process.exit(1);
};

module.exports = { processArgs };
