<template>
  <div class="container">
    <Panel :title="title" :desc="desc"/>
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
        v-model="input"
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
      <el-button type="success" @click="addbutton"
        >JSON文件上传指引
      </el-button>
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
import { request } from "../src/components/network.js";
import { Loading } from "element-ui";
import { MessageBox } from "element-ui";
import Panel from "../components/Panel.vue";

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
      category: [{name: "action", itemStyle: {color: "#409EFF"}},{name: "component", itemStyle: {color: "#606266"}},{name: "domain", itemStyle: {color: "#311256"}},{name: "enterprise"},{name: "event"},{name: "ip"},{name: "organization"},{name: "product"},{name: "sample"},{name: "url"},{name: "vulnerability"},{name: "weakness"},]
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
      console.log(res.data)
      const filteredData = this.filterGraphData(res.data, 100);
      this.showGraph(filteredData);
    })
  },
  components: {
    Panel,
  },
  methods: {
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
    createNodes(vertexs) {
      var nodes = []
      for (var i = 0; i < vertexs.length; i++) {
        const categoryIndex = this.category.findIndex(item => item.name === vertexs[i].type);
        nodes.push({
          'id': vertexs[i].VID,
          'name': vertexs[i].name,
          'createTime': vertexs[i].createTime,
          'type': vertexs[i].type,
          'sentence': vertexs[i].sentence,
          'category': categoryIndex >= 0 ? categoryIndex : 0,
          'x': Math.random() * 100,
          'y': Math.random() * 100
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
    showGraph(res_data) {
      this.mainbox_chart = this.$echarts.init(
        document.getElementById("mainbox")
      );
      this.mainbox_chart.showLoading();

      const nodes = this.createNodes(res_data.vertexLists);
      const links = this.createEdges(res_data.edges);

      console.log(nodes)
      console.log(links)

      let option = {
        title: {
          text: "多源物联网知识图谱实体链接",
          top: "top",
          left: "left",
        },
        tooltip: {
          trigger: "item",
          enterable: true,
          formatter: (params) => {
            if(params.dataType == "edge") {
              return "关系: " + params.data.name;
            }
            else{
              return "ID: " + params.data.id + "<br/>" +
                "名称: " + params.data.name + "<br/>" +
                "创建时间: " + params.data.createTime + "<br/>" +
                "类型: " + params.data.type + "<br/>"
            }
          }
        },
        legend: {
          top: "bottom",
          data: this.category.map(item => item.name),
        },
        // animationDuration: 0,
        // animationDurationUpdate: 1500,
        // animationEasingUpdate: "quinticInOut",
        series:[
          {
            name: "知识图谱",
            type: "graph",
            layout: "force",
            force: {
              repulsion: 300,
              gravity: 0.1,
              edgeLength: 80,
              friction: 0.6,
              layoutAnimation: true,
            },
            data: nodes,
            links: links,
            categories: this.category,
            symbolSize: 20,
            roam: true,
            focusNodeAdjacency: true,
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 1,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
            label: {
              show: true,
              position: "right",
              formatter: "{b}",
              fontSize: 12
            },
            lineStyle: {
              width: 2,
              color: "source",
            },
            emphasis: {
              focus: "adjacency",
              lineStyle: {
                width: 5,
              }
            },
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [4, 10],
            edgeLabel: {
              show: true,
              fontSize: 10,
              formatter: (params) => {
                return params.data.name
              }
            },
            // itemStyle: {
            //   color: "#6495ED"
            // }
          }
        ]
      }
      this.mainbox_chart.hideLoading();
      this.mainbox_chart.setOption(option);
      this.mainbox_chart.on("click", (params) => {
        if(params.dataType == "node"){
          this.form = params.data
        }
      })
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
              <p>描述: {res.data.text}</p>
            </div>
          ),
          showClose : false,
        })
      })
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
}

.display-area {
  padding: 1%;
  display: flex;
  align-items: center;
  height: 100%;
}

</style>