const axios = require('axios');
const { handleError } = require('./error');
const os = require('os');
const path = require('path');
const readline = require('readline');
const fs = require('fs');

const userHomeDir = `${os.homedir()}/.time-entry`;
const filePath = path.join(userHomeDir, '.zoho-config');
const keyMap = {
  p: 'project',
  project: 'project',
  s: 'sprint',
  sprint: 'sprint',
  t: 'task',
  task: 'task',
  dt: 'date',
  date: 'date',
  w: 'work',
  work: 'work',
  du: 'duration',
  duration: 'duration',
  r: 'remarks',
  remarks: 'remarks',
  id: 'id',
  i: 'id',
};
const contentTableHeading =
  '| id | project | sprint | date | task | work | duration | remarks | synced |';
const contentTableSeparator = '| -- | -- | -- | -- | -- | -- | -- | -- | -- |';

const accessFileSync = (path) => {
  try {
    fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);

    return true;
  } catch {
    return false;
  }
};
const appendFileSync = (path, data) => {
  try {
    fs.appendFileSync(path, data);
  } catch (error) {
    console.log(error);
  }
};
const convertToTaskData = async (values) => {
  const [{ project }, sprints] = await Promise.all([
    userConfig(),
    getSprints({ params: { type: '2' } }),
  ]);
  const data = values.reduce((acc, item) => {
    let [key, ...itemValues] = item.split(' ');
    let itemValue = itemValues.join(' ');

    if (key.charAt(0) === '-') {
      key = key.substring(1);
    }

    switch (key) {
      case 's':
      case 'sprint': {
        if (!itemValue.includes('sprint')) {
          itemValue = `sprint ${itemValue}`;
        }

        acc[keyMap[key]] = itemValue;

        break;
      }

      case 'dt':
      case 'date': {
        acc[keyMap[key]] = new Date(itemValue).toISOString().split('T')[0];

        break;
      }

      case 'du':
      case 'duration': {
        acc[keyMap[key]] = +itemValue;

        break;
      }

      default: {
        acc[keyMap[key]] = itemValue;

        break;
      }
    }

    return acc;
  }, {});

  if (!data.project) {
    data.project = project.default.label;
  }

  if (!data.sprint) {
    if (sprints.length > 1) {
      await new Promise((resolve) => {
        console.log('Multiple active sprints are available, select your task sprint.');
        for (const [index, project] of Object.entries(sprints)) {
          console.log(`${+index + 1}. ${project.label}`);
        }

        rl.question('Enter the sprint index: ', (userInput) => {
          data.sprint = sprints[+userInput - 1].label;

          rl.close();
          resolve(data.sprint);
        });
      });
    } else {
      data.sprint = sprints[0].label;
    }
  }

  return data;
};
const existsSync = (path) => {
  return fs.existsSync(path);
};
const getGitLabAuth = async (config) => {
  if (!config) {
    config = await userConfig();
  }

  return config.gitlab;
};
const getHeaders = async (config) => {
  if (!config) {
    config = await userConfig();
  }

  return {
    authority: config.zoho.url,
    accept: '*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,ml;q=0.7',
    'cache-control': 'no-cache',
    cookie: config.zoho.cookie,
    pragma: 'no-cache',
    referer: `https://${config.zoho.url}/workspace/4medica/client/wmoku`,
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest',
    'x-za-clientportalid': config.zoho.portalId,
    'x-za-reqsize': 'large',
    'x-za-sessionid': config.zoho.sessionId,
    'x-za-source': config.zoho.source,
    'x-za-ui-version': 'v2',
    'x-zcsrf-token': config.zoho.token,
  };
};
const getProjects = async (userConfig) => {
  const headers = await getHeaders(userConfig);
  const p = {
    action: 'recentprojects',
    team: '803166918',
  };
  const parentUrl = `https://${userConfig.zoho.url}/zsapi/team/${p.team}/projects/?action=${p.action}`;

  try {
    const response = await axios.get(parentUrl, { headers });

    return Object.entries(response.data.projectJObj)
      .map(([key, value]) => ({ value: key, label: value[0] }))
      .sort((a, b) => (a.label < b.label ? 1 : a.label > b.label ? -1 : 0));
  } catch (error) {
    handleError(error);
  }
};
const getSprints = async ({ params }) => {
  const config = await userConfig();
  const headers = await getHeaders();
  const p = {
    index: params.index || 1,
    range: params.range || 150,
    project: params.project || config.project.default.value,
    action: 'data',
    team: '803166918',
  };

  if (params?.type) {
    if (typeof params.type === 'string') {
      p.type = params.type.split(',');
    } else {
      p.type = params.type;
    }
  } else {
    p.type = ['2', '3'];
  }
  const parentUrl = `https://${config.zoho.url}/zsapi/team/${p.team}/projects/${
    p.project
  }/sprints/?action=${p.action}&range=${p.range}&type=${encodeURIComponent(
    JSON.stringify(p.type),
  )}&index=${p.index}`;

  try {
    const response = await axios.get(parentUrl, { headers });

    return Object.entries(response.data.sprintJObj)
      .map(([key, value]) => ({ value: key, label: value[0] }))
      .sort((a, b) => (a.label < b.label ? 1 : a.label > b.label ? -1 : 0));
  } catch (error) {
    handleError(error);
  }
};
const groupBy = (arr, key) => {
  return arr.reduce((acc, obj) => {
    const group = obj[key];

    if (!acc[group]) {
      acc[group] = [];
    }

    acc[group].push(obj);

    return acc;
  }, {});
};
const mkdirSync = () => {
  try {
    return fs.mkdirSync(userHomeDir);
  } catch (error) {
    console.log(error);
  }
};
const readFileSync = (path) => {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (error) {
    // console.log(error);
  }
};
const removeEmpty = (obj) => {
  for (let [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object') {
      this.removeEmpty(val);

      if (!(Object.keys(val).length || val instanceof Date)) {
        delete obj[key];
      }
    } else {
      if (typeof val === 'string') {
        val = val.trim();
      }

      if (val === null || val === undefined || val === '') {
        delete obj[key];
      } else {
        obj[key] = val;
      }
    }
  }

  return obj;
};
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const userConfig = async (jsonData) => {
  return new Promise((resolve, reject) => {
    try {
      if (!jsonData) {
        const data = readFileSync(filePath);

        jsonData = JSON.parse(data);
      }

      if (!Object.values(jsonData).length) {
        throw new Error('No configurations found, try `zoho init` as first step.');
      }

      resolve(jsonData);
    } catch (parseError) {
      reject(parseError);
    }
  });
};
const writeFileSync = (path, data) => {
  try {
    fs.writeFileSync(path, data);
  } catch (error) {
    console.log(error);
  }
};

