<template>
  <div>
    <Panel :title="title" :desc="desc" />
    <div class="button-area">
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
      <!-- <el-button size="small" type="primary" @click="onClick">点击上传</el-button> -->
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
export default {
  data() {
    return {
      data_1_edges: [],
      data_1_vertexs: [],
      mainbox_chart: null,
      title: "关系抽取",
      desc: "关系抽取，上传文件，从文本中抽取实体和关系",
      value: "请选择文件",
      file:null,
      fileList: [],
      form: {},
      category: [{name: "action", itemStyle: {color: "#409EFF"}},{name: "component", itemStyle: {color: "#606266"}},{name: "domain", itemStyle: {color: "#311256"}},{name: "enterprise"},{name: "event"},{name: "ip"},{name: "organization"},{name: "product"},{name: "sample"},{name: "url"},{name: "vulnerability"},{name: "weakness"},]
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
        loadingInstance.close()
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
      let loadingInstance = Loading.service({target: document.getElementById('mainbox')})
      // 检查文件合法性或对不同文件进行不同处理
    }
  }
};
</script>

<style scoped>
.button-area {
  margin-top: 20px;
}

.display-area {
  margin-top: 20px;
  display: flex;
  align-items: center;
  height: 660px;
}
</style>