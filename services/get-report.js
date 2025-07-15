const {
  contentTableHeading,
  contentTableSeparator,
  path,
  readFileSync,
  userHomeDir,
  removeEmpty,
} = require('./utils');
const getTasksByDate = async (filters) => {
  try {
    if (!(filters?.from || filters?.to)) {
      filters = getFilters(filters);
    }

    let data = [];
    let startDate = new Date(filters.from);
    const itemHeading = contentTableHeading.split('|').reduce((acc, val) => {
      const item = val.trim();

      if (item && item !== '--') {
        acc.push(item);
      }

      return acc;
    }, []);

    while (startDate <= new Date(filters.to)) {
      const stringDate = startDate.toISOString().split('T')[0];
      const item = readFileSync(path.join(userHomeDir, `.${stringDate}`));

      if (item) {
        const timeEntries = removeEmpty(item.split(contentTableSeparator)[1].split('\n'));

        data = data.concat(
          timeEntries.map((entry) =>
            entry.split('|').reduce((acc, val, i) => {
              const item = val.trim();

              if (item && item !== '--') {
                acc[itemHeading[i - 1]] = item;
              }

              return acc;
            }, {}),
          ),
        );
      }

      startDate.setDate(startDate.getDate() + 1);
    }

    return data.filter((item) => item);
  } catch (error) {
    console.error(error.message);
  }
};
const getTasksBySynced = async (synced = 'false') => {
  try {
    const resp = await getTasksByDate();

    return (resp || []).filter((item) => item.synced === synced);
  } catch (error) {
    console.error(error.message);
  }
};
const getReport = async (filters) => {
  try {
    const resp = await getTasksByDate(filters);
    const adhocTasks = ['adhoc', 'internal', 'call', 'calls', 'code', 'review'];

    return (resp || []).reduce((res, { date, work, synced, duration }) => {
      res[date] = {
        synced: res[date]?.synced || 0,
        open: res[date]?.open || 0,
        task: res[date]?.task || 0,
        adhoc: res[date]?.adhoc || 0,
        total: res[date]?.total || 0,
        pending: res[date]?.pending || 480,
      };

      if (synced === 'true') {
        res[date].synced += +duration;
      } else {
        res[date].open += +duration;
      }

      if (adhocTasks.some((adhoc) => work.toLowerCase().includes(adhoc))) {
        res[date].adhoc += +duration;
      } else {
        res[date].task += +duration;
      }

      res[date].total = res[date].task + res[date].adhoc;
      res[date].pending = res[date].total - 480;

      return res;
    }, {});
  } catch (error) {
    console.error(error.message);
  }
};
const getStatus = async (values) => {
  const data = getFilters(values);

  console.table(await getReport(data));
};
const getFilters = (values) => {
  const filters = {};
  const keyMap = {
    f: 'from',
    '-f': 'from',
    from: 'from',
    t: 'to',
    to: 'to',
  };

  if (values?.length) {
    for (const item of values) {
      let [key, ...itemValues] = item.split(' ');
      const itemValue = itemValues.join(' ');

      if (key.charAt(0) === '-') {
        key = key.substring(1);
      }

      const dt = new Date(itemValue).toISOString().split('T')[0];

      if (dt) {
        filters[keyMap[key]] = dt;
      }
    }
  } else {
    filters.from = new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split('T')[0];
    filters.to = new Date().toISOString().split('T')[0];
  }

  return filters;
};

module.exports = { getReport, getStatus, getTasksByDate, getTasksBySynced };
