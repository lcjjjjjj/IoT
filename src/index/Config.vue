<template>
  <div class="container">
    <div class="header-container">
      <Panel :title="title" :desc="desc" />
      <div class="upload-container">
        <el-upload
          class="upload-button"
          action="http://175.6.159.90:21906/wlwapi/dataTest"
          :limit="1"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-remove="handleFileRemove"
          :before-upload="berforeUpload"
          :file-list="fileList"
          :data="uploadData"
        >
          <el-button type="primary" icon="el-icon-upload2">上传配置数据</el-button>
        </el-upload>
      </div>
    </div>
    
    <div v-if="isDataUploaded" class="grid-container">
      <div class="grid-item">
        <div class="grid-item-header">
          <h3>指标配置选项</h3>
          <div class="model-selector">
            <span class="model-label">安全模型库:</span>
            <el-select 
              v-model="selectedModel" 
              size="small" 
              placeholder="选择模型库"
              @change="handleModelChange"
            >
              <el-option
                v-for="item in modelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="content">
          <!-- 指标配置选项区域 -->
          <div class="indicators-container">
            <div class="indicator-box bg-purple-light">
              <h4>设备列表</h4>
              <div class="device-list">
                <el-button
                  v-for="device in paginatedDevices"
                  :key="device.id"
                  size="small"
                  :type="checkDeviceStatus(device) === device.id ? 'primary' : ''"
                  @click="handledDeviceClick(device)"
                >
                  {{ device.name }}
                </el-button>
              </div>
              <el-pagination
                small
                :current-page="currentPage"
                :page-size="pageSize"
                :total="deviceList.length"
                layout="prev, pager, next"
                @current-change="handCurrentChange"
              />
            </div>
            <div class="indicator-box bg-purple-light">
              <h4>安全数据</h4>
              <div class="device-list">
                <el-button
                  v-for="data in secureList"
                  :key="data.id"
                  size="small"
                  :type="checkSecureStatus(data) === data.id ? 'success' : ''"
                  @click="handleSecureClick(data)"
                >
                  {{ data.name }}
                </el-button>
              </div>
            </div>
            <div class="indicator-box bg-purple-light">
              <h4>风险数据</h4>
              <div class="device-list">
                <el-button
                  v-for="data in dangerList"
                  :key="data.id"
                  size="small"
                  :type="checkDangerStatus(data) === data.id ? 'danger' : ''"
                  @click="handleDangerClick(data)"
                >
                  {{ data.name }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid-item">
        <h3>物联网拓扑结构</h3>
        <!-- 生成物联网结构图 -->
        <div class="content topology-content">
          <img :src="iotStructureImg" alt="物联网拓扑结构" class="topology-image" />
        </div>
      </div>
      <div class="grid-item">
        <h3>数据速览</h3>
        <div class="content">
          <!-- 数据速览区域内容 -->
          <div class="data-preview-container">
            <div class="data-preview-list" v-if="dataPreviewList.length > 0">
              <el-button
                v-for="(item,index) in dataPreviewList"
                :key="`${item.type}-${item.id}-${index}`"
                size="small"
                :type=" checkPreviewStatus(item) === item.id ? getButtonTypeClass(item) : ''"
                @click="handlePreviewClick(item)"
              >
                {{ item.name }}
              </el-button>
            </div>
            <div class="empty-preview" v-else>
              <span>请从指标配置中选择数据</span>
            </div>
            <div class="clear-preview" v-if="dataPreviewList.length > 0">
              <el-button type="text" size="small" @click="clearAllData">
                清空数据
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="grid-item">
        <h3>物联网设备总数</h3>
        <div class="content">
          <!-- 物联网设备统计区域内容 -->
          <div id="device-chart" class="chart-container"></div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-content">
        <i class="el-icon-upload"></i>
        <p>请先上传物联网配置数据</p>
        <p class="sub-text">上传数据后将显示完整的配置界面</p>
      </div>
    </div>
  </div>
</template>

<script>
import Panel from "../components/Panel.vue"
import IotStructure from "../assets/iotstructure.png"
import * as echarts from 'echarts'
import { request } from "../components/network"
export default {
  data() {
    const secureData = ['实时流量','异常流量','连接状态','DDos攻击','恶意软件','入侵检测'];
    const dangerData = ['数据来源','访问日志','异常行为','数据类型','风险等级','威胁趋势'];
    return {
      title: '物联网配置',
      desc: '这里是物联网配置的描述信息',
      iotStructureImg: IotStructure,
      currentPage: 1,
      pageSize: 6,
      secureData,
      dangerData,
      maxDataPreviewButtons: 24,
      chart: null,
      deviceList: Array.from({length: 20},(_,i)=>({
        id: i+1,
        name: `设备${i + 1}`
      })),
      secureList: Array.from({length: secureData.length},(_,i)=>({
        id: i + 1,
        name: secureData[i]
      })),
      dangerList: Array.from({length: dangerData.length},(_,i)=>({
        id: i + 1,
        name: dangerData[i]
      })),
      isDataUploaded: false,
      fileList: [],
      uploadData: {type: 4},
      selectedModel: 'MITRE-ATT&CK',
      modelOptions: [
        { value: 'MITRE-ATT&CK', label: 'IoTSentinel Core' },
        { value: 'IoTSF', label: 'ThreatMatrix IoT' },
        { value: 'OWASP-IoT', label: 'AegisVision IoT' }
      ],
      modelFactors: {
        'MITRE-ATT&CK': {
          device: 1.0,
          secure: 1.2,
          danger: 1.0
        },
        'IoTSF': {
          device: 1.2,
          secure: 0.9,
          danger: 0.8
        },
        'OWASP-IoT': {
          device: 0.8,
          secure: 1.0,
          danger: 1.3
        }
      }
    }
  },
  components: {
    Panel
  },
  computed: {
    paginatedDevices() {
      const start = (this.currentPage-1)*this.pageSize;
      return this.deviceList.slice(start, start + this.pageSize);
    },
    activateDevice: {
      get() {
        return this.$store.getters.getActivateDevice;
      },
      set(value) {
        this.$store.dispatch('updateActivateDevice', value);
      }
    },
    activateSecureData: {
      get() {
        return this.$store.getters.getActivateSecureData;
      },
      set(value) {
        this.$store.dispatch('updateActivateSecureData', value);
      }
    },
    activateDangerDate: {
      get() {
        return this.$store.getters.getActivateDangerData;
      },
      set(value) {
        this.$store.dispatch('updateActivateDangerData', value);
      }
    },
    dataPreviewList: {
      get() {
        return this.$store.getters.getDataPreviewList;
      },
      set(value) {
        this.$store.dispatch('updateDataPreviewList', value);
      }
    }
  },
  mounted() {
    this.restoreUploadState();
    this.$nextTick(() => {
      if (this.isDataUploaded) {
        this.initChart();
        
        // 初始化安全模型
        if (!this.$store.getters.getSecurityModel) {
          this.handleModelChange(this.selectedModel);
        } else {
          this.selectedModel = this.$store.getters.getSecurityModel.model;
        }
      }
    })
  },
  methods: {
    handledDeviceClick(device) {
      request({
        url: "wlwapi/dataTest",
        method: "post",
        params: {
          type: 4
        }
      }).then((res) => {
        if (this.activateDevice.includes(device.id)){
          this.activateDevice = this.activateDevice.filter(id => id !== device.id);
        } else {
          this.activateDevice.push(device.id);
          this.addToDataPreview({
            type: 'device',
            id: device.id,
            name: device.name
          });
        }
      })
    },
    handleSecureClick (data) {
      request({
        url: "wlwapi/dataTest",
        method: "post",
        params: {
          type: 4
        }
      }).then((res) => {
        if (this.activateSecureData.includes(data.id)) {
        this.activateSecureData = this.activateSecureData.filter(id => id !== data.id);
        } else {
          this.activateSecureData.push(data.id);
          this.addToDataPreview({
            type: 'secure',
            id: data.id,
            name: data.name
          });
        }
      })
    },
    handleDangerClick (data) {
      request({
        url: "wlwapi/dataTest",
        method: "post",
        params: {
          type: 4
        }
      }).then((res) => {      
        if (this.activateDangerDate.includes(data.id)) {
          this.activateDangerDate = this.activateDangerDate.filter(id => id !== data.id);
        } else {
          this.activateDangerDate.push(data.id);
          this.addToDataPreview({
            type: 'danger',
            id: data.id,
            name: data.name
          });
        }
      })
    },
    handCurrentChange(val) {
      this.currentPage = val;
    },
    checkDeviceStatus(device) {
      if (this.activateDevice.includes(device.id)) {
        return device.id;
      } else {
        return '';
      }
    },
    checkSecureStatus(data) {
      if (this.activateSecureData.includes(data.id)) {
        return data.id;
      } else {
        return '';
      }
    },
    checkDangerStatus(data) {
      if (this.activateDangerDate.includes(data.id)) {
        return data.id;
      } else {
        return '';
      }
    },
    checkPreviewStatus(item) {
      if (item.type === 'device') {
        return this.activateDevice.includes(item.id) ? item.id : '';
      } else if (item.type === 'secure') {
        return this.activateSecureData.includes(item.id) ? item.id : '';
      } else if (item.type === 'danger') {
        return this.activateDangerDate.includes(item.id) ? item.id : '';
      }
      return '';
    },
    addToDataPreview(data) {
      const exist = this.dataPreviewList.some(item => 
        item.type === data.type && item.id === data.id
      );
      if (!exist) {
        if (this.dataPreviewList.length >= this.maxDataPreviewButtons) {
          this.dataPreviewList.shift();
        }
        this.dataPreviewList.push(data);
      }
    },
    handlePreviewClick(item) {
      if (item.type === 'device') {
        if (this.activateDevice.includes(item.id)) {
          this.activateDevice = this.activateDevice.filter(id => id !== item.id);
        } else {
          this.activateDevice.push(item.id);
        }
      } else if (item.type === 'secure') {
        if (this.activateSecureData.includes(item.id)) {
          this.activateSecureData = this.activateSecureData.filter(id => id !== item.id);
        } else {
          this.activateSecureData.push(item.id);
        }
      } else if (item.type === 'danger') {
        if (this.activateDangerDate.includes(item.id)) {
          this.activateDangerDate = this.activateDangerDate.filter(id => id !== item.id);
        } else {
          this.activateDangerDate.push(item.id);
        }
      }
    },
    getButtonTypeClass(item) {
      if (item.type === 'device') return 'primary';
      if (item.type === 'secure') return 'success';
      if (item.type === 'danger') return 'danger';
      return '';
    },
    clearAllData() {
      this.dataPreviewList = [];
      this.activateDevice = [];
      this.activateSecureData = [];
      this.activateDangerDate = [];
    },
    initChart() {
      if (this.chart) {
        this.chart.dispose()
      }
      const chartDom = document.getElementById('device-chart')
      if (!chartDom) return
      this.chart = echarts.init(chartDom)
      const option = {
        title: {
          text: '设备使用统计',
          left: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['系列1', '系列2', '系列3'],
          bottom: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel:true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['类别1', '类别2', '类别3', '类别4']
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [25, 60, 40, 80],
            smooth: true,
            itemStyle: {
              width: 2
            }
          },
          {
            name: '系列2',
            type: 'line',
            data: [45, 30, 70, 55],
            smooth: true,
            itemStyle: {
              width: 2
            }
          },
          {
            name: '系列3',
            type: 'line',
            data: [65, 85, 35, 60],
            smooth: true,
            itemStyle: {
              width: 2
            }
          }
        ],
        color: ['#409EFF', '#67C23A', '#F56C6C'],
      }
      this.chart.setOption(option)
      window.addEventListener('resize',() => {
        this.chart && this.chart.resize()
      })
    },
    handleUploadSuccess(response, file, fileList) {
      if (response.success) {
        this.$message.success('配置数据上传成功');
        this.isDataUploaded = true;
        this.fileList = fileList;
        
        this.saveUploadState(file, response.data);
        
        this.$nextTick(() => {
          this.initChart();
        });
      } else {
        this.$message.error(response.message || '上传失败');
      }
    },
    handleUploadError(err) {
      console.error('上传出错:', err);
      this.$message.error('文件上传失败，请稍后重试');
    },
    handleFileRemove(file, fileList) {
      console.log('文件已移除', file);
      // 清除存储的状态
      this.clearUploadState();
      // 更新组件状态
      this.fileList = fileList;
      this.isDataUploaded = false;
    },
    clearUploadState() {
      // 清除 localStorage
      localStorage.removeItem('iotConfigUploaded');
      localStorage.removeItem('iotConfigFileName');
      localStorage.removeItem('iotConfigUploadTime');
      
      // 清除 Vuex 中的配置数据
      this.$store.dispatch('clearIoTConfigData');
      
      // 同步清除所有选中的设备和数据
      this.$store.dispatch('updateActivateDevice', []);
      this.$store.dispatch('updateActivateSecureData', []);
      this.$store.dispatch('updateActivateDangerData', []);
      this.$store.dispatch('updateDataPreviewList', []);
      
      // 重置安全模型
      this.$store.dispatch('updateSecurityModel', null);
      this.selectedModel = this.modelOptions[0].value;
      
      // 添加标记表示已清除
      sessionStorage.setItem('iotConfigCleared', 'true');
    },
    saveUploadState(file, data) {
      this.$store.dispatch('saveIoTConfigData', {
        fileName: file.name,
        fileSize: file.size,
        uploadTime: new Date().toISOString(),
        configData: data
      });
      
      localStorage.setItem('iotConfigUploaded', 'true');
      localStorage.setItem('iotConfigFileName', file.name);
      localStorage.setItem('iotConfigUploadTime', new Date().toISOString());
      
      // 移除清除标记
      sessionStorage.removeItem('iotConfigCleared');
    },
    restoreUploadState() {
      // 首先检查是否在刷新前清除了文件
      const wasCleared = sessionStorage.getItem('iotConfigCleared') === 'true';
      if (wasCleared) {
        console.log('检测到刷新前文件已清除，保持清除状态');
        this.isDataUploaded = false;
        this.fileList = [];
        
        // 确保所有相关数据也被清空
        this.$store.dispatch('updateActivateDevice', []);
        this.$store.dispatch('updateActivateSecureData', []);
        this.$store.dispatch('updateActivateDangerData', []);
        this.$store.dispatch('updateDataPreviewList', []);
        
        return;
      }
      
      // 如果未清除，则继续原有逻辑
      const storeData = this.$store.getters.getIoTConfigData;
      
      if (storeData && Object.keys(storeData).length > 0) {
        this.isDataUploaded = true;
        // 从 Vuex 恢复文件列表
        this.fileList = [{
          name: storeData.fileName,
          size: storeData.fileSize,
          // 添加必要的属性使其看起来像是通过上传获得的文件对象
          status: 'success',
          uid: Date.now()
        }];
        return;
      }
      
      const isUploaded = localStorage.getItem('iotConfigUploaded') === 'true';
      if (isUploaded) {
        this.isDataUploaded = true;
        const fileName = localStorage.getItem('iotConfigFileName');
        if (fileName) {
          // 从 localStorage 恢复时也添加必要的属性
          this.fileList = [{
            name: fileName,
            status: 'success',
            uid: Date.now()
          }];
        }
      } else {
        // 如果没有上传状态，也确保清空所有相关数据
        this.$store.dispatch('updateActivateDevice', []);
        this.$store.dispatch('updateActivateSecureData', []);
        this.$store.dispatch('updateActivateDangerData', []);
        this.$store.dispatch('updateDataPreviewList', []);
      }
      
      // 恢复选择的模型
      const storedModel = this.$store.getters.getSecurityModel;
      if (storedModel) {
        this.selectedModel = storedModel.model;
      }
    },
    handleModelChange(value) {
      console.log(`模型已切换到: ${value}`);
      // 通知 Vuex store 模型已更改
      this.$store.dispatch('updateSecurityModel', {
        model: value,
        factors: this.modelFactors[value]
      });
      
      // 显示提示信息
      this.$message({
        message: `已切换到${this.getModelLabel(value)}模型`,
        type: 'success'
      });
    },
    getModelLabel(value) {
      const model = this.modelOptions.find(m => m.value === value);
      return model ? model.label : '';
    },
    berforeUpload(file) {
      console.log('准备上传文件:', file.type);
      const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const isValidType = validTypes.includes(file.type);

      if (!isValidType) {
        this.$message.error('仅支持上传 CSV 或 XLSX 格式的文件');
        return false; // 阻止上传
      }

      return true; // 允许上传
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      window.removeEventListener('resize', () => this.chart.resize())
      this.chart = null
    }
  }
}
</script>

