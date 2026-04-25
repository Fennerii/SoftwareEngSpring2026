<template>
  <div class="academic">
    <h1>Academic Buildings</h1>

    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>

    <div class="cards">
      <div
        v-for="printer in academicPrinters"
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

const academicCodes = [
  'EIH', 'PDH', 'HUM', 'SAB', 'WH',
  'SUB', 'CSB', 'LC', 'SH', 'HAB',
  'OM', 'OL', 'VH', 'REH', 'FAB', 'CT', 'CH'
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

const academicPrinters = computed(() =>
  printers.value
    .filter(p => academicCodes.some(code => p.location.includes(code)))
    .sort((a, b) => a.location.localeCompare(b.location))
)
</script>

<style scoped>
.academic {
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