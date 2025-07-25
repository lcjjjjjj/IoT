<template>
  <div class="container">
    <Panel :title="title" :desc="desc"/>
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
    <!-- 查询部分 -->
    <div class="button-area">
      <div class="search-control-group">
        <div class="search-group">
          <el-select
            v-model="getsearch_option"
            placeholder="请选择选项"
            clearable
            style="width: 110px"
          >
            <el-option
              v-for="item in options_item"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-input
            v-model.trim="input"
            clearable
            :disabled="this.getsearch_option !== '' ? false : true"
            @clear="return_AllNodes"
            style="width: 250px; margin: 0 10px;"
          ></el-input>
          <el-button
            type="primary"
            @click="getNodeInfo_search"
          >查询</el-button>
          
          <!-- 将上传和测试按钮移到这里 -->
          <el-upload
            class="metrics-button"
            action="http://175.6.159.90:21906/wlwapi/uploadTestData"
            :limit="1"
            :before-upload="beforeMetricsUpload"
            :on-success="handleMetricsSuccess"
            :file-list="metricsFileList"
            :data="metricsUploadData"
          >
            <el-button type="warning" class="action-button">指标测试</el-button>
          </el-upload>
        </div>
      </div>
      
      <!-- 推理控制部分 -->
      <div class="reasoning-controls">
        <div class="entity-selection">
          <span class="entity-label">头实体：</span>
          <el-input v-model="headEntity" disabled placeholder="请选择头实体" class="entity-input"></el-input>
          
          <el-button 
            class="switch-button" 
            icon="el-icon-refresh" 
            circle 
            @click="switchEntities"
            title="交换头尾实体"
          ></el-button>
          
          <span class="entity-label">尾实体：</span>
          <el-input v-model="tailEntity" disabled placeholder="请选择尾实体" class="entity-input"></el-input>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="getReasoning">推理</el-button>
          <el-button type="danger" @click="clearSelect">清空选择</el-button>
        </div>
      </div>
    </div>
    
    <!-- 上传对话框 -->
    <el-dialog
      title="上传JSON文件"
      :visible.sync="centerDialogVisible"
      width="50%"
      center
    >
      <div class="dialog-content">
        <el-upload
          class="upload-demo"
          ref="upload"
          action
          :auto-upload="false"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          accept="application/json"
          multiple
          :limit="1"
          :on-exceed="handleExceed"
          :on-change="fileChange"
        >
          <el-button
            size="small"
            type="primary"
            style="margin-left: 10px; margin-bottom: 10px"
          >点击上传JSON文件
          </el-button>
        </el-upload>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="sureAttackEvent('ruleForm')">确 定</el-button>
        </div>
      </div>
    </el-dialog>
    
    <!-- 显示区域 -->
    <div class="display-area">
      <div id="mainbox" class="graph-container"></div>
      <div class="form-area">
        <h3 class="form-title">节点详情</h3>
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
          <el-form-item label="创建时间">
            <el-input
              v-model="form.createTime"
              placeholder="点击左侧节点将显示详情"
            ></el-input>
          </el-form-item>
          <el-form-item label="类型">
            <el-input
              v-model="form.type"
              placeholder="点击左侧节点将显示详情"
            ></el-input>
          </el-form-item>
          <el-form-item label="来源">
            <el-input
              type="textarea"
              v-model="form.sentence"
              :rows="8"
              placeholder="点击左侧节点将显示详情"
            ></el-input>
          </el-form-item>
        </el-form>
        <div class="entity-buttons">
          <el-button type="primary" @click="addHead">设为头实体</el-button>
          <el-button type="primary" @click="addTail">设为尾实体</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { request } from "../components/network.js";
import { Loading, MessageBox } from "element-ui";
import Panel from "../components/Panel.vue";
import * as echarts from "echarts";
import { type } from "jquery";
  
