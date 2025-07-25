<template>
  <div>
    <Panel :title="title" :desc="desc" />
    <el-dialog
      title="指标测试中..."
      :visible.sync="dialogVisible"
      width="70%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-row>
        <el-col :span="24" style="text-align: right; margin-bottom: 10px;">
          <el-button 
            type="text" 
            @click="isLogExpanded = !isLogExpanded"
            :icon="isLogExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
          >
            {{ isLogExpanded ? '收起日志' : '展开日志' }}
          </el-button>
        </el-col>
      </el-row>
      
      <!-- 使用 v-show 控制日志区域显示/隐藏 -->
      <el-collapse-transition>
        <el-card v-show="isLogExpanded">
          <div class="log-container">
            <pre class="log-content">{{ logContent }}</pre>
          </div>
        </el-card>
      </el-collapse-transition>
      <div slot="footer" class="dialog-footer">
        <el-button 
          type="danger" 
          @click="() => {dialogVisible = false; handleTestCompletion()}"
          v-show="!isTestRunning"
        >
          结束测试
        </el-button>
      </div>
    </el-dialog>
    <div class="button-area">
      <div class="left-buttons">
        <el-upload
          class="upload-button"
          action="http://175.6.159.90:21906/wlwapi/invokeNlp2"
          :limit="1"
          :before-upload="beforeUpload"
          :on-success="handleSuccess"
          :file-list="fileList"
        >
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </div>
      <div class="right-buttons">
        <el-upload
          class="metrics-button"
          action="http://175.6.159.90:21906/wlwapi/uploadTestData"
          :limit="1"
          :before-upload="beforeTestUpload"
          :on-success="handleTestSuccess"
          :file-list="testFileList"
          :data="testUploadData"
        >
          <el-button size="small" type="warning">指标测试</el-button>
        </el-upload>
      </div>
    </div>
    <div class="display-area">
      <div
        id="mainbox"
        style="width: 80%; height: 100%;"
      ></div>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="id">
          <el-input
            v-model="form.id"
            placeholder="点击左侧节点将显示详情"
          ></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input
            v-model="form.name"
            placeholder="点击左侧节点将显示详情"
          ></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-input
            v-model="form.type"
            placeholder="点击左侧节点将显示详情"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { request } from "../components/network";
