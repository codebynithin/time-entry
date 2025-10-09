#!/usr/bin/env node
const { ACTIONS } = require('./services/enums/actions.enum');
const { init, switchDefaultProject } = require('./services/init-config');
const { processArgs } = require('./services/process-commands');
const initNpm = async () => {
  let [type, ...value] = (process.argv || []).splice(2);

  if (!type) {
    type = ACTIONS.HELP;
  }

  if (type === ACTIONS.INIT) {
    init();
  } else if (type === ACTIONS.SWITCH) {
    switchDefaultProject();
  } else {
    processArgs(type, value?.join(' '));
  }
};

initNpm();

module.exports = initNpm;
