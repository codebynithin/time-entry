const axios = require('axios');
const { getHeaders, getSprints, userId, userConfig } = require('./utils');
const getZohoTasks = async ({ params }) => {
  const headers = await getHeaders();
  let activeSprint;

  if (!params?.sprint) {
    if (params?.type) {
      if (typeof params.type === 'string') {
        params.type = params.type.split(',');
      }
    } else {
      params.type = ['2'];
    }

    activeSprint = await getSprints({ params });

    params.sprint = activeSprint?.[0]?.value;
  } else {
    const isValidSprint = await checkSprintId(params.sprint, { headers, params });

    if (!isValidSprint) {
      console.error('Invalid sprint ID');
    }
  }

  if (activeSprint?.length > 1) {
    const resp = [];

    for (const sprint of activeSprint) {
      params.sprint = sprint.value;

      const tasks = await getTasksBySprint({ params, headers });

      resp.push(...(tasks || []));
    }

    return resp;
  } else {
    return getTasksBySprint({ params, headers });
  }
};
const getTasksBySprint = async ({ params, headers }) => {
  const { zoho } = await userConfig();
  const p = {
    action: 'data',
    index: params.index || 1,
    range: params.range || 300,
    sprint: params.sprint || null,
    project: params.project || '139011000000148327',
    subitem: params.subitem || false,
    team: '803166918',
  };
  const parentUrl = `https://${zoho.url}/zsapi/team/${p.team}/projects/${p.project}/sprints/${p.sprint}/item/?action=${p.action}&range=${p.range}&index=${p.index}&subitem=${p.subitem}&customviewid=${zoho.customviewid}`;

  try {
    const response = await axios.get(parentUrl, { headers });

    return Object.entries(response.data.itemJObj).reduce((acc, [key, values]) => {
      if (params.filterUser) {
        for (const value of values) {
          if (typeof value === 'object' && value.length && value.includes(userId)) {
            acc.push({ value: key, label: values[0], taskId: values[1] });
          }
        }
      } else {
        acc.push({ value: key, label: values[0], taskId: values[1] });
      }

      return acc.sort((a, b) => a.taskId - b.taskId);
    }, []);
  } catch (error) {
    console.error(error.message);
  }
};
const checkSprintId = async (id, req) => {
  const sprints = await getSprints(req);

  return sprints.some(({ value }) => value === id);
};

module.exports = { getZohoTasks };
