<template>
  <div class="container">
    <Panel :title="title" :desc="desc" />
    <div class="grid-container">
      <div class="grid-item">
        <h3>指标配置选项</h3>
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
  </div>
</template>

<script>
import Panel from "../components/Panel.vue"
import IotStructure from "../assets/iotstructure.png"
import * as echarts from 'echarts'
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
      // activateDevice: [],
      // activateSecureData: [],
      // activateDangerDate: [],
      secureData,
      dangerData,
      maxDataPreviewButtons: 24,
      // dataPreviewList: [],
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
    this.$nextTick(() => {
      this.initChart();
    })
  },
  methods: {
    handledDeviceClick(device) {
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
    },
    handleSecureClick (data) {
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
    },
    handleDangerClick (data) {
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
    // removeFromDataPreview(data) {
    //   this.dataPreviewList = this.dataPreviewList.filter(item => 
    //     !(item.type === data.type && item.id === data.id)
    //   );
    // },
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
  /* height: 80px; */
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
</style>