export default {
  data() {
    return {
      data_1_edges: [],
      data_1_vertexs: [],
      mainbox_chart: null,
      getsearch_option: "",
      input: "",
      title: "知识推理",
      desc: "知识推理，可对两个节点之间的关系进行推理",
      options_item: [
        {
          value: 2,
          label: "节点ID",
        },
        {
          value: 0,
          label: "精确查找",
        },
        {
          value: 1,
          label: "模糊查找",
        },
      ],
      centerDialogVisible: false,
      fileraw: "",
      tableData: [],
      headEntity: "",
      tailEntity: "",
      form: {},
      category: [{name: "action", itemStyle: {color: "#409EFF"}},{name: "component", itemStyle: {color: "#606266"}},{name: "domain", itemStyle: {color: "#311256"}},{name: "enterprise"},{name: "event"},{name: "ip"},{name: "organization"},{name: "product"},{name: "sample"},{name: "url"},{name: "vulnerability"},{name: "weakness"},],
      metricsFileList: [], // 测试文件列表
      metricsUploadData: {type: 3}, // 测试上传数据，使用type: 3表示推理模块的测试
      dialogVisible: false,        // 控制等待框显示
      logContent: "",              // 日志内容
      isLogExpanded: false,        // 日志区域是否展开
      logTimer: null,              // 日志轮询定时器
      isTestRunning: false,        // 测试是否正在进行
    };
  },
  mounted() {
    request({
      url: "wlwapi/getTagNodes",
      method: "post",
      data: {
        tagName: "cve",
        "step": "1",
      }
    }).then((res) => {
      const filteredData = this.filterGraphData(res.data, 100);
      console.log(filteredData, "filteredData")
      this.showGraph(filteredData);
    })
  },
  components: {
    Panel,
  },
  methods: {
    parserGraph(res_data) {
      return new Promise((resolve) => {
        var graph = {
          type: "force",
          categories: [],
          nodes:[],
          links: []
        }
        // 统计节点的所有种类
        var categories = new Set()
        for (var i = 0; i < res_data.vertexLists.length; i++) {
          categories.add(res_data.vertexLists[i].type)
        }
        // 将Set转换为数组并添加到图的categories中
        graph.categories = Array.from(categories).map((category, index) => {
          return {
            name: category,
            keyword: {},
            base: category
          }
        });
        // 处理节点数据
        for (var i = 0; i < res_data.vertexLists.length; i++){
          var node = {
            name: res_data.vertexLists[i].name,
            value: 1,
            category: graph.categories.findIndex(item => item.name === res_data.vertexLists[i].type),
            vid: res_data.vertexLists[i].VID,
            ctime: res_data.vertexLists[i].createTime,
            sentence: res_data.vertexLists[i].sentence
          }
          graph.nodes.push(node)
        }
        //处理边数据
        for (var i = 0; i< res_data.edges.length; i++) {
          var srcNode = res_data.vertexLists[res_data.vertexLists.findIndex(item => item.VID === res_data.edges[i].src)].name
          var dstNode = res_data.vertexLists[res_data.vertexLists.findIndex(item => item.VID === res_data.edges[i].dst)].name
          var edge = {
            name: res_data.edges[i].edgename,
            source: graph.nodes.findIndex(item => item.name === srcNode),
            target: graph.nodes.findIndex(item => item.name === dstNode)
          }
          graph.links.push(edge)
        }
        resolve(graph)
      });
    },
    showGraph(res_data) {
      this.mainbox_chart = echarts.init(
        document.getElementById("mainbox")
      );
      this.mainbox_chart.showLoading();
      this.parserGraph(res_data).then(graph => {
        var nodes = graph.nodes.map((node, index) => {
          node.id = index;
          return node;
        })
        var links = graph.links
        this.mainbox_chart.hideLoading();
        console.log(Array.from(graph.categories).map((category, index) => {
              return category.name
            }))
        var option = {
          title: {
            text: "多源物联网知识图谱关系推理",
            top: "top",
            left: "left"
          },
          tooltip: {
            trigger: "item",
            enterable: true,
            formatter: (params) => {
              if (params.dataType === "edge") {
                return "关系: " + params.data.name;
              } else {
                return "ID: " + params.data.vid + "<br/>" +
                  "名称: " + params.data.name + "<br/>" + 
                  "创建时间: " + params.data.ctime + "<br/>" +
                  "类型: " + graph.categories[params.data.category].name;
              }
            }
          },
          legend: {
            data: graph.categories.map(category => category.name),
            top: "bottom",
            selectedMode: 'multiple',
            selector: true
          },
          animationDuration: 1500,
          animationEasingUpdate: 'quinticInOut',
          series: [
            {
              type: 'graph',
              layout: 'force',
              animation: false,
              label: {
                position: 'right',
                formatter: '{b}'
              },
              roam: true,
              draggable: true,
              data: nodes,
              categories: graph.categories,
              symbolSize: 15,
              label: {
                show: true,
                position: "right",
                formatter: "{b}",
                fontsize: 10
              },
              force: {
                edgeLength: [100,150],
                repulsion: 500,
                gravity: 0.4,
                layoutAnimation: true,
                initLayout: "circular",
                nodeRepulsion: (node1, node2) => {
                  // 如果是同一类别，减小斥力
                  if (node1.category === node2.category) {
                    return 0; // 同类别减小斥力
                  }
                  return 1000; // 不同类别增大斥力
                }
              },
              edges: links,
              edgeSymbol: ['arrow'],
              edgeSymbolSize: [4, 10],
              edgeLabel: {
                show: true,
                position: 'middle',
                formatter: (params) => {
                  return params.data.name;
                },
                fontSize: 8,
                align: 'center',
                verticalAlign: 'middle'
              },
              emphasis: {
                focus: 'adjacency',
                lineStyle: {
                  width: 5
                }
              },
              lineStyle: {
                curveness: 0.01,
                width: 1.5
              }
            }
          ]
        };
        this.mainbox_chart.setOption(option);
        this.mainbox_chart.on("click", (params) => {
          if (params.dataType === 'node') {
            this.form = {
              id: params.data.vid,
              name: params.data.name,
              createTime: params.data.ctime,
              type: graph.categories[params.data.category].name,
              sentence: params.data.sentence
            }
          }
        })
      })

    },
    filterGraphData(data, maxRelations) {
      if (!data || !data.edges || !data.vertexLists) {
        return data;
      }
      // 按类型对节点分组
      const nodeByType = {}
      data.vertexLists.forEach(vertex => {
        if (!nodeByType[vertex.type]) {
          nodeByType[vertex.type] = [];
        }
        nodeByType[vertex.type].push(vertex);
      });
      
      //对每种类型最多保留10个节点
      const maxNodesPerType = 10;
      let selectedVertices = [];
      Object.keys(nodeByType).forEach(type => {
        const vertices = nodeByType[type];
        if (vertices.length > maxNodesPerType) {
          for (let i = vertices.length -1 ; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [vertices[i], vertices[j]] = [vertices[j], vertices[i]];
          }
          selectedVertices = selectedVertices.concat(vertices.slice(0, maxNodesPerType));
        } else {
          selectedVertices = selectedVertices.concat(vertices);
        }
      });

      //获取选中节点的ID集合
      const selectedNodeIds = new Set(selectedVertices.map(vertex => vertex.VID));
      //筛选包含选中节点的边
      const selectedEdges = data.edges.filter(edge => 
        selectedNodeIds.has(edge.src) && selectedNodeIds.has(edge.dst)
      );
      // 如果边数量仍然太多，进一步限制
      let finalEdges = selectedEdges;
      if (selectedEdges.length > maxRelations) {
        // 按照关联节点的重要性排序边，确保重要节点的边被保留
        const edgeScores = selectedEdges.map(edge => {
          // 计算边的得分，可以基于节点的连接数等因素
          const srcCount = selectedEdges.filter(e => e.src === edge.src || e.dst === edge.src).length;
          const dstCount = selectedEdges.filter(e => e.src === edge.dst || e.dst === edge.dst).length;
          return { edge, score: srcCount + dstCount };
        });
        
        // 按分数降序排序
        edgeScores.sort((a, b) => b.score - a.score);
        
        // 取前maxRelations条边
        finalEdges = edgeScores.slice(0, maxRelations).map(item => item.edge);
      }
      
      // 重新获取所有边关联的节点ID
      const finalNodeIds = new Set();
      finalEdges.forEach(edge => {
        finalNodeIds.add(edge.src);
        finalNodeIds.add(edge.dst);
      });
      
      // 最终过滤出有效的节点集合
      const finalVertices = selectedVertices.filter(vertex => finalNodeIds.has(vertex.VID));
      
      return {
        vertexLists: finalVertices,
        edges: finalEdges
      };
    },
    getNodeInfo_search() {
      if (this.getsearch_option == 2) {
        request({
          url: "wlwapi/getGrahById",
          method: "post",
          data: {
            id: this.input,
          },
        }).then((res) => {
          this.showGraph(res.data)
        });
      } else {
        request({
          url: "wlwapi/getEdgeByNodeName",
          method: "post",
          data: {
            name: this.input,
            ambiguous: this.getsearch_option,
          },
        }).then((res) => {
          console.log(res.data, "看一下精确匹配");
          this.showGraph(res.data)
        });
      }
    },
    return_AllNodes() {
      request({
        url: "wlwapi/getTagNodes",
        method: "post",
        data: {
          tagName: "cve",
          "step": "1",
        }
      }).then((res) => {
        this.showGraph(res.data)
      })
    },
    addbutton() {
      this.centerDialogVisible = true;
    },

    sureAttackEvent() {
      const formData = new FormData();
      formData.append("file", this.fileraw);
      request({
        url: "wlwapi/uploadJsonFile",
        method: "post",
        data: formData,
      }).then((res) => {
        console.log(res.data, "res.data");
      });
    },
    handlePreview() {},
    handleRemove() {
      this.ruleForm.fileList = fileList;
    },
    beforeRemove(file) {
      console.log(file, "看一下file");
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    handleExceed() {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    fileChange(file) {
      // var reader = new FileReader() //新建一个FileReader
      // reader.readAsText(file.raw, 'UTF-8') //读取文件
      // console.log(reader,"打印一下reader");
      this.fileraw = file.raw;
      console.log(this.fileraw, "this.fileraw");
    },
    addHead() {
      this.headEntity = this.form.name
    },
    addTail() {
      this.tailEntity = this.form.name
    },
    clearSelect() {
      this.headEntity = ""
      this.tailEntity = ""
    },
    switchEntities () {
      let temp = this.headEntity
      this.headEntity = this.tailEntity
      this.tailEntity = temp
    },
    getReasoning() {
      console.log(this.headEntity, this.tailEntity)
      console.log("开始推理");
      let loadingInstance = Loading.service({target: document.getElementById("mainbox")})
      request({
        url: "wlwapi/invokeReason",
        method: "post",
        data: {
          entity1: this.headEntity,
          entity2: this.tailEntity,
        }
      }).then((res) => {
        this.$nextTick(() => {
          loadingInstance.close()
        })
        MessageBox({
          title: "推理结果",
          message: (
            <div>
              <p>头实体: {res.data.entity1}</p>
              <p>尾实体: {res.data.entity2}</p>
              <p>推理结果: {res.data.pred}</p>
            </div>
          )
        })
      })
    },
    beforeMetricsUpload(file) {
  // 校验文件类型：仅允许 .txt 文件
      const isValidType = file.name.toLowerCase().endsWith('.txt');

      if (!isValidType) {
        this.$message.error('仅支持上传 TXT 格式的文件');
        return false; // 阻止上传
      }

      let loadingInstance = Loading.service({ target: document.getElementById('mainbox') });
      this.loadingInstance = loadingInstance; // 保存加载实例以便后续关闭
      console.log('准备上传测试文件');

      this.dialogVisible = true;
      this.logContent = "开始指标测试...\n";
      this.isTestRunning = true;
      this.isLogExpanded = true;

      this.$message({
        message: '正在准备测试文件...',
        type: 'info'
      });

      return true; // 允许上传
    },
    handleMetricsSuccess(response) {
      this.$nextTick(() => {
        if (this.loadingInstance) {
          this.loadingInstance.close();
        }
      });
      request({
        url: "wlwapi/dataTest",
        method: "post",
        params: {
          type: 3
        }
      }).then((response) => {
        console.log(response)
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
/* 调整容器内边距，防止溢出 */
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 10px; /* 减小内边距 */
  box-sizing: border-box; /* 确保内边距不会增加总宽度 */
  overflow-x: hidden; /* 防止水平溢出 */
}

.el-input.is-disabled >>> .el-input__inner {
  color: #333;
  background-color: #f5f7fa;
}

/* 按钮区域样式改进 */
.button-area {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 10px; /* 减小间距 */
  width: 100%;
}

.search-control-group {
  display: flex;
  align-items: center;
  width: 100%;
  flex-wrap: wrap; /* 确保在小屏幕上可以换行 */
}

.search-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px; /* 减小间距 */
  width: 100%;
}

/* 确保输入框不会过宽 */
.search-group .el-input {
  max-width: 220px;
}

.reasoning-controls {
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

/* 操作按钮样式 */
.action-button {
  margin-left: 3px; /* 减小边距 */
}

/* 上传按钮样式优化 */
.metrics-button {
  display: inline-block;
  margin-left: 3px;
}

.metrics-button :deep(.el-upload) {
  display: inline-block;
}

.metrics-button :deep(.el-button) {
  height: 40px;
  line-height: 40px;
  padding: 0 15px; /* 减小内边距 */
}

/* 其余样式保持不变但调整宽度 */
.entity-selection {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px; /* 减小间距 */
}

.entity-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.entity-input {
  width: 140px; /* 减小宽度 */
}

.switch-button {
  margin: 0 3px; /* 减小边距 */
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 显示区域样式调整 */
.display-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  width: 100%;
}

.graph-container {
  width: 70%; /* 减小宽度比例 */
  height: 100%;
  border-right: 1px solid #ebeef5;
}

.form-area {
  width: 30%; /* 增加宽度比例 */
  padding: 10px;
  display: flex;
  flex-direction: column;
  background-color: #f9fafc;
  overflow-y: auto;
}

.form-title {
  margin-top: 0;
  margin-bottom: 8px;
  padding-bottom: 6px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}

/* 修复表单标签和输入框对齐问题 */
.form-area :deep(.el-form-item) {
  margin-bottom: 8px;
  display: flex;
  flex-direction: row; /* 改回行布局 */
  align-items: center; /* 垂直居中对齐 */
}

/* 调整标签样式 */
.form-area :deep(.el-form-item__label) {
  line-height: 30px;
  padding: 0;
  width: 70px !important; /* 固定标签宽度 */
  text-align: right; /* 标签右对齐 */
  margin-right: 12px; /* 标签与输入框的间距 */
}

/* 调整输入框容器样式 */
.form-area :deep(.el-form-item__content) {
  margin-left: 0 !important; /* 覆盖默认的左边距 */
  line-height: 30px;
  flex: 1; /* 输入框容器占据剩余空间 */
}

/* 调整表单整体布局 */
.form-area .el-form {
  width: 100%;
}

/* 保持输入框和文本域样式 */
.form-area :deep(.el-input__inner) {
  height: 30px;
  line-height: 30px;
}

.form-area :deep(.el-textarea__inner) {
  min-height: 70px !important;
}

/* 优化按钮区域的间距 */
.entity-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 6px;
}

/* 优化按钮大小 */
.entity-buttons .el-button {
  padding: 6px 12px;
  font-size: 12px;
}

/* 对话框内容样式 */
.dialog-content {
  padding: 8px;
}

.dialog-footer {
  text-align: right;
  margin-top: 15px;
}

.upload-demo {
  margin-bottom: 15px;
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