// ANSI color codes for table
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
};

// Unicode box-drawing characters
const box = {
  topLeft: '╭',
  topRight: '╮',
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontal: '─',
  vertical: '│',
  teeDown: '┬',
  teeUp: '┴',
  teeRight: '├',
  teeLeft: '┤',
  cross: '┼',
};

// Loading spinner frames
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Create a loading spinner for async operations
 * @param {string} message - Loading message to display
 * @returns {Object} Spinner controller with start() and stop(finalMessage) methods
 */
const createSpinner = (message = 'Loading') => {
  let frameIndex = 0;
  let interval = null;
  let isSpinning = false;

  const start = () => {
    if (isSpinning) return;
    isSpinning = true;
    process.stdout.write('\x1b[?25l'); // Hide cursor

    interval = setInterval(() => {
      const frame = spinnerFrames[frameIndex];
      process.stdout.write(`\r${colors.cyan}${frame}${colors.reset} ${message}...`);
      frameIndex = (frameIndex + 1) % spinnerFrames.length;
    }, 80);
  };

  const stop = (finalMessage = null, success = true) => {
    if (!isSpinning) return;
    isSpinning = false;

    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    process.stdout.write('\x1b[?25h'); // Show cursor
    process.stdout.write('\r\x1b[K'); // Clear line

    if (finalMessage) {
      const icon = success
        ? `${colors.green}✔${colors.reset}`
        : `${colors.yellow}✖${colors.reset}`;
      console.log(`${icon} ${finalMessage}`);
    }
  };

  const update = (newMessage) => {
    message = newMessage;
  };

  return { start, stop, update };
};

/**
 * Print a beautiful CLI table
 * @param {Array<Object>} data - Array of objects to display
 * @param {Object} options - Configuration options
 * @param {number} options.maxColWidth - Maximum column width (default: 20)
 * @param {Array<string>} options.columns - Specific columns to display (default: all)
 * @param {boolean} options.sort - Whether to sort by first column (default: true)
 * @param {string} options.sortBy - Column to sort by (default: first column)
 * @param {string} options.sortOrder - 'asc' or 'desc' (default: 'asc')
 */
