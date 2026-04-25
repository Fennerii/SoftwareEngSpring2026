<template>
  <div class="dorms">
    <h1>Dormitories</h1>

    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>

    <div class="cards">
      <div
        v-for="printer in dormPrinters"
        :key="printer.serial_number"
        :class="['card', printer.is_error ? 'error' : 'ok']"
      >
        <h3>{{ printer.name }}</h3>
        <p><b>Location:</b> {{ printer.location }}</p>
        <p><b>Status:</b> {{ printer.status }}</p>
        <p><b>IP:</b> {{ printer.ip }}</p>
        <p><b>Pages:</b> {{ printer.page_count }}</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const printers = ref([])
const loading = ref(true)
const error = ref(null)

const dormCodes = [
  'SGH', 'CPH', 'SCH', 'GH',
  'ESH', 'LPH', 'MNH', 'MOH',
  'RVH', 'SWH', 'AWH', 'BLH'
]

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/printers')
    const data = await res.json()
    printers.value = data
  } catch (err) {
    error.value = 'Failed to load printers'
  } finally {
    loading.value = false
  }
})

const dormPrinters = computed(() =>
  printers.value
    .filter(p => dormCodes.some(code => p.location.includes(code)))
    .sort((a, b) => a.location.localeCompare(b.location))
)
</script>

<style scoped>
.dorms {
  padding: 20px;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.card {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  border-left: 8px solid green;
}

.error {
  border-left: 8px solid red;
}
</style>