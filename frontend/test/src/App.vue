<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInfrastructureStore } from './stores/infrastructure'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const store = useInfrastructureStore()

const overallStatus = computed(() => store.overallStatus)
const groups = computed(() => store.groups)
const filteredNodes = computed(() => store.filteredNodes)
const selectedGroup = computed(() => store.selectedGroup)
const selectedNode = computed(() => store.selectedNode)

const selectedNodeData = computed(() => {
  if (!selectedNode.value) return null
  const group = groups.value.find(g => g.nodes.some(n => n.id === selectedNode.value))
  return group?.nodes.find(n => n.id === selectedNode.value)
})

const latestMetrics = computed(() => {
  return store.nodeMetrics[0]
})

const chartData = computed(() => ({
  labels: store.nodeMetrics.map(m => new Date(m.metric_timestamp).toLocaleTimeString()),
  datasets: [
    {
      label: 'CPU',
      data: store.nodeMetrics.map(m => m.cpu_value),
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    },
    {
      label: 'Memory',
      data: store.nodeMetrics.map(m => m.memory_value),
      borderColor: 'rgb(54, 162, 235)',
      tension: 0.1
    },
    {
      label: 'Disk',
      data: store.nodeMetrics.map(m => m.disk_value),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 100
    }
  }
}

const getMetricClass = (value) => {
  if (!value) return ''
  if (value > 95) return 'critical'
  if (value > 85) return 'warning'
  return 'normal'
}

const getStatusClass = (status) => {
  if (!status) return 'unknown'
  status = status.toLowerCase()
  if (status === 'up') return 'up'
  if (status === 'down') return 'down'
  if (status === 'warning') return 'warning'
  return 'unknown'
}

const selectGroup = (groupId) => {
  store.selectGroup(groupId)
}

const selectNode = (nodeId) => {
  store.selectNode(nodeId)
}

onMounted(() => {
  store.fetchData()
  setInterval(() => store.fetchData(), 60000) // Обновление каждую минуту
})
</script>

<template>
  <div class="app-container">
    <div class="status-bar" :style="{ backgroundColor: overallStatus.color }">
      <h2>Общий статус: {{ overallStatus.status }}</h2>
    </div>
    
    <div class="main-content">
      <div class="column">
        <div class="block">
          <h3>Группы</h3>
          <div class="groups-list">
            <div 
              v-for="group in groups" 
              :key="group.id"
              class="group-item"
              :class="{ active: selectedGroup === group.id }"
              @click="selectGroup(group.id)"
            >
              {{ group.name }}
              <div class="group-stats">
                <span>Нод: {{ group.nodes.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="block">
          <h3>Ноды</h3>
          <div class="nodes-list">
            <div 
              v-for="node in filteredNodes" 
              :key="node.id"
              class="node-item"
              :class="{ active: selectedNode === node.id }"
              @click="selectNode(node.id)"
            >
              <div class="node-status" :style="{ backgroundColor: node.status_color }"></div>
              <div class="node-info">
                <div class="node-name">{{ node.name }}</div>
                <div class="node-status-text">{{ node.status_description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="block">
          <h3>Детали</h3>
          <template v-if="selectedNode">
            <div class="node-details">
              <div class="metrics-chart">
                <Line :data="chartData" :options="chartOptions" />
              </div>
              
              <div class="metrics-summary">
                <h4>Последние показатели:</h4>
                <div class="metric-values">
                  <div class="metric-item" :class="getMetricClass(latestMetrics?.cpu_value)">
                    CPU: {{ latestMetrics?.cpu_value }}%
                  </div>
                  <div class="metric-item" :class="getMetricClass(latestMetrics?.memory_value)">
                    Memory: {{ latestMetrics?.memory_value }}%
                  </div>
                  <div class="metric-item" :class="getMetricClass(latestMetrics?.disk_value)">
                    Disk: {{ latestMetrics?.disk_value }}%
                  </div>
                </div>
              </div>

              <div class="interfaces">
                <h4>Интерфейсы</h4>
                <div v-for="iface in selectedNodeData?.interfaces" :key="iface.id" class="interface-item">
                  <div class="interface-name">{{ iface.name }}</div>
                  <div class="interface-status" :class="getStatusClass(iface.status)">
                    Статус: {{ iface.status }}
                  </div>
                </div>
              </div>

              <div class="applications">
                <h4>Приложения</h4>
                <div v-for="app in selectedNodeData?.applications" :key="app.id" class="app-item">
                  {{ app.name }}
                </div>
              </div>

              <div class="admin-info" v-if="selectedNodeData?.admin">
                <h4>Администратор</h4>
                <div class="admin-details">
                  <div class="admin-name">{{ selectedNodeData.admin.firstname }} {{ selectedNodeData.admin.lastname }}</div>
                  <div class="admin-email">
                    <a :href="'mailto:' + selectedNodeData.admin.email">{{ selectedNodeData.admin.email }}</a>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="no-selection">
            Выберите ноду для просмотра деталей
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
  color: #333;
  max-width: 1400px;
  width: 100%;
}

.status-bar {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  color: white;
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.main-content {
  display: flex;
  flex: 1;
  gap: 20px;
  height: calc(100vh - 100px);
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.block {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 100%;
  overflow: auto;

  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
    font-weight: 600;
  }
}

.groups-list, .nodes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-item, .node-item {
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #ddd;
  background-color: white;
  color: #2c3e50;

  &:hover {
    background-color: #f8f8f8;
    transform: translateX(5px);
  }

  &.active {
    background-color: #e3f2fd;
    border-color: #2196f3;
    color: #1565c0;
  }
}

.group-stats {
  font-size: 0.8em;
  color: #546e7a;
  margin-top: 5px;
  font-weight: 500;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.node-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2c3e50;
}

.node-status-text {
  font-size: 0.8em;
  color: #546e7a;
  margin-top: 5px;
  font-weight: 500;
}

.node-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-chart {
  height: 200px;
  margin-bottom: 20px;
}

.metrics-summary {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;

  h4 {
    color: #2c3e50;
    margin-bottom: 10px;
    font-weight: 600;
}
}

.metric-values {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.metric-item {
  padding: 8px 12px;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #ddd;
  color: #2c3e50;
  font-weight: 500;

  &.warning {
    color: #e65100;
    border-color: #ff9800;
    background-color: #fff3e0;
    font-weight: 600;
}

  &.critical {
    color: #c62828;
    border-color: #f44336;
    background-color: #ffebee;
    font-weight: 600;
  }
}

.interfaces, .applications {
  h4 {
    margin: 0 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
    font-weight: 600;
}
}

.interface-item, .app-item {
  padding: 12px;
  border-radius: 4px;
  background-color: #f8f8f8;
  margin-bottom: 8px;
    display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    margin-bottom: 0;
  }

  .interface-name {
    font-weight: 600;
    color: #2c3e50;
  }

  .interface-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    font-weight: 500;

    &.up {
      background-color: #e8f5e9;
      color: #2e7d32;
  }

    &.down {
      background-color: #ffebee;
      color: #c62828;
    }

    &.warning {
      background-color: #fff3e0;
      color: #ef6c00;
  }

    &.unknown {
      background-color: #f5f5f5;
      color: #757575;
    }
  }
}

.no-selection {
    display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #78909c;
  font-style: italic;
  font-weight: 500;
  }

.admin-info {
  margin-top: 20px;
  
  h4 {
    margin: 0 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
    font-weight: 600;
  }
}

.admin-details {
  background-color: #f8f8f8;
  padding: 12px;
  border-radius: 4px;
  
  .admin-name {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 4px;
  }
  
  .admin-email {
    a {
      color: #1976d2;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
