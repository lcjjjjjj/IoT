<template>
  <div class="evaluation-container">
    <Panel :title="title" :desc="desc" />
    <div class="content-area">
      <div class="left-area">
        <!-- 左侧区域 -->
        <div class="area-content">
          <h3>攻击检测与报告列表</h3>
          <div class="report-container">
            <div class="report-content" v-if="hasItems">
              <el-timeline>
                <el-timeline-item
                  v-for="(report, index) in reportList"
                  :key="index"
                  :timestamp="formatDate(report.time)"
                  :type="getTimelineItemType(index)"
                  placement="top"
                >
                  <el-card class="report-card">
                    <div class="report-title">{{ report.title }}</div>
                    <div class="report-subtitle">{{ report.source }}</div>
                    <div class="report-tags">
                      <el-tag size="mini" type="danger" v-if="report.org">{{ report.org }}</el-tag>
                      <el-tag size="mini" type="warning" v-if="report.aptfromcountry">{{ report.aptfromcountry }}</el-tag>
                    </div>
                    <div class="report-actions">
                      <el-button size="mini" type="text" @click="viewReportDetail(report)">查看详情</el-button>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
            <div class="report-loading" v-else-if="isLoading">
              <el-skeleton :rows="5" animated />
            </div>
            
            <div class="no-data" v-else>
              暂无报告数据
            </div>
          </div>
        </div>
      </div>
      <div class="right-area">
        <!-- 右上区域 -->
        <div class="right-top-area">
          <div class="area-content">
            <h3>物联网安全态势评估总分数</h3>
            <div class="score-content" v-if="hasItems">
              <div class="total-score-container">
                <div class="score-value" :class="scoreClass">{{ totalScore.toFixed(1) }}</div>
                <div class="score-label">安全态势评分</div>
              </div>
              <div class="score-chart-container">
                <div id="scoreChart" ref="scoreChart" class="score-chart"></div>
              </div>
            </div>
            <div class="no-data" v-else>
              请在指标配置选项中先配置指标
            </div>
          </div>
        </div>
        <!-- 右下区域 -->
        <div class="right-bottom-area">
          <div class="area-content">
            <h3>权重配置分布</h3>
            <div class="weight-distribution">
              <div class="weight-chart-container" v-if="hasItems">
                <div id="weightChart" ref="weightChart" class="weight-chart"></div>
              </div>
              <div class="no-data" v-else>
                请在指标配置选项中先配置指标
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      title="报告详情"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleCloseDialog"
    >
      <div v-if="selectedReport">
        <h3>{{ selectedReport.title }}</h3>
        <p><strong>披露公司:</strong> {{ selectedReport.source }}</p>
        <p><strong>披露日期:</strong> {{ formatDate(selectedReport.time) }}</p>
        <p><strong>攻击组织:</strong> {{ selectedReport.org }}</p>
        <p><strong>组织来源:</strong> {{ selectedReport.aptfromcountry || '未知' }}</p>
        <p><strong>资源链接:</strong> {{ selectedReport.vendorLink || '未知' }}</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Panel from "../components/Panel.vue"
