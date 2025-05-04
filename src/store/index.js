import { get } from 'jquery';
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    activateDevice: [],
    activateSecureData: [],
    activateDangerData: [],
    dataPreviewList: [],
    weightMap: {},
    scoreMap: {},
    totalScore: 0,
    lastConfigState: '',
    isWeightInitialized: false
  },
  mutations: {
    SET_ACTIVATE_DEVICE(state, deviceIds) {
      state.activateDevice = deviceIds;
    },
    SET_ACTIVATE_SECURE_DATA(state, dataIds){
      state.activateSecureData = dataIds;
    },
    SET_ACTIVATE_DANGER_DATA(state, dataIds){
      state.activateDangerData = dataIds;
    },
    SET_DATA_PREVIEW_LIST(state, dataIds){
      state.dataPreviewList = dataIds;
    },
    //权重和评分相关
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
    }
  },
  actions: {
    updateActivateDevice({ commit }, deviceIds) {
      commit('SET_ACTIVATE_DEVICE', deviceIds);
    },
    updateActivateSecureData({ commit }, dataIds) {
      commit('SET_ACTIVATE_SECURE_DATA', dataIds);
    },
    updateActivateDangerData({ commit }, dataIds) {
      commit('SET_ACTIVATE_DANGER_DATA', dataIds);
    },
    updateDataPreviewList({ commit }, dataIds) {
      commit('SET_DATA_PREVIEW_LIST', dataIds);
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
    }
  },
  getters: {
    getActivateDevice: state => state.activateDevice,
    getActivateSecureData: state => state.activateSecureData,
    getActivateDangerData: state => state.activateDangerData,
    getDataPreviewList: state => state.dataPreviewList,
    getWeightMap: state => state.weightMap,
    getScoreMap: state => state.scoreMap,
    getTotalScore: state => state.totalScore,
    getLastConfigState: state => state.lastConfigState,
    getWeightInitialized: state => state.isWeightInitialized,
    // 检测配置是否发生变化
    hasConfigChanged: (state) => {
      const currentConfig = JSON.stringify({
        device: state.activateDevice,
        secure: state.activateSecureData,
        danger: state.activateDangerData
      });
      return currentConfig !== state.lastConfigState;
    }
  }
})