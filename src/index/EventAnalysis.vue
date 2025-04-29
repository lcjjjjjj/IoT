<template>
    <div>
      <Panel :title="title" :desc="desc" />
    </div>
  </template>
  
  <script>
  import Panel from "../components/Panel.vue"
  export default {
    data() {
      return {
        title: '事件溯源分析',
        desc: '这里是事件溯源分析的描述信息'
      }
    },
    components: {
      Panel
    }
  }
  </script>
  
  <style scoped>
  
  </style>