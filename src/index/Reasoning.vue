<template>
  <div class="container">
    <Panel :title="title" :desc="desc"/>
    <div class="button-area">
      <el-select
        v-model="getsearch_option"
        placeholder="请选择选项"
        clearable
        style="width: 100px"
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
      <el-button type="success" @click="addbutton"
        >JSON文件上传
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
      <el-button type="danger" @click="clearSelect" style="float: right; margin-left: 10px;">清空选择</el-button>
      <el-button type="primary" @click="getReasoning" style="float: right;">推理</el-button>
      <el-input v-model="tailEntity" disabled placeholder="请选择尾实体" style="float: right; width: 100px; padding-right: 10px;"></el-input>
      <p style="float: right; padding-top: 7px;">尾实体：</p>
      <el-button style="float: right; margin-right: 10px;" icon="el-icon-refresh" circle @click="switchEntities"></el-button>
      <el-input v-model="headEntity" disabled placeholder="请选择头实体" style="float: right; width: 100px; padding-right: 10px;"></el-input>
      <p style="float: right; padding-top: 7px;">头实体：</p>
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
        <el-button type="primary" @click="addTail" style="float: right;">尾实体</el-button>
        <el-button type="primary" @click="addHead" style="float: right; margin-right: 10px;">头实体</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { tail } from "shelljs";
import webkitDep from "../assets/graph.json";
import { request } from "../components/network.js";
import { Loading, MessageBox } from "element-ui";
import Panel from "../components/Panel.vue";

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
      this.showGraph(res.data)
    })
  },
  components: {
    Panel,
  },
  methods: {
    createNodes(vertexs) {
      var nodes = []
      for (var i = 0; i < vertexs.length; i++) {
        nodes.push({
          'id': vertexs[i].VID,
          'name': vertexs[i].name,
          'createTime': vertexs[i].createTime,
          'type': vertexs[i].type,
          'sentence': vertexs[i].sentence,
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
    showGraph(res_data) {
      this.mainbox_chart = this.$echarts.init(
        document.getElementById("mainbox")
      )
      //this.createNodes(res_data.vertexLists)
      //this.createEdges(res_data.edges)
      let option = {
        title: {
          text: "多源物联网知识图谱推理",
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
        },
        animationDuration: 500,
        animationDurationUpdate: 250,
        series:[
          {
            name: "kgreasoning",
            type: "graph",
            layout: "force",
            force: {
              repulsion: 100,
              edgeLength: [20, 50],
            },
            data: this.createNodes(res_data.vertexLists),
            links: this.createEdges(res_data.edges),
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
              formatter: (params) => {
                return params.data.name
              },
              textStyle: {
                fontSize: 12
              }
            },
            emphasis: {
              focus: "adjacency",
              lineStyle: {
                width: 10,
              }
            },
            // itemStyle: {
            //   color: "#6495ED"
            // }
          }
        ]
      }
      this.mainbox_chart.setOption(option)
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

.el-input.is-disabled >>> .el-input__inner {
  color: #000; /* 替换#your-color为你想要的颜色 */
}

.button-area {
  margin-top: 1%;
}

.display-area {
  padding: 1%;
  display: flex;
  align-items: center;
  height: 100%
}


</style>