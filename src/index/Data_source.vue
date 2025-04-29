<template>
  <div>
    <Panel :title="title" :desc="desc" />
    <template>
      <el-table :data="tableData" style="width: 100%" >

        <el-table-column prop="id" label="ID" width="180"  align="center">
        </el-table-column>
        <el-table-column prop="datasourceName" label="数据源名称"   align="center">
        </el-table-column>
        <el-table-column prop="url" label="url地址"  align="center"> </el-table-column>
      </el-table>
      <div class="block">
        <span class="demonstration"></span>
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="10"
          layout="total,  prev, pager, next, jumper"
          :total="this.total"
        >
        </el-pagination>
      </div>
    </template>
  </div>
</template>

<script>
import { request } from '../components/network';
import Panel from '../components/Panel.vue';
export default {
  data() {
    return {
      tableData: [],
      currentPage:1,
      title: '数据源',
      desc: '主要展示了68个数据源的信息，包括数据源名称，url地址。'
    };
  },
  components: {
    Panel
  },
  mounted() {
    this.showDataSource()
  },
  methods:{
    showDataSource() {
        request({
        url: "EntityDatasource/page",
        method: "post",
        data: {
            currPage:this.currentPage
        }
        }).then((res)=>{
            console.log(res,"res");
            this.tableData = res.data.list
            this.total = res.data.totalCount
            
        })
    },
    handleSizeChange() {

    },
    handleCurrentChange(val) {
        this.currentPage = val
        this.showDataSource()

    }
  }

};
</script>

<style scoped>
</style>