<style scoped>
.container {
  padding: 10px;
  height: 96%;
  display: flex;
  flex-direction: column;
}

/* 新增样式 */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.upload-container {
  margin-top: 10px;
  margin-right: 10px;
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9fafc;
  border-radius: 4px;
  margin-top: 10px;
}

.empty-content {
  text-align: center;
  color: #909399;
}

.empty-content i {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-content .sub-text {
  font-size: 14px;
  margin-top: 8px;
  color: #c0c4cc;
}

.grid-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  flex-shrink: 0;
}

.grid-item-header h3 {
  margin: 0;
  padding: 0;
  border-bottom: none;
}

.model-selector {
  display: flex;
  align-items: center;
}

.model-label {
  font-size: 13px;
  margin-right: 8px;
  color: #606266;
}

/* 确保下拉框样式适合此布局 */
.model-selector :deep(.el-select) {
  width: 190px;
}

/* 原有样式 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 60% 40%;
  gap: 10px;
  margin-top: 10px;
  flex: 1;
  min-height: 0;
}

.grid-item {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.grid-item h3 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  flex-shrink: 0;
}

.content {
  flex: 1;
  overflow: auto;
}

.topology-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.topology-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  width: auto;
  height: auto;
}

.bg-purple-light {
  background: #e5e9f2;
}

.indicators-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
}

.indicators-row {
  width: 100%;
}

.device-list {
  display: flex;
  padding: 5px;
}

.indicator-box {
  margin: 10px 0;
  display: flex;
  border-radius: 4px;
  padding: 10px;
  flex-direction: column;
}

.indicator-box h4 {
  color: #303133;
  font-size: 14px;
  border-bottom: 1px solid #ebeef5;
  padding:5px;
  flex-shrink: 0;
}

.indicator-box .el-pagination {
  text-align: center;
}

.indicator-box .el-button {
  width: 100%;
}

.data-preview-container {
  height: 90%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.data-preview-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, auto);
  gap: 10px;
  width: 100%;
}

.data-preview-list .el-button {
  margin: 0;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.empty-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.clear-preview {
  position: absolute;
  bottom: 10px;
  right: 20px;
  font-size: 12px;
}

.chart-container {
  width: 95%;
  height: 95%;
  min-height: 200px;
  margin: auto;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.empty-content {
  text-align: center;
}

.empty-content i {
  font-size: 48px;
  color: #dcdfe6;
}

.empty-content p {
  margin: 10px 0;
}

.empty-content .sub-text {
  color: #909399;
  font-size: 12px;
}
</style>