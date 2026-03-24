const DeviceState = require("../models/DeviceState");

async function getOrCreateState() {
  let state = await DeviceState.findOne();
  if (!state) {
    state = await DeviceState.create({});
  }
  return state;
}

async function updateState(patch) {
  const state = await getOrCreateState();
  Object.assign(state, patch);
  await state.save();
  return state;
}

async function getCurrentState() {
  return await getOrCreateState();
}

module.exports = {
  getOrCreateState,
  updateState,
  getCurrentState,
};