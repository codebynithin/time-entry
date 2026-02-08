const axios = require('axios');
const FormData = require('form-data');
const { format, addMinutes, startOfDay } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const { getTasksBySynced } = require('./get-report');
const { getZohoTasks } = require('./get-zoho-tasks');
const { updateTaskStatus } = require('./update-delete-task');
const { getHeaders, getSprints, userConfig } = require('./utils');
const logTaskHoursAndSync = async () => {
  const [tasks, config] = await Promise.all([getTasksBySynced(), userConfig()]);
  const response = {
    success: 0,
    failed: 0,
    total: tasks.length,
    pending: tasks.length,
    erroredTasks: [],
    successTasks: [],
  };

  for (const task of tasks) {
    let status = 'failed';
    const project = config.zoho.projects[task.project]?.value;
    const activeSprint = await getSprints({ params: { type: '2', project } });
    const sprint = activeSprint.find(
      ({ label }) => label.toLowerCase() === task.sprint.toLowerCase(),
    )?.value;
    const zohoTasks = await getZohoTasks({ params: { project, sprint, subitem: true } });
    const headers = await getHeaders();
    const zohoTask = zohoTasks.find(({ taskId }) => taskId === task.task);
    const newData = new FormData();
    const taskDate = new Date(task.date);
    const duration = format(addMinutes(startOfDay(new Date()), task.duration), 'HH:mm');

    if (!zohoTask) {
      response.failed++;
      response.erroredTasks.push(task.task);
      console.log('No tasks found', task.task);

      continue;
    }

    taskDate.setHours(0, 0, 0, 0);

    const zonedDate = utcToZonedTime(taskDate, 'Asia/Kolkata');
    const date = format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
    const parentUrl = `https://${config.zoho.url}/zsapi/team/803166918/projects/${project}/sprints/${activeSprint?.[0]?.value}/item/${zohoTask?.value}/timesheet/?action=additemlog`;

    newData.append('users', config.zoho.userId);
    newData.append('duration', duration);
    newData.append('isbillable', 1);
    newData.append('date', date);
    newData.append('notes', task.remarks ? `<div>${task.remarks}</div>` : '');

    try {
      const item = await axios.post(parentUrl, newData, { headers });

      if (item.data.status === 'success') {
        status = 'success';

        response.success++;
        response.successTasks.push(task.task);
        await updateTaskStatus(task.id, task.date);
      } else {
        response.failed++;
        response.erroredTasks.push(task.task);
      }
    } catch (error) {
      response.failed++;
      response.erroredTasks.push(task.task);
      console.log(error.message);
    }

    response.pending--;
    console.log(`Task ${task.task} is ${status}`);
  }

  return response;
};

module.exports = { logTaskHoursAndSync };