import * as echarts from 'echarts'
import { request_ } from "../components/network"
export default {
  data() {
    return {
      title: '态势评估',
      desc: '这里是态势评估的描述信息',
      deviceList: Array.from({length: 20}, (_, i) => ({
        id: i+1,
        name: `设备${i + 1}`
      })),
      secureData: ['实时流量','异常流量','连接状态','DDos攻击','恶意软件','入侵检测'],
      dangerData: ['数据来源','访问日志','异常行为','数据类型','风险等级','威胁趋势'],
      reportList: [],
      isLoading: false,
      dialogVisible: false,
      selectedReport: null,
      chart: null,
      scoreChart: null,
    }
  },
  components: {
    Panel
  },
  computed: {
    activateDevice() {
      return this.$store.getters.getActivateDevice;
    },
    activateSecureData() {
      return this.$store.getters.getActivateSecureData;
    },
    activateDangerData() {
      return this.$store.getters.getActivateDangerData;
    },
    deviceItems() {
      return this.deviceList.filter(device => this.activateDevice.includes(device.id));
    },
    secureItems() {
      return this.secureData.map((name, index) => ({
        id: index + 1,
        name
      })).filter(item => this.activateSecureData.includes(item.id));
    },
    dangerItems() {
      return this.dangerData.map((name, index) => ({
        id: index + 1,
        name
      })).filter(item => this.activateDangerData.includes(item.id));
    },
    weightMap: {
      get() {
        return this.$store.getters.getWeightMap;
      },
      set(value) {
        this.$store.dispatch('updateWeightMap', value);
      }
    },
    scoreMap: {
      get() {
        return this.$store.getters.getScoreMap;
      },
      set(value) {
        this.$store.dispatch('updateScoreMap', value);
      }
    },
    totalScore: {
      get() {
        return this.$store.getters.getTotalScore;
      },
      set(value) {
        this.$store.dispatch('updateTotalScore', value);
      }
    },
    configChanged() {
      return this.$store.getters.hasConfigChanged;
    },
    isWeightInitialized() {
      return this.$store.getters.getWeightInitialized;
    },
    hasItems() {
      return this.deviceItems.length > 0 || this.secureItems.length > 0 || this.dangerItems.length > 0;
    },
    weightChartData() {
      const data = [];
      this.deviceItems.forEach(item => {
        data.push({
          name: item.name,
          value: this.weightMap[item.name],
          type: 'device',
          itemStyle: {
            color: '#409EFF'
          }
        });
      });
      this.secureItems.forEach(item => {
        data.push({
          name: item.name,
          value: this.weightMap[item.name],
          type: 'secure',
          itemStyle: {
            color: '#67C23A'
          }
        });
      });
      this.dangerItems.forEach(item => {
        data.push({
          name: item.name,
          value: this.weightMap[item.name],
          type: 'danger',
          itemStyle: {
            color: '#F56C6C'
          }
        });
      });
      return data;
    },
    scoreClass() {
      if (this.totalScore >= 90) return 'score-excellent';
      if (this.totalScore >= 75) return 'score-good';
      if (this.totalScore >= 60) return 'score-medium';
      return 'score-poor';
    },
    scoreChartData() {
      const data = [];
      const categories = [
        { key: 'device', name: '设备', color: '#409EFF' },
        { key: 'secure', name: '安全数据', color: '#67C23A' },
        { key: 'danger', name: '风险数据', color: '#F56C6C' }
      ];
      categories.forEach(category => {
        let items = [];
        let totalScore = 0;
        let totalWeight = 0;
        switch(category.key) {
          case 'device':
            items = this.deviceItems;
            break;
          case 'secure':
            items = this.secureItems;
            break;
          case 'danger':
            items = this.dangerItems;
            break;
        }
        items.forEach(item => {
          const score = this.scoreMap[item.name] || 0;
          const weight = this.weightMap[item.name] || 0;
          totalScore += score * weight;
          totalWeight += weight;
        });
        if (items.length > 0 && totalWeight > 0) {
          data.push({
            name: category.name,
            value: Number(totalScore.toFixed(1)),
            itemStyle: { color: category.color },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          });
        }
      });
      return data;
    },
  },
  watch: {
    configChanged(newVal) {
      if (newVal && this.isWeightInitialized) {
        this.assignRandomWeights();
        this.calculateScore();
        this.$store.dispatch('updateConfigState');
      }
    },
    scoreChartData: {
      handler() {
        this.$nextTick(() => {
          if (this.scoreChart){
            this.updateScoreChart();
          }
        });
      },
      deep: true
    },
    weightChartData: {
      handler() {
        this.$nextTick(() => {
          if (this.chart) {
            this.updateChart();
          }
        });
      },
      deep: true
    },
    hasItems(val) {
      if(val) {
        this.$nextTick(() => {
          this.initChart();
          this.initScoreChart();
        });
      }
    }
  },
  mounted() {
    console.log(this.deviceItems,this.secureItems,this.dangerItems)
    if (!this.isWeightInitialized) {
      this.assignRandomWeights();
      this.calculateScore();
      this.$store.dispatch('setWeightInitialized', true);
      this.$store.dispatch('updateConfigState');
    } else if (this.configChanged) {
      this.assignRandomWeights();
      this.calculateScore();
      this.$store.dispatch('updateConfigState');
    } else {
      console.log("保持现有权重不变");
    }

    this.getReport();

    if (this.hasItems) {
      this.$nextTick(() => {
        this.initChart();
        this.initScoreChart();
      });
    }

    window.addEventListener('resize', this.resizeChart);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart);
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
    if (this.scoreChart) {
      this.scoreChart.dispose();
      this.scoreChart = null;
    }
  },
  methods: {
    assignRandomWeights() {
      if (Object.keys(this.weightMap).length > 0 && !this.configChanged) {
        console.log("保持现有权重不变");
        return;
      }
      const newWeightMap = {};
      const allItems = [
        ...this.deviceItems.map(item => ({name: item.name, type: 'device', id: item.id})),
        ...this.secureItems.map(item => ({name: item.name, type: 'secure', id: item.id})),
        ...this.dangerItems.map(item => ({name: item.name, type: 'danger', id: item.id}))
      ];
      if (allItems.length === 0) {
        this.weightMap = newWeightMap;
        return;
      }

      let totalWeight = 0;
      allItems.forEach(item => {
        const randomWeight = 0.1 + Math.random() * 0.9;
        const key = `${item.name}`;
        newWeightMap[key] = randomWeight;
        totalWeight += randomWeight;
      });
      Object.keys(newWeightMap).forEach(key => {
        newWeightMap[key] = Number((newWeightMap[key] / totalWeight).toFixed(4));
      });

      this.weightMap = newWeightMap;
      console.log("权重已更新：",newWeightMap);
    },
    calculateScore() {
      if (Object.keys(this.scoreMap).length > 0 && !this.configChanged) {
        console.log("保持现有分数不变");
        return;
      }
      const newScoreMap = {};
      const allItems = [
        ...this.deviceItems.map(item => ({name: item.name, type: 'device', id: item.id})),
        ...this.secureItems.map(item => ({name: item.name, type: 'secure', id: item.id})),
        ...this.dangerItems.map(item => ({name: item.name, type: 'danger', id: item.id}))
      ];
      if (allItems.length === 0) {
        this.scoreMap = newScoreMap;
        this.totalScore = 0;
        return;
      }
      allItems.forEach(item => {
        let baseScore = 0;
        switch(item.type){
          case 'device':
            baseScore = 60 + Math.random() * 30;
            break;
          case 'secure':
            baseScore = 70 + Math.random() * 25;
            break;
          case 'danger':
            baseScore = 40 + Math.random() * 40;
            break;
          default:
            baseScore = 50 + Math.random() * 50;
        }
        const fluctuation = 0.8 + Math.random() * 0.4;
        const finalScore = Math.min(100, Math.max(0, baseScore * fluctuation));
        newScoreMap[item.name] = Number(finalScore.toFixed(2));
      });
      let weightedTotal = 0;
      let totalWeightApplied = 0;
      allItems.forEach(item => {
        const weight = this.weightMap[item.name];
        const score = newScoreMap[item.name];
        weightedTotal += weight * score;
        totalWeightApplied += weight;
      });

      const newTotalScore = totalWeightApplied > 0 ? Number((weightedTotal).toFixed(2)) : 0;
    
      this.scoreMap = newScoreMap;
      this.totalScore = newTotalScore;
    },
    initChart() {
      if (this.chart) {
        this.chart.dispose();
      }
      this.chart = echarts.init(this.$refs.weightChart);
      this.updateChart();
    },
    updateChart() {
      if (!this.chart) return;
      const data = this.weightChartData;
      const names = data.map(item => item.name);
      const values = data.map(item => item.value);
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            const param = params[0];
            return `${param.name}: ${(param.value).toFixed(3)}`;
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '5%',
          top: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: names,
          axisLabel: {
            interval: 0,
            rotate: 45,
            textStyle: {
              fontSize: 10
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: value => (value).toFixed(1)
          },
          max: Math.max(...values) * 1.2
        },
        series: [
          {
            name: '权重分布',
            type: 'bar',
            barWidth: '50%',
            data: data.map(item => ({
              value: item.value,
              itemStyle: item.itemStyle
            })),
            label: {
              show: true,
              position: 'top',
              formatter: (params) => (params.value).toFixed(3)
            }
          }
        ]
      };
      this.chart.setOption(option);
    },
    initScoreChart() {
      if (this.scoreChart) {
        this.scoreChart.dispose();
      }
      this.scoreChart = echarts.init(this.$refs.scoreChart);
      this.updateScoreChart();
    },
    updateScoreChart() {
      if (!this.scoreChart) return;
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: this.scoreChartData.map(item => item.name)
        },
        series: [
          {
            name: '各类指标得分',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.scoreChartData
          }
        ]
      };
      
      this.scoreChart.setOption(option);
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize();
      }
      if (this.scoreChart) {
        this.scoreChart.resize();
      }
    },
    getReport() {
      if (!this.hasItems) {
        return;
      }
      request_({
        url: "/apt/vendorSearch",
        params: {
          startDate: "",
          endDate: "",
          vendorCountry: "",
          aptCountry: "",
          vendorName: "",
          pageNum: "",
        }
      }).then((res) => {
        console.log(res.data.data.dataList);
        this.reportList = res.data.data.dataList || [];
        if (this.reportList.length > 10) {
          this.reportList = this.reportList.slice(0, 10);
        }
      }).catch(error => {
        console.error("获取报告列表失败:", error);
      }).finally(() => {
        this.isLoading = false;
      });
    },
    formatDate(dateString) {
      if (!dateString) return '未知日期';
      
      try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      } catch (e) {
        return dateString;
      }
    },
    getTimelineItemType(index) {
      const types = ['primary', 'success', 'warning', 'danger'];
      return types[index % types.length];
    },
    viewReportDetail(report) {
      this.selectedReport = report;
      this.dialogVisible = true;
    },
    handleCloseDialog() {
      this.dialogVisible = false;
      this.selectedReport = null;
    }
  }
}
</script>

