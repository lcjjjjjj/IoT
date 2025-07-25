import { get } from 'jquery';
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    iotConfigData: {},
    activateDevice: [],
    activateSecureData: [],
    activateDangerData: [],
    dataPreviewList: [],
    weightMap: {},
    scoreMap: {},
    totalScore: 0,
    lastConfigState: '',
    isWeightInitialized: false,
    securityModel: null
  },
  mutations: {
    SET_IOT_CONFIG_DATA(state, payload) {
      state.iotConfigData = payload;
    },
    CLEAR_IOT_CONFIG_DATA(state) {
      state.iotConfigData = {};
    },
    SET_ACTIVATE_DEVICE(state, payload) {
      state.activateDevice = payload;
    },
    SET_ACTIVATE_SECURE_DATA(state, payload) {
      state.activateSecureData = payload;
    },
    SET_ACTIVATE_DANGER_DATA(state, payload) {
      state.activateDangerData = payload;
    },
    SET_DATA_PREVIEW_LIST(state, payload) {
      state.dataPreviewList = payload;
    },
    SET_WEIGHT_MAP(state, weightMap) {
      state.weightMap = weightMap;
    },
    SET_SCORE_MAP(state, scoreMap) {
      state.scoreMap = scoreMap;
    },
    SET_TOTAL_SCORE(state, totalScore) {
      state.totalScore = totalScore;
    },
    SET_CONFIG_STATE(state, configState) {
      state.lastConfigState = configState;
    },
    SET_WEIGHT_INITIALIZED(state, isInitialized) {
      state.isWeightInitialized = isInitialized;
    },
    SET_SECURITY_MODEL(state, model) {
      state.securityModel = model;
    }
  },
  actions: {
    saveIoTConfigData({ commit }, data) {
      commit('SET_IOT_CONFIG_DATA', data);
    },
    clearIoTConfigData({ commit }) {
      commit('CLEAR_IOT_CONFIG_DATA');
    },
    updateActivateDevice({ commit }, data) {
      commit('SET_ACTIVATE_DEVICE', data);
    },
    updateActivateSecureData({ commit }, data) {
      commit('SET_ACTIVATE_SECURE_DATA', data);
    },
    updateActivateDangerData({ commit }, data) {
      commit('SET_ACTIVATE_DANGER_DATA', data);
    },
    updateDataPreviewList({ commit }, data) {
      commit('SET_DATA_PREVIEW_LIST', data);
    },
    updateWeightMap({ commit }, weightMap) {
      commit('SET_WEIGHT_MAP', weightMap);
    },
    updateScoreMap({ commit }, scoreMap) {
      commit('SET_SCORE_MAP', scoreMap);
    },
    updateTotalScore({ commit }, totalScore) {
      commit('SET_TOTAL_SCORE', totalScore);
    },
    updateConfigState({ commit, state }) {
      const configState = JSON.stringify({
        device: state.activateDevice,
        secure: state.activateSecureData,
        danger: state.activateDangerData
      });
      commit('SET_CONFIG_STATE', configState);
    },
    setWeightInitialized({ commit }, isInitialized) {
      commit('SET_WEIGHT_INITIALIZED', isInitialized);
    },
    updateSecurityModel({ commit }, model) {
      commit('SET_SECURITY_MODEL', model);
    }
  },
  getters: {
    getIoTConfigData: state => state.iotConfigData,
    getActivateDevice: state => state.activateDevice,
    getActivateSecureData: state => state.activateSecureData,
    getActivateDangerData: state => state.activateDangerData,
    getDataPreviewList: state => state.dataPreviewList,
    getWeightMap: state => state.weightMap,
    getScoreMap: state => state.scoreMap,
    getTotalScore: state => state.totalScore,
    getLastConfigState: state => state.lastConfigState,
    getWeightInitialized: state => state.isWeightInitialized,
    hasConfigChanged: (state) => {
      const currentConfig = JSON.stringify({
        device: state.activateDevice,
        secure: state.activateSecureData,
        danger: state.activateDangerData
      });
      return currentConfig !== state.lastConfigState;
    },
    getSecurityModel: state => state.securityModel
  }
})