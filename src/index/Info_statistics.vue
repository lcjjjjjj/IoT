<template>
  <div class="container">
    <Panel :title="title" :desc="desc" />
    <div class="display-area">
      <template>
        <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
          <el-tab-pane label="指标统计" name="first">
            <el-row :gutter="20">
              <el-col :span="12"><div class="grid-content bg-purple">
                <p style="padding-bottom: 10px;">关系抽取指标：</p>
                <el-table
                :data="tableData"
                border
                style="width: 100%">
                <el-table-column
                  prop="precision"
                  label="Precision">
                </el-table-column>
                <el-table-column
                  prop="recall"
                  label="Recall">
                </el-table-column>
                <el-table-column
                  prop="f1"
                  label="F1 score">
                </el-table-column>
                </el-table>
              </div></el-col>
              <el-col :span="12"><div class="grid-content bg-purple">
                <p style="padding-bottom: 10px;">实体链接指标：</p>
                <el-table
                :data="tableData2"
                border
                style="width: 100%">
                <el-table-column
                  prop="precision"
                  label="Precision">
                </el-table-column>
                <el-table-column
                  prop="recall"
                  label="Recall">
                </el-table-column>
                <el-table-column
                  prop="f1"
                  label="F1 score">
                </el-table-column>
                </el-table>
              </div></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><div class="grid-content bg-purple">
                <p style="padding-bottom: 10px;">知识推理指标：</p>
                <el-table
                :data="tableData3"
                border
                style="width: 100%">
                <el-table-column
                  prop="precision"
                  label="Precision">
                </el-table-column>
                <el-table-column
                  prop="recall"
                  label="Recall">
                </el-table-column>
                <el-table-column
                  prop="f1"
                  label="F1 score">
                </el-table-column>
                </el-table>
              </div></el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="抽取信息统计" name="second">
            <div class="select-area">
              <p style="padding-right: 10px;">数据源:</p>
              <el-select v-model="value"   placeholder="总览"  @change="handleChange">
                <el-option 
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="table-area">
              <div id="mainbox1"></div>
              <div id="mainbox2"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>
  </div>
</template>