<style scoped>
.evaluation-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  display: flex;
  flex: 1;
  margin: 10px;
  gap: 10px;
  height: calc(100% - 60px);
  overflow: hidden;
}

.left-area {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.right-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.right-top-area {
  flex: 1;
}

.right-bottom-area {
  flex: 1;
}

.area-content {
  height: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.area-content h3 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  flex-shrink: 0;
}

.weight-distribution {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-top: 4%;
}

.weight-chart-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.weight-chart {
  flex: 1;
  width: 100%;
  height: calc(100% - 35px);
  min-height: 200px;
}

.score-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.total-score-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 30%;
  padding: 10px;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 10px;
}

.score-excellent { color: #67C23A; } /* 绿色 - 优秀 */
.score-good { color: #409EFF; }      /* 蓝色 - 良好 */
.score-medium { color: #E6A23C; }    /* 黄色 - 中等 */
.score-poor { color: #F56C6C; }      /* 红色 - 较差 */

.score-label {
  font-size: 16px;
  color: #606266;
}

.refresh-btn {
  margin-top: 15px;
}

.score-chart-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 70%;
}

.score-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.no-data {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.report-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: calc(100% - 35px);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 5px;
}

.report-header span {
  font-weight: bold;
  color: #303133;
}

.report-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 5px;
  scrollbar-width: thin;
  scrollbar-color: #909399 #f4f4f5;
  height: 100%;
}

.report-content::-webkit-scrollbar {
  width: 6px;
}

.report-content::-webkit-scrollbar-track {
  background: #f4f4f5;
  border-radius: 3px;
}

.report-content::-webkit-scrollbar-thumb {
  background: #909399;
  border-radius: 3px;
}

.report-content::-webkit-scrollbar-thumb:hover {
  background: #606266;
}

.report-card {
  margin-bottom: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-title {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
}

.report-subtitle {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-tags {
  margin-bottom: 5px;
}

.report-tags .el-tag {
  margin-right: 5px;
}

.report-actions {
  text-align: right;
}

.report-loading {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

:deep(.el-timeline) {
  padding-left: 10px;
  margin: 0;
}

/* 调整 el-timeline 样式 */
:deep(.el-timeline-item__node) {
  left: 0;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 20px;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}

:deep(.el-card__body) {
  padding: 12px;
}
</style>