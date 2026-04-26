<template>
  <div class="academic">
    <h1>Academic Buildings</h1>

    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>

    <div class="cards">

      <div v-for="(printers, building) in groupedPrinters" :key="building">

        <div class="building-header" @click="toggle(building)">
          {{ building }} {{ open[building] ? '▲' : '▼' }}
        </div>

        <div v-if="open[building]" class="printer-list">
          <div
            v-for="printer in printers"
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

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const printers = ref([])
const loading = ref(true)
const error = ref(null)

const open = ref({})

//only the academic buildings
const academicBuildings = [
  "Engineering and Innovation Hub",
  "Peregrine Dining Hall",
  "Louis and Mildred Resnick Hall",
  "Smiley Art Building",
  "Wooster Hall",
  "Atrium",
  "Academic College Hall",
  "Coykendall Science Building",
  "Lecture Center",
  "Science Hall",
  "Humanities",
  "Old Main",
  "Old Library",
  "Van Den Berg Hall"
]

//load printers
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/printers')
    const data = await res.json()
    printers.value = data
  } catch (e) {
    error.value = "couldn't load printers"
  }

  loading.value = false
})

//group printers by academic buildings
const groupedPrinters = computed(() => {
  let groups = {}

  printers.value.forEach(p => {
    let isAcademic = false

    for (let i = 0; i < academicBuildings.length; i++) {
      if (p.location.includes(academicBuildings[i])) {
        isAcademic = true
      }
    }

    if (!isAcademic) return

    let name = p.location.split('(')[0]
    name = name.trim()

    if (!groups[name]) {
      groups[name] = []
    }

    groups[name].push(p)
  })

  let sorted = {}
  Object.keys(groups).sort().forEach(key => {
    sorted[key] = groups[key]
  })

  return sorted
})

//toggle dropdown
function toggle(building) {
  if (open.value[building]) {
    open.value[building] = false
  } else {
    open.value[building] = true
  }
}
</script>