<script>
import { request } from '../components/network';
import Panel from '../components/Panel.vue';
import entitiesData from '../assets/result.json'
import relationsData from '../assets/re_result.json'
export default{
  data() {
    return {
      options: [],
      value: null,
      title: '信息统计',
      desc: '主要展示个功能模块的准确率信息以及，知识抽取模块中实体和关系的统计信息。',
      activeName: 'first',
      totalEntities: {'url': 1088, 'sample': 8962, 'component': 33100, 'organization': 2694, 'product': 33594, 'event': 4305, 'action': 18088, 'enterprise': 1953, 'vulnerability': 70983, 'ip': 493, 'domain': 869, 'weakness': 9353},
      totalRelations: {'download': 749, 'access': 1170, 'same_organization_intelligence': 3713, 'execute': 38655, 'exploit': 14400, 'target_of': 22098, 'alias': 5859, 'intelligence_contain': 7779, 'call': 2103, 'invade': 19676, 'influence': 75747, 'storage': 109, 'perform': 600, 'have': 42472, 'lead_to': 40904, 'related_to': 67, 'inverse_query': 105, 'analysis': 183, 'related_domain': 191, 'consist_of': 39574, 'similar_to': 2094, 'production_of': 7949, 'belong_to': 113, 'same_organization_event': 693, 'same_network_segment': 247, 'associate': 26, 'outside_chain': 24, 'subdomain': 146, 'upload': 125, "certify": 293, "isolate": 378},
      entitiesData: entitiesData,
      relationsData: relationsData,
      chartData: {
        title:{
          text: "实体类型统计",
          left: "center"
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis:[
          {
            type:'category',
            data: [],
            axisTick: {
              alignWithLabel:true
            },
            axisLabel: {interval:0, rotate: 30}
          }
        ],
        yAxis: [
          {
            type:'value'
          }
        ],
        series:[
          {
            name:'count',
            type:'bar',
            barWidth:'60%',
            data: []
          }
        ]
      },
      pieData: {
        title: {
          text: '关系类型统计',
          left: 'center',
        },
        tooltip:{
          trigger: 'item',
        },
        legend: {
          // orient: 'horizontal',
          bottom: '0%',
          left: 'center',
          orient: 'horizontal'
        },
        grid: {
          top: '10%',
          bottom: '10%'
        },
        series:[
          {
            name: 'relation type',
            type: 'pie',
            radius: '50%',
            center: ['50%', '40%'],
            data: [],
            itemStyle: {
              borderRadius: 4
            },
            label: {
              show: true,
              position: 'outside',
              margin: 5
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      },
      tableData:[
        {
          precision: '0.845',
          recall: '0.828',
          f1: '0.836'
        }
      ],
      tableData2:[
        {
          precision: '0.832',
          recall: '0.813',
          f1: '0.823'
        }
      ],
      tableData3:[
        {
          precision: '0.821',
          recall: '0.838',
          f1: '0.829'
        }
      ]
    }
  },
  mounted(){
      // this.showbar(),
      // this.showtotal()
      this.initResizeListener()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  components: {
    Panel
  },
  methods:{
    createData(entitiesData,relationsData) {
      var xlabels = Object.keys(entitiesData)
      var ylabels = Object.values(entitiesData)
      // console.log(xlabels,ylabels)
      var pielabels = new Array
      for(var index in Object.keys(relationsData)){
        // console.log(Object.keys(relationsData)[index])
        pielabels.push({'value': relationsData[Object.keys(relationsData)[index]],'name': Object.keys(relationsData)[index]})
      }
      return {'xlabel': xlabels, 'ylabel': ylabels, 'pielabel': pielabels}
    },
    initResizeListener() {
      window.addEventListener('resize', this.handleResize)
    },
    handleResize() {
      if (this.chartDom && this.chartDom2) {
        this.$echarts.getInstanceByDom(this.chartDom).resize();
        this.$echarts.getInstanceByDom(this.chartDom2).resize();
      }
    },
    createCategoryData(category) {
      var xlabels = Object.keys(this.entitiesData[category])
      var ylabels = Object.values(this.entitiesData[category])
      // console.log(category)
      // console.log(xlabels,ylabels)
      var pielabels = new Array
      for (var index in Object.keys(this.relationsData[category])){
        pielabels.push({'value': this.relationsData[category][Object.keys(this.relationsData[category])[index]],'name': Object.keys(this.relationsData[category])[index]})
      }
      console.log({'xlabel': xlabels, 'ylabel': ylabels, 'pielabel': pielabels})
      return {'xlabel': xlabels, 'ylabel': ylabels, 'pielabel': pielabels}
    },
    showtotal() {
      request({
        url: 'InfoAnalys/page',
        method: 'post',
        data: {
          
        }
        
      }).then((res) => {
        console.log(res);
        console.log(this.entitiesData,this.relationsData)
        for (var index in Object.keys(this.entitiesData)) {
          this.options.push({
            value: index.toString(),
            label: Object.keys(this.entitiesData)[index]
          })
        }
        var totalInfo = this.createData(this.totalEntities,this.totalRelations)
        // console.log(totalInfo)
        var xlabel = totalInfo['xlabel']
        var ylabel = totalInfo['ylabel']
        var pielabel = totalInfo['pielabel']
        this.chartData.xAxis[0].data = xlabel
        this.chartData.series[0].data = ylabel
        this.chartDom = document.getElementById('mainbox1');
        
        var myChart =this.$echarts.init(this.chartDom);
        this.chartData && myChart.setOption(this.chartData);

        this.pieData.series[0].data = pielabel
        this.chartDom2 = document.getElementById('mainbox2');
        
        var myChart2 = this.$echarts.init(this.chartDom2)
        this.pieData && myChart2.setOption(this.pieData)
      })
    },
    handleClick(tab, event) {
      console.log(tab.name, event);
      if (tab.name === 'first') {
        if (this.$echarts.getInstanceByDom(this.chartDom) && this.$echarts.getInstanceByDom(this.chartDom2)){
          this.$echarts.dispose(this.chartDom)
          this.$echarts.dispose(this.chartDom2)
        }
      }
      if (tab.name === 'second') {
        this.value=null;
        this.showtotal()
      }
    },
    handleChange(value){
      console.log(value)
      if (this.$echarts.getInstanceByDom(this.chartDom) && this.$echarts.getInstanceByDom(this.chartDom2)){
        this.$echarts.dispose(this.chartDom)
        this.$echarts.dispose(this.chartDom2)
      }
      this.showSource(value)
      
    },
    showSource(value) {
      request({
        url: "InfoAnalys/page",
        method: "post",
        data: {
          // "datasourceName": this.options[value].label
          "datasourceName": 'cve'
        }
      }).then((res) => {
        console.log(res,"res")
        var category = this.options[value].label
        var infoData = this.createCategoryData(category)
        console.log(infoData)
        var xlabel = infoData['xlabel']
        var ylabel = infoData['ylabel']
        var pielabel = infoData['pielabel']
        this.chartData.xAxis[0].data = xlabel
        this.chartData.series[0].data = ylabel
        this.chartDom = document.getElementById('mainbox1');
        
        var myChart =this.$echarts.init(this.chartDom);
        this.chartData && myChart.setOption(this.chartData);

        this.pieData.series[0].data = pielabel
        this.chartDom2 = document.getElementById('mainbox2');
        
        var myChart2 = this.$echarts.init(this.chartDom2)
        this.pieData && myChart2.setOption(this.pieData)
      })
    }
  }
} 
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.display-area {
  flex: 1;
  /* padding left and right */
  padding: 0 1%;
  overflow: hidden;
}

.select-area {
  height: 40px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.table-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100%-60px);
  margin: 0;
  padding: 20px 0;
}

#mainbox1, #mainbox2 {
  width: 100%;
  height: 100%;
  min-height: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.el-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.el-tabs__content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.el-tab-pane {
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
}

.el-row {
  margin-bottom: 20px;
}

.grid-content {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  height: 100%;
}

</style>