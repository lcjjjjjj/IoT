<template>
  <div >
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
              <div id="mainbox1" style="height: 80%; width: 100%; padding-bottom: 50px;"></div>
              <div id="mainbox2" style="height: 80%; width: 100%; padding-bottom: 50px;"></div>
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
export default{
  data() {
    return {
      options: [],
      value: null,
      title: '信息统计',
      desc: '主要展示个功能模块的准确率信息以及，知识抽取模块中实体和关系的统计信息。',
      activeName: 'first',
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
          bottom: '3%',
          containLabel: true
        },
        xAxis:[
          {
            type:'category',
            data: [],
            axisTick: {
              alignWithLabel:true
            }
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
          left: 'center'
        },
        tooltip:{
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series:[
          {
            name: 'relation type',
            type: 'pie',
            radius: '50%',
            data: [],
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
    }
  },
  mounted(){
      // this.showbar(),
      // this.showtotal()
  },
  components: {
    Panel
  },
  methods:{
    showtotal() {
      request({
        url: 'InfoAnalys/page',
        method: 'post',
        data: {
          
        }
        
      }).then((res) => {
        console.log(res);
        var sourceName = [];
        this.options = [];
        for (var i = 0; i < res.data.list.length; i++) {
          if (sourceName.indexOf(res.data.list[i].datasourceName) == -1) {
            sourceName.push(res.data.list[i].datasourceName)
          }
        }
        for (var i = 0; i < sourceName.length; i++) {
          this.options.push({
            value: i.toString(),
            label: sourceName[i]
          })
        }
        // show total table
        var xlabel = [1,2,3,4,5,6]
        var ylabel = [1,2,3,4,5,6]
        var pielabel = [
          { value: 1048, name: 'Search Engine' },
          { value: 735, name: 'Direct' },
          { value: 580, name: 'Email' },
          { value: 484, name: 'Union Ads' },
          { value: 300, name: 'Video Ads' }
        ]
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
          "datasourceName": this.options[value].label
        }
      }).then((res) => {
        console.log(res,"res")
        var xlabel = []
        var ylabel = []
        var pielabel = []
        for (var i=0;i<res.data.list.length;i++){
          if(res.data.list[i].type === '1'){
            xlabel.push(res.data.list[i].entityEdgeCatogery)
            ylabel.push(res.data.list[i].count)
          }
          else if(res.data.list[i].type === '2'){
            pielabel.push({
              value: res.data.list[i].count,
              name: res.data.list[i].entityEdgeCatogery
            })
          }
        }
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

 
</script scoped>

<style scoped>
.display-area {
  height: 748px;
  margin-top: 6px;
}

.select-area {
  display: flex;
  align-items: center;
}

.table-area {
  display: flex;
  height: 716px;
  margin-top: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.el-tab-pane {
  height: 760px;
}

.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
}

</style>