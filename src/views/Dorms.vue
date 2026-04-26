<template>
  <div class="dorms">
    <h1>Dormitories</h1>

    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>

    <div class="cards">

      <div v-for="(printers, building) in groupedPrinters" :key="building">

        <div class="building-header" @click="toggle(building)">
          {{ building }} {{ open[building] ? '▲' : '▼' }}
        </div>

        <div v-if="open[building]" class="printer-list">
          <div v-for="printer in printers" :key="printer.serial_number" 
          :class="[
            'card',
            isLowToner(printer)
              ? 'warning'
              : (printer.is_error ? 'error' : 'ok')
          ]">
            <h3>{{ printer.name }}</h3>
            <p><b>Location:</b> {{ printer.location }}</p>
            <p><b>Status:</b> {{ printer.status }}</p>
            <p><b>IP:</b> {{ printer.ip }}</p>
            <p><b>Pages:</b> {{ printer.page_count }}</p>

            <p>
              <b>Toner: </b>
              <span v-if="printer.black != null">Black: {{ printer.black }}% </span>
              <span v-if="printer.cyan != null">Cyan: {{ printer.cyan }}% </span>
              <span v-if="printer.magenta != null">Magenta: {{ printer.magenta }}% </span>
              <span v-if="printer.yellow != null">Yellow: {{ printer.yellow }}%</span>
            </p>
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

//only the dorm buildings
const dormGroups = {
  "Academic Way": ["College Hall", "Shango Hall", "ShangoEOP", "Bouton Hall"],
  "Parker Quad": ["Capen Hall", "CapenEOP", "Scudder Hall", "Bliss Hall", "Gage Hall"],
  "Peregrine Suites": ["Awosting Hall", "Mohonk Hall", "Shawangunk Hall", "Ashokan Hall", "Minnewaska Hall"],
  "Southside Dorms": ["Ridgeview Hall", "Esopus Hall", "Lenape Hall"]
}

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

//group printers by dorm buildings
const groupedPrinters = computed(() => {
  let groups = {}

  printers.value.forEach(p => {

    let found = false
    let groupName = ""

    for (let group in dormGroups) {
      for (let i = 0; i < dormGroups[group].length; i++) {

        if (p.location.includes(dormGroups[group][i])) {
          found = true
          groupName = group
        }

      }
    }

    if (!found) return

    if (!groups[groupName]) {
      groups[groupName] = []
    }

    groups[groupName].push(p)
  })

  let ordered = {}
  Object.keys(dormGroups).forEach(key => {
    if (groups[key]) {
      ordered[key] = groups[key]
    }
  })

  return ordered
})

//toggle dropdown
function toggle(building) {
  if (open.value[building]) {
    open.value[building] = false
  } else {
    open.value[building] = true
  }
}

function isLowToner(printer) {
  return (
    (printer.black != null && printer.black <= 10 ) ||
    (printer.cyan != null && printer.cyan <= 10 ) ||
    (printer.magenta != null && printer.magenta <= 10 ) ||
    (printer.yellow != null && printer.yellow <= 10 )
  );
}

</script>