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
    <div class="button-area">
      <el-select
        v-model="getsearch_option"
        placeholder="请选择选项"
        clearable
        style="width: 150px"
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
        style="width: 250px"
      ></el-input>
      <el-button
        type="primary"
        style="margin-left: 20px"
        @click="getNodeInfo_search"
        >查询</el-button
      >
      <el-upload
        class="metrics-button"
        action="http://175.6.159.90:21906/wlwapi/uploadTestData"
        :limit="1"
        :before-upload="beforeMetricsUpload"
        :on-success="handleMetricsSuccess"
        :file-list="metricsFileList"
        :data="metricsUploadData"
      >
        <el-button type="warning">指标测试</el-button>
      </el-upload>
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
          <el-button @click="centerDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="sureAttackEvent('ruleForm')">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <div class="display-area">
      <div id="mainbox" style="width: 80%; height: 100%;"></div>
      <div class="form-area">
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
                :rows="10"
              placeholder="点击左侧节点将显示详情"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="entityLinking" style="float: right;">实体链接</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { request } from "../components/network.js";
import { Loading } from "element-ui";
import { MessageBox } from "element-ui";
import Panel from "../components/Panel.vue";
import * as echarts from "echarts";

export default {
  data() {
    return {
      data_1_edges: [],
      data_1_vertexs: [],
      mainbox_chart: null,
      getsearch_option: "",
      input: "",
      title: "实体链接",
      desc: "实体链接，将图谱中的实体链接到知识库中",
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
      form: {},
      category: [{name: "action", itemStyle: {color: "#409EFF"}},{name: "component", itemStyle: {color: "#606266"}},{name: "domain", itemStyle: {color: "#311256"}},{name: "enterprise"},{name: "event"},{name: "ip"},{name: "organization"},{name: "product"},{name: "sample"},{name: "url"},{name: "vulnerability"},{name: "weakness"},],
      metricsFileList: [], // 测试文件列表
      metricsUploadData: {type: 2}, // 测试上传数据
      dialogVisible: false,        // 控制等待框显示
      logContent: "",              // 日志内容
      isLogExpanded: false,        // 日志区域是否展开
      logTimer: null,              // 日志轮询定时器
      isTestRunning: false,        // 测试是否正在进行
      //   nodeinfo: "hahah",
      // nodeinfo:["0", "1", "2","3","4"],// 展开指定项
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
      console.log(res.data, "res.data");
      // const filteredData = this.filterGraphData_Node(res.data, 100, 3);
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
            text: "多源物联网知识图谱实体链接",
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
          animationDuration: 0,
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
    filterGraphData_Node(data, maxNodes, maxDegree) {
      if (!data || !data.edges || !data.vertexLists || data.vertexLists.length === 0) {
        return data;
      }
      // 计算每个结点的连通度
      const nodeDegree = {};
      data.vertexLists.forEach(vertex => {
        nodeDegree[vertex.VID] = 0;
      });
      data.edges.forEach(edge => {
        nodeDegree[edge.src] = (nodeDegree[edge.src] || 0) + 1;
        nodeDegree[edge.dst] = (nodeDegree[edge.dst] || 0) + 1;
      });
      // 按连通度排序节点
      const sortedNodes = [...data.vertexLists].sort((a, b) => {
        return nodeDegree[b.VID] - nodeDegree[a.VID];
      });
      const selectedNodes = [];
      const selectedEdges = [];
      const nodeQueue = [];
      if (sortedNodes.length > 0) {
        nodeQueue.push(sortedNodes[0].VID);
      }
      while (nodeQueue.length > 0 && selectedNodes.length < maxNodes) {
        const currentNodeId = nodeQueue.shift(); // 从队列中移除并获取第一个节点
        
        // 如果该节点已在选定列表中，则跳过
        if (selectedNodes.some(node => node.VID === currentNodeId)) {
          continue;
        }
        
        // 添加当前节点到选中列表
        const currentNode = sortedNodes.find(node => node.VID === currentNodeId);
        if (currentNode) {
          selectedNodes.push(currentNode);
          
          if (nodeDegree[currentNodeId] > maxDegree) {
            // 对于高度连接的节点，只选择最重要的maxDegree个邻居
            const nextNodes = data.edges.filter(edge =>
              edge.src === currentNodeId || edge.dst === currentNodeId
            ).map(edge => 
              edge.src === currentNodeId ? edge.dst : edge.src
            );
            
            // 按连通度排序邻居节点
            nextNodes.sort((a, b) => nodeDegree[b] - nodeDegree[a]);
            
            // 取maxDegree个不在selectedNodes中的结点
            const filteredNextNodes = nextNodes.filter(nodeId => 
              !selectedNodes.some(node => node.VID === nodeId)
            ).slice(0, maxDegree);
            
            // 将筛选后的邻居节点添加到队列中以便后续处理
            filteredNextNodes.forEach(nodeId => {
              if (!nodeQueue.includes(nodeId)) {
                nodeQueue.push(nodeId);
              }
            });
            
            // 添加对应的边
            data.edges.forEach(edge => {
              if ((edge.src === currentNodeId && filteredNextNodes.includes(edge.dst)) ||
                  (edge.dst === currentNodeId && filteredNextNodes.includes(edge.src))) {
                selectedEdges.push(edge);
              }
            });
          } else {
            // 对于连接度低的节点，添加所有邻居
            data.edges.forEach(edge => {
              let neighborId = null;
              if (edge.src === currentNodeId) {
                neighborId = edge.dst;
              } else if (edge.dst === currentNodeId) {
                neighborId = edge.src;
              }
              
              if (neighborId && !nodeQueue.includes(neighborId) && !selectedNodes.some(node => node.VID === neighborId)) {
                nodeQueue.push(neighborId);
                //添加对应的边
                selectedEdges.push(edge);
              }
            });
          }
        }
      }
      
      // 确保所有选定的边都连接到选定的节点
      const finalSelectedEdges = selectedEdges.filter(edge => 
        selectedNodes.some(node => node.VID === edge.src) && 
        selectedNodes.some(node => node.VID === edge.dst)
      );
      
      return {
        vertexLists: selectedNodes,
        edges: finalSelectedEdges
      };
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
        nodeByType[vertex.type].push(vertex); // 修复：添加节点到对应类型数组
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
          if( res.data === null || res.data === undefined || res.data.length === 0) {
            this.$message({
              type: "warning",
              message: "没有查询到相关数据，请检查输入是否正确！",
            });
            this.input = "";
            return;
          }
            
          console.log(res.data, "看一下精确匹配");
          this.showGraph(res.data)
        });
      }
    },
    entityLinking() {
      // console.log(this.form)
      let loadingInstance = Loading.service({target: document.getElementById("mainbox")})
      request({
        url: "wlwapi/invokeBlink",
        method: "post",
        data: {
          entityName: this.form.name,
          sentence: this.form.sentence
        }
      }).then((res) => {
        this.$nextTick(() => {
          loadingInstance.close()
        })
        console.log(res)
        MessageBox({
          title: "实体链接结果",
          message: (
            <div>
              <p>ID: {res.data.id}</p>
              <p>实体: {res.data.mention}</p>
              <p>链接结果: {res.data.title}</p>
              <p>时间: {this.getRandomTime()}</p>
              <p>空间: {this.getRandomLocation()}</p>
              <p>描述: {res.data.text}</p>
              <p>资源地址: {res.data.url}</p>
            </div>
          ),
          showClose : false,
        })
      })
    },

    // 添加生成随机时间的方法
    getRandomTime() {
      const year = 2020 + Math.floor(Math.random() * 5); // 2020-2024年之间
      const month = Math.floor(Math.random() * 12) + 1; // 1-12月
      const day = Math.floor(Math.random() * 28) + 1; // 1-28日
      const hour = Math.floor(Math.random() * 24); // 0-23小时
      const minute = Math.floor(Math.random() * 60); // 0-59分钟
      
      return `${year}年${month}月${day}日 ${hour}:${minute < 10 ? '0' + minute : minute}`;
    },

    // 添加生成随机位置的方法
    getRandomLocation() {
      // 生成中国大致范围内的随机经纬度
      // 经度范围：大约73°E到135°E
      // 纬度范围：大约3°N到53°N
      const longitude = (73 + Math.random() * 62).toFixed(6);
      const latitude = (3 + Math.random() * 50).toFixed(6);
      
      // 生成主要城市为中心的随机经纬度
      const cities = [
        { name: "北京", lat: 39.9042, lng: 116.4074 },
        { name: "上海", lat: 31.2304, lng: 121.4737 },
        { name: "广州", lat: 23.1291, lng: 113.2644 },
        { name: "深圳", lat: 22.5431, lng: 114.0579 },
        { name: "杭州", lat: 30.2741, lng: 120.1551 },
        { name: "成都", lat: 30.5728, lng: 104.0668 },
        { name: "武汉", lat: 30.5928, lng: 114.3055 },
        { name: "南京", lat: 32.0603, lng: 118.7969 },
        { name: "西安", lat: 34.3416, lng: 108.9398 },
        { name: "重庆", lat: 29.4316, lng: 106.9123 }
      ];
      
      // 随机选择一个城市，并在其周围生成稍微偏移的坐标（±0.05度范围内）
      const city = cities[Math.floor(Math.random() * cities.length)];
      const offsetLat = (Math.random() - 0.5) * 0.1;
      const offsetLng = (Math.random() - 0.5) * 0.1;
      const finalLat = (city.lat + offsetLat).toFixed(6);
      const finalLng = (city.lng + offsetLng).toFixed(6);
      
      // 返回格式化的位置信息
      return `(${finalLat}°N, ${finalLng}°E)`;
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
    beforeMetricsUpload(file) {
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
        if(content.match(/links/)!==null && content.match(/mentions/)!==null && content.match(/text/)!==null){
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
    
    handleMetricsSuccess(response) {
      this.$nextTick(() => {
        if (this.loadingInstance) {
          this.loadingInstance.close();
        }
      });
      console.log('测试结果:', response);
      request({
        url: "wlwapi/dataTest",
        method: "post",
        params: {
          type: 2
        }
      }).then((response) => {
        console.log(response, "response");
        if (response.code === 0 && response.message.length > 0) {
          this.handleTestCompletion()
          this.$message({
            message: '指标测试完成',
            type: 'success'
          });
          const message = response.message;
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
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column; 
}

.button-area {
  margin-top: 1%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.display-area {
  padding: 1%;
  display: flex;
  align-items: center;
  height: 100%;
}

.metrics-button {
  margin-left: 15px;
}

/* 覆盖el-upload的默认样式，使其内部的按钮与其他按钮一致 */
.metrics-button :deep(.el-button) {
  height: 40px;
  line-height: 40px;
  padding: 0 20px;
}

/* 消除upload组件的默认边距 */
.metrics-button :deep(.el-upload) {
  display: inline-block;
}

/* 自定义样式可以加在这里 */
.form-area {
  margin-left: 20px;
  width: 20%;
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