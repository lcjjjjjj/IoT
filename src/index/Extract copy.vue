<template>
  <div>
    <Panel :title="title" :desc="desc" />
    <el-select
      v-model="value"
      placeholder="请选择"
      style="width: 500px"
      @change="handleChange"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>
    <div
      style="
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        margin-bottom: 50px;
        height: 758px;
      "
    >
      <div
        id="mainbox"
        style="width: 1000px; height: 758px; margin-top: 50px"
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
    </div>
  </div>
</template>

<script>
import { request } from "../components/network";
import Panel from "../components/Panel.vue";
export default {
  data() {
    return {
      data_1_edges: [],
      data_1_vertexs: [],
      mainbox_chart: null,
      title: "关系抽取",
      desc: "关系抽取，上传文件，从文本中抽取实体和关系",
      options: [
        {
          value: "D:\\keda\\周报\\wlw\\tmp\\RE_train_simple.json",
          label: "D:\\keda\\周报\\wlw\\tmp\\RE_train_simple.json",
        },
      ],
      value: "请选择文件",
      form: {},
    };
  },
  components: {
    Panel
  },
  mounted() {
    // this.showExtract();
  },
  methods: {
    showExtract() {
      request({
        url: "wlwapi/invokeNlp",
        method: "post",
        data: {
          filePath: "D:\\keda\\周报\\wlw\\tmp\\RE_train_simple.json",
        },
      }).then((res) => {
        console.log(res, "res");
        this.data_1_edges = res.data.edges;
        // const list_1_edges = ["source","target","ranking","general_name","name"];
        const list_1_edges = [
          "source",
          "target",
          "ranking",
          "general_name",
          "name",
        ];
        const newArr_1_edges = [];

        // 遍历获取的数据
        this.data_1_edges.map((item) => {
          const newObj_1_edges = {};
          for (let i = 0; i < list_1_edges.length; i++) {
            newObj_1_edges[list_1_edges[i]] = item[Object.keys(item)[i]];
          }
          newArr_1_edges.push(newObj_1_edges);
        });
        console.log("newObj_1_edges", newArr_1_edges);

        this.data_1_edges = newArr_1_edges;
        this.data_1_vertexs = res.data.vertexs;
        // const list_1_vertexs = ["id","createTime","name","type"];
        const list_1_vertexs = ["id", "name"];
        const newArr_1_vertexs = [];
        this.data_1_vertexs.map((item) => {
          const newObj_1_vertexs = {};
          for (let i = 0; i < list_1_vertexs.length; i++) {
            // "[Object.keys(item)[i]]"代表键值，"item"代表单个实例(包含某个舰船的属性的对象)。空对象后面放"键"。可以组成一个对象数组格式，类似于"{[a:1],[b:2]}"
            // console.log(Object.keys(item)[i].length,"[Object.keys(item)[i]]");
            newObj_1_vertexs[list_1_vertexs[i]] = item[Object.keys(item)[i]];
          }
          newArr_1_vertexs.push(newObj_1_vertexs);
        });
        console.log("newArr_1_vertexs", newArr_1_vertexs);
        this.data_1_vertexs = newArr_1_vertexs;
        // echrtas开始工作
        this.mainbox_chart = this.$echarts.init(
          document.getElementById("mainbox")
        );
        let option = {
          title: {
            text: "实体关系抽取",
            top: "top",
            left: "left",
          },
          tooltip: {
            trigger: "item",
            enterable: true, // 设置可移入气泡
            formatter: function (params, ticket, callback) {
              //   console.log(params.dataType, typeof params.dataType,"params");
              if (params.dataType == "edge") {
                return "name:" + params.data.name;
              } else {
                return (
                  "ID:" +
                  //   params.data.chinese_name +
                  params.data.id +
                  "<br/>" +
                  "name:" +
                  //   params.data.chinese_name +
                  params.data.name +
                  "<br/>" +
                  "<br/>"
                );
              }
            },
          },
          animationDuration: 1500,
          animationEasingUpdate: "quinticInOut",
          series: [
            {
              name: "知识图谱",
              type: "graph",
              layout: "force",
              data: this.data_1_vertexs,
              links: this.data_1_edges,
              // data: this.nodes,
              // links: this.links,
              // categories: this.categories,
              symbolSize: 20, // 圆圈的大小
              roam: true,
              symbol: "circle",
              label: {
                show: true,
                position: "right",
                formatter: "{b}",
              },
              lineStyle: {
                show: true,
                color: "source",
                curveness: 0.3,
              },
              edgeLabel: {
                //线条的边缘标签
                normal: {
                  show: true,
                  //通过回调函数设置连线上的标签
                  formatter: function (x) {
                    return x.data.name;
                  },
                  textStyle: {
                    fontSize: 12,
                  },
                },
              },
              emphasis: {
                focus: "adjacency",
                lineStyle: {
                  width: 10,
                },
              },
              itemStyle: {
                //设置节点样式

                //函数接收params参数，params就是当前data数组的每一项，把颜色return出来就可以啦~
                color: function (params) {
                  return "#6495ED"; //前端写死的颜色
                },
              },
            },
          ],
        };

        this.mainbox_chart.setOption(option);
        // 监听点击事件
        // 将this赋值给that
        var that = this;
        this.mainbox_chart.on("click", function (params) {
          //   var selected = myChart.getOption().series[0].selected;
          //   var dataIndex = params.dataIndex;
          //   if (selected[dataIndex]) {
          //     // 如果已经选中，则取消选中
          //     selected[dataIndex] = false;
          //   } else {
          //     // 如果没有选中，则选中当前点，但最多只能选中两个节点
          //     var selectedCount = Object.values(selected).filter(function (v) {
          //       return v;
          //     }).length;
          //     if (selectedCount < 2) {
          //       selected[dataIndex] = true;
          //     }
          //   }
          //   myChart.setOption({
          //     series: [{ selected: selected }],
          //   });
        });
      });
    },
    handleChange() {
      this.showExtract();
    },
  },
};
</script>

<style>
</style>