const printTable = (data, options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log(`${colors.yellow}No data to display${colors.reset}`);
    return;
  }

  // Filter out undefined/null entries
  let filteredData = data.filter((item) => item != null);

  if (filteredData.length === 0) {
    console.log(`${colors.yellow}No data to display${colors.reset}`);
    return;
  }

  const { maxColWidth = 40, sort = true, sortOrder = 'asc' } = options;

  // Get all columns from the data
  const allColumns = [...new Set(filteredData.flatMap((row) => Object.keys(row)))];
  const columns = options.columns || allColumns;

  // Sort data by first column (or specified column)
  const sortBy = options.sortBy || columns[0];
  if (sort && sortBy) {
    filteredData = [...filteredData].sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';

      // Try numeric comparison first
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      // Fall back to string comparison
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (sortOrder === 'asc') {
        return strA.localeCompare(strB);
      }
      return strB.localeCompare(strA);
    });
  }

  // Calculate column widths
  const colWidths = {};
  columns.forEach((col) => {
    const headerLen = col.length;
    const maxDataLen = Math.max(
      ...filteredData.map((row) => String(row[col] ?? '').length),
      headerLen,
    );
    colWidths[col] = Math.min(maxDataLen, maxColWidth);
  });

  // Helper to truncate and pad text
  const formatCell = (text, width) => {
    const str = String(text ?? '');
    if (str.length > width) {
      return str.substring(0, width - 2) + '..';
    }
    return str.padEnd(width);
  };

  // Top border
  let topBorder = colors.cyan + box.topLeft;
  columns.forEach((col, i) => {
    topBorder += box.horizontal.repeat(colWidths[col] + 2);
    topBorder += i < columns.length - 1 ? box.teeDown : box.topRight;
  });
  topBorder += colors.reset;

  // Header row
  let headerRow = colors.cyan + box.vertical + colors.reset;
  columns.forEach((col) => {
    const sortIndicator = sort && col === sortBy ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '';
    headerRow +=
      ' ' +
      colors.bold +
      colors.yellow +
      formatCell(col + sortIndicator, colWidths[col]) +
      colors.reset +
      ' ' +
      colors.cyan +
      box.vertical +
      colors.reset;
  });

  // Header separator
  let headerSep = colors.cyan + box.teeRight;
  columns.forEach((col, i) => {
    headerSep += box.horizontal.repeat(colWidths[col] + 2);
    headerSep += i < columns.length - 1 ? box.cross : box.teeLeft;
  });
  headerSep += colors.reset;

  // Data rows
  const dataRows = filteredData.map((row) => {
    let dataRow = colors.cyan + box.vertical + colors.reset;
    columns.forEach((col) => {
      const value = row[col];
      const cellColor = colors.white;

      dataRow +=
        ' ' +
        cellColor +
        formatCell(value, colWidths[col]) +
        colors.reset +
        ' ' +
        colors.cyan +
        box.vertical +
        colors.reset;
    });
    return dataRow;
  });

  // Bottom border
  let bottomBorder = colors.cyan + box.bottomLeft;
  columns.forEach((col, i) => {
    bottomBorder += box.horizontal.repeat(colWidths[col] + 2);
    bottomBorder += i < columns.length - 1 ? box.teeUp : box.bottomRight;
  });
  bottomBorder += colors.reset;

  // Print the table
  console.log('');
  console.log(topBorder);
  console.log(headerRow);
  console.log(headerSep);
  dataRows.forEach((row) => console.log(row));
  console.log(bottomBorder);
  console.log(
    `${colors.dim}  ${filteredData.length} row${filteredData.length !== 1 ? 's' : ''} total${colors.reset}`,
  );
  console.log('');
};

module.exports = {
  accessFileSync,
  appendFileSync,
  contentTableHeading,
  contentTableSeparator,
  convertToTaskData,
  createSpinner,
  existsSync,
  filePath,
  getGitLabAuth,
  getHeaders,
  getProjects,
  getSprints,
  groupBy,
  mkdirSync,
  path,
  printTable,
  readFileSync,
  removeEmpty,
  rl,
  userConfig,
  userHomeDir,
  writeFileSync,
};
