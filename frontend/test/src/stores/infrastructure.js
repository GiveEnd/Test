import { defineStore } from 'pinia'
import axios from 'axios'

export const useInfrastructureStore = defineStore('infrastructure', {
  state: () => ({
    groups: [],
    metrics: [],
    selectedGroup: null,
    selectedNode: null,
    loading: false,
    error: null
  }),

  getters: {
    overallStatus: (state) => {
      if (!state.groups.length) return { status: 'UNKNOWN', color: '#808080' }
      
      const allNodes = state.groups.flatMap(group => 
        group.nodes || []
      )
      
      if (allNodes.length === 0) return { status: 'UNKNOWN', color: '#808080' }
      
      const statusPriority = {
        'CRITICAL': 4,
        'DOWN': 3,
        'WARNING': 2,
        'UP': 1,
        'UNKNOWN': 0
      }

      const statusColors = {
        'CRITICAL': '#ff0000',
        'DOWN': '#ff4444',
        'WARNING': '#ffaa00',
        'UP': '#44ff44',
        'UNKNOWN': '#808080'
      }

      // Находим статус с наивысшим приоритетом
      const highestStatus = allNodes.reduce((highest, node) => {
        const currentPriority = statusPriority[node.status] || 0
        const highestPriority = statusPriority[highest] || 0
        return currentPriority > highestPriority ? node.status : highest
      }, 'UNKNOWN')

      return {
        status: highestStatus,
        color: statusColors[highestStatus]
      }
    },

    filteredNodes: (state) => {
      if (!state.selectedGroup) return []
      return state.groups.find(group => group.id === state.selectedGroup)?.nodes || []
    },

    nodeMetrics: (state) => {
      if (!state.selectedNode) return []
      return state.metrics.filter(metric => metric.node_id === state.selectedNode)
    }
  },

  actions: {
    async fetchData() {
      this.loading = true
      try {
        const [groupsResponse, metricsResponse] = await Promise.all([
          axios.get('http://127.0.0.1:23456/api/groups'),
          axios.get('http://127.0.0.1:23456/api/metrics')
        ])
        
        // Обработка групп и нод
        const groupsMap = new Map()
        groupsResponse.data.forEach(item => {
          if (!groupsMap.has(item.group_id)) {
            groupsMap.set(item.group_id, {
              id: item.group_id,
              name: item.group_name,
              nodes: new Map()
            })
          }
          
          const group = groupsMap.get(item.group_id)
          if (item.node_id && !group.nodes.has(item.node_id)) {
            group.nodes.set(item.node_id, {
              id: item.node_id,
              name: item.node_name,
              status: item.node_status_description,
              status_color: item.node_status_color,
              interfaces: new Map(),
              applications: new Set(),
              admin: item.admin_id ? {
                id: item.admin_id,
                firstname: item.admin_firstname,
                lastname: item.admin_lastname,
                email: item.admin_email
              } : null
            })
          }
          
          const node = group.nodes.get(item.node_id)
          if (item.interface_id && !node.interfaces.has(item.interface_id)) {
            node.interfaces.set(item.interface_id, {
              id: item.interface_id,
              name: item.interface_name,
              status: item.interface_status
            })
          }
          
          if (item.application_id) {
            node.applications.add({
              id: item.application_id,
              name: item.application_name
            })
          }
        })
        
        // Преобразование Map в массивы
        this.groups = Array.from(groupsMap.values()).map(group => ({
          ...group,
          nodes: Array.from(group.nodes.values()).map(node => ({
            ...node,
            interfaces: Array.from(node.interfaces.values()),
            applications: Array.from(node.applications)
          }))
        }))
        
        this.metrics = metricsResponse.data
        this.error = null
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    selectGroup(groupId) {
      this.selectedGroup = groupId
      this.selectedNode = null
    },

    selectNode(nodeId) {
      this.selectedNode = nodeId
    }
  }
}) 