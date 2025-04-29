import Vue from 'vue'
import Router from 'vue-router'
import Graph from '@/index/Graph'
import Data_source from '@/index/Data_source.vue'
import Info_statistics from '@/index/Info_statistics.vue'
import Extract from"@/index/Extract.vue"
import Reasoning from '../index/Reasoning.vue'
import Config from '../index/Config.vue'
import Evaluation from '../index/Evaluation.vue'
import EventAnalysis from '../index/EventAnalysis.vue'
// import login from './../index/login.vue'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Graph',
      component: Graph
    },
    {
      path: '/Graph',
      name: 'Graph',
      component: Graph
    },
    {
      path: '/Data_source',
      name: 'Data_source',
      component: Data_source
    },
    {
      path: '/Info_statistics',
      name: 'Info_statistics',
      component: Info_statistics
    },
    {
      path: '/Extract',
      name: 'Extract',
      component: Extract
    },
    {
      path: '/Reasoning',
      name: 'Reasoning',
      component: Reasoning
    },
    {
      path: '/Config',
      name: 'Config',
      component: Config
    },
    {
      path: "/Evaluation",
      name: "Evaluation",
      component: Evaluation
    },
    {
      path: "/EventAnalysis",
      name: "EventAnalysis",
      component: EventAnalysis
    }
      
    // {
    // path: '/table',
    // name: 'Table',
    // component: Table
    //   },
    // {
    // path: '/Knowledge_Graph',
    // name: 'Graph',
    // component: Graph
    // },

    //   {
    //     path: '/graph',
    //     name: 'graph',
    //     component: () => import( '../views/graph.vue')
    //   },
  ]
})