import { Loading } from "element-ui";
import Panel from "../components/Panel.vue";
import { type } from "jquery";
export default {
  data() {
    return {
      data_1_edges: [],
      data_1_vertexs: [],
      mainbox_chart: null,
      title: "关系抽取",
      desc: "关系抽取，上传文件，从文本中抽取实体和关系",
      value: "请选择文件",
      file: null,
      loadingInstance: null,
      fileList: [],
      testFileList: [], // 新增测试文件列表
      testUploadData: {type: 1}, // 新增测试上传数据
      form: {},
      category: [{name: "action", itemStyle: {color: "#409EFF"}},{name: "component", itemStyle: {color: "#606266"}},{name: "domain", itemStyle: {color: "#311256"}},{name: "enterprise"},{name: "event"},{name: "ip"},{name: "organization"},{name: "product"},{name: "sample"},{name: "url"},{name: "vulnerability"},{name: "weakness"},],
      dialogVisible: false,        // 控制等待框显示
      logContent: "",              // 日志内容
      isLogExpanded: false,        // 日志区域是否展开
      logTimer: null,              // 日志轮询定时器
      isTestRunning: false,        // 测试是否正在进行
    };
  },
  components: {
    Panel
  },
  mounted() {
    // this.showExtract();
  },
  methods: {
    // onClick() {
    //   this.form = {'id': '123', 'name': 'test'}
    // },
    createNodes(vertexs) {
      var nodes = []
      for (var i = 0; i < vertexs.length; i++) {
        nodes.push({
          'id': vertexs[i].id,
          'name': vertexs[i].name,
          'type': vertexs[i].type,
          'category': this.category.findIndex(item => item.name == vertexs[i].type)
        })
      }
      return nodes
    },
    createEdges(ex_edges) {
      var edges = []
      for (var i = 0; i < ex_edges.length; i++) {
        edges.push({
          'source': ex_edges[i].src,
          'target': ex_edges[i].dst,
          'name': ex_edges[i].edgename
        })
      }
      return edges
    },
    handleSuccess(response) {
      this.$nextTick(() => {
        this.loadingInstance.close()
      })
      console.log(response)
      // this.showExtract();
      this.mainbox_chart = this.$echarts.init(
        document.getElementById("mainbox")
      )
      this.createNodes(response.data.vertexs)
      let option = {
        title: {
          text: "实体关系抽取",
          top: "top",
          left: "left",
        },
        legend: {
          top: "bottom",
        },
        tooltip: {
          trigger: "item",
          enterable: true,
          formatter: function (params) {
            if(params.dataType == 'edge') {
              return "name: " + params.data.name
            }
            else {
              return (
                "ID:" +
                params.data.id +
                "<br/>" +
                "名称:" +
                params.data.name +
                "<br/>" +
                "类型:" +
                params.data.type +
                "<br/>"
              )
            }
          }
        },
        animationDuration: 500,
        animationDurationUpdate: 250,
        series:[
          {
            name: "kg",
            type: "graph",
            layout: "force",
            force: {
              repulsion: 100,
              edgeLength: 50
            },
            data: this.createNodes(response.data.vertexs),
            links: this.createEdges(response.data.edges),
            categories: this.category,
            symbolSize: 15,
            roam: true,
            symbol: "circle",
            label: {
              show: true,
              position: "right",
              formatter: "{b}",
            },
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [4, 10],
            lineStyle: {
              show: true,
              color: "#000",
            },
            edgeLabel: {
              show: true,
              formatter: function (params) {
                console.log(params)
                return params.data.name
              },
              textStyle: {
                fontSize: 12
              }
            },
            emphasis: {
              focus: "adjacency",
              lineStyle: {
                width: 10
              }
            },
            // itemStyle: {
            //   color: function (params) {
            //     return "#6495ED"
            //   }
            // }
          }
        ]
      }
      this.mainbox_chart.setOption(option)
      this.mainbox_chart.on('click',(params) => {
        console.log(params)
        if(params.dataType == 'node'){
          this.form = params.data
        }
        console.log(this.form)
      })
    },
    beforeUpload() {
      this.loadingInstance = Loading.service({target: document.getElementById('mainbox')})
      // 检查文件合法性或对不同文件进行不同处理
    },
    beforeTestUpload(file) {
      // 校验文件类型：仅允许 .json 文件
      const isValidType = file.name.toLowerCase().endsWith('.json');

      if (!isValidType) {
        this.$message.error('仅支持上传 JSON 格式的文件');
        return false; // 阻止上传
      }
      
      let fileReader = new  FileReader();

      fileReader.readAsText(file)
      fileReader.onload = () => {
        const content = fileReader.result;
        if(content.match(/entities/)!==null && content.match(/relations/)!==null && content.match(/text/)!==null){
          this.loadingInstance = Loading.service({ target: document.getElementById('mainbox') });
          console.log('准备上传测试文件');
          
          // 初始化日志状态
          this.dialogVisible = true;
          this.logContent = "开始指标测试...\n";
          this.isTestRunning = true;
          this.isLogExpanded = true;

          this.$message({
            message: '正在准备测试文件...',
            type: 'info'
          });

          return true; // 允许上传
        } else {
          this.$message.error('文件格式错误');
          return false;
          this.fileList = [];
        }
      }

      
    },
    handleTestSuccess() {
      this.$nextTick(() => {
        this.loadingInstance.close()
      })
      
      request({
        url: "wlwapi/dataTest",
        method: "post",
        params: {
          type: 1
        }
      }).then((response) => {
        console.log(response, "response");
        if (response.code === 0 && response.message.length > 0) {
          this.handleTestCompletion()
          this.$message({
            message: '指标测试完成',
            type: 'success'
          });
          const message = response.message
          //用','分割字符串
          const metrics = message.split(',');
          console.log(metrics, "metrics");
          // 显示测试结果
          this.$alert(`
            测试结果：
            准确率: ${metrics[0] || 'N/A'}
            召回率: ${metrics[1] || 'N/A'}
            F1值: ${metrics[2] || 'N/A'}
          `, '指标测试结果', {
            dangerouslyUseHTMLString: true
          });
        } else {
          this.handleTestCompletion()
          this.$message({
            message: '指标测试失败: ' + (response.message || '未知错误'),
            type: 'error'
          });
        }
      })
      this.startLogPolling()
    },
    startLogPolling() {
      if (this.logTimer){
        clearInterval(this.logTimer);
      }
      this.logTimer = setInterval(() => {
        if(!this.isTestRunning) {
          return;
        }
        this.fetchLogs();
      },1000)
    },
    fetchLogs() {
      request({
        url: "wlwapi/dataTest",
        method: "post",
        params: {
          type: 4,
        }
      }).then((response) => {
        if (response.code === 0 && response.message){
          const message = response.message
          //replace <br> with /n
          this.logContent = message.replace(/<br>/g,"\n")
          this.$nextTick(() => {
            const container = this.$el.querySelector('.log-container');
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          });
        }
      })
    },
    handleTestCompletion() {
      // 停止轮询
      clearInterval(this.logTimer);
      this.logTimer = null;
      this.isTestRunning = false;
    },
  },
  beforeDestroy() {
    // 清理定时器
    if (this.logTimer) {
      clearInterval(this.logTimer);
      this.logTimer = null;
    }
  },
};
</script>

<style scoped>
.button-area {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.left-buttons {
  flex: 1;
}

.right-buttons {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.test-button {
  margin-left: 15px;
}

.metrics-button {
  margin-left: 15px;
}

.display-area {
  margin-top: 20px;
  display: flex;
  align-items: center;
  height: 660px;
}

.log-container {
  height: 400px; /* 固定高度 */
  overflow-y: auto;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Courier New', monospace;
  padding: 10px;
  border-radius: 4px;
  /* 移除高度过渡效果 */
}

.log-content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

.dialog-footer {
  text-align: center;
}
</style>