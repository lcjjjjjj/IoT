<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="title">
          物联网威胁信息融合分析系统
        </div>
      </el-header>
      <el-container>
        <el-aside width="13%">
          <el-menu
            router
            :default-active="$route.path"
            class="el-menu"
            @select="handleSelect"
            text-color="#fff"
            active-text-color="#ffd04b"
          >
            <el-menu-item index="/Data_source"
            :class="{ active: $route.path === '/Data_source' }">
            <img :src="$route.path === '/Data_source' ? require('@/assets/data_source_c.png') : require('@/assets/data_source_o.png')" alt="图标"  class="menu-item-icon" />
            数据源</el-menu-item>
            <el-menu-item index="Info_statistics"
            :class="{ active: $route.path === '/Info_statistics' }">
            <img :src="$route.path === '/Info_statistics' ? require('@/assets/statistics_c.png') : require('@/assets/statistics_o.png')" alt="图标"  class="menu-item-icon"/>
            信息统计</el-menu-item>
            <el-menu-item index="/extract" class="font"
            :class="{ active: $route.path === '/extract' }">
            <img :src="$route.path === '/extract' ? require('@/assets/extract_c.png') : require('@/assets/extract_o.png')" alt="图标"  class="menu-item-icon"/>
            实体关系抽取</el-menu-item>
            <el-menu-item index="/Graph" class="font" 
            :class="{ active: $route.path === '/Graph' }">
            <img :src="$route.path === '/Graph'? require('@/assets/interlinkage_c.png') : require('@/assets/interlinkage_o.png')" alt="图标"  class="menu-item-icon"/>
            知识图谱链接</el-menu-item>
            <el-menu-item index="/Reasoning" class="font" 
            :class="{ active: $route.path === '/Reasoning' }">
            <img :src="$route.path === '/Reasoning' ? require('@/assets/inference_c.png') : require('@/assets/inference_o.png')" alt="图标"  class="menu-item-icon"/>
            知识图谱推理</el-menu-item>
            <el-menu-item index="/Config" class="font" 
            :class="{ active: $route.path === '/Config' }">
            <img :src="$route.path === '/Config' ? require('@/assets/inference_c.png') : require('@/assets/inference_o.png')" alt="图标"  class="menu-item-icon"/>
            物联网配置</el-menu-item>
            <el-menu-item index="/Evaluation" class="font" 
            :class="{ active: $route.path === '/Evaluation' }">
            <img :src="$route.path === '/Evaluation' ? require('@/assets/inference_c.png') : require('@/assets/inference_o.png')" alt="图标"  class="menu-item-icon"/>
            态势评估</el-menu-item>
            <!-- <el-menu-item index="/EventAnalysis" class="font" 
            :class="{ active: $route.path === '/EventAnalysis' }">
            <img :src="$route.path === '/EventAnalysis' ? require('@/assets/inference_c.png') : require('@/assets/inference_o.png')" alt="图标"  class="menu-item-icon"/>
            事件溯源分析</el-menu-item> -->
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import router from './router';
export default {
  name: "App",
  data() {
    return {
      data: []
    }
  },
  mounted() {
    this.handleSelect(this.$route.path);
  },
  methods: {
    handleSelect(key) {
      
    }
  }
};
</script>

<style>
html,body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
  /* height: 100%; */
}
.el-dropdown-menu__item, .el-menu-item {
  padding-left: 20% !important;
}

.common-layout {
  height: 100vh;
}
.el-container {
  height: 100%;
}
.el-header {
  height: 60px !important;
  background-color: #89A7F0;
}

.el-aside {
  background: linear-gradient(to bottom, #89A7F0, #9C8EF6);
}

.el-main {
  height: calc(100vh - 60px);
  padding: 0;
  overflow: hidden;
}
.el-menu {
  background-color: transparent!important; /* 设置背景颜色为透明 */
}

.el-aside .el-menu .el-menu-item {
  height: 48px; 
  line-height: 48px; 
}

.el-aside .el-menu .el-menu-item .menu-item-icon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
}


.el-header .title{
  color: #fff;
  margin: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18%;
  font-size: 18px;
  font-weight: bold;
  height: 100%;
  background: #89A7F0;
}
/* .title {
  color: #999;
  margin: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width:240px;
  font-size: 24px;
  font-weight: bold;
  height: 100%;
} */
.el-menu-item.active {
  font-weight: bold; /* 字体加粗 */
  background-color: rgba(255, 255, 255, 0.5) !important; /* 50% 白色背景 */
  color: #409EFF !important; /* 激活时字体颜色为蓝色 */
}
/* 鼠标悬停时的样式 */
.el-aside .el-menu .el-menu-item:not(.active):hover {
  background-color: rgba(255, 255, 255, 0.2) !important; 
  color: #409EFF !important; 
}

</style>