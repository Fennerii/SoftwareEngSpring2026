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

          <div v-for="printer in printers" :key="printer.serial_number" 
          :class="[
            'card',
            isLowToner(printer)
              ? 'warning'
              : (printer.is_error ? 'error' : 'ok')
          ]">
            <!-- ADD SERIAL NUMBER TO THIS LIST -->
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

            <!-- work history button -->
            <button @click="openHistory(printer)">Work History</button>

          </div>

        </div>

      </div>

    </div>

    <!-- history popup panel -->
    <div v-if="showHistory" class="history-overlay"></div>

    <div v-if="showHistory" class="history-panel">

      <div class="history-header">
        <h2>History for {{ selectedPrinter.name }}</h2>
        <button class="close-btn" @click="showHistory = false">✕</button>
      </div>

      <button class="add-btn" @click="addHistory">+ Add Entry</button>

      <div class="history-content">
        <ul>
          <li v-for="h in history" :key="h.work_id">
            <b>{{ h.username }}</b> — {{ h.notes }}
            <br>
            <small>{{ new Date(h.created_at).toLocaleString() }}</small>
          </li>
        </ul>
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

const selectedPrinter = ref(null)
const history = ref([])
const showHistory = ref(false)

//temp user (replace later when implementing login)
const currentUser = ref(1)

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
  "Van den Berg Hall"
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

//group printers
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

//toggles dropdown
function toggle(building) {
  open.value[building] = !open.value[building]
}

//checks toner levels, returns true if levels reach 10% or lower
function isLowToner(printer) {
  return (
    (printer.black != null && printer.black <= 10) ||
    (printer.cyan != null && printer.cyan <= 10) ||
    (printer.magenta != null && printer.magenta <= 10) ||
    (printer.yellow != null && printer.yellow <= 10)
  );
}

//opens specific printer's history log
async function openHistory(printer) {
  selectedPrinter.value = printer
  showHistory.value = true

  const res = await fetch(`http://localhost:3000/history/${printer.serial_number}`)
  history.value = await res.json()
}

//add work entry to printer's history log
async function addHistory() {
  const notes = prompt("What did you fix/do?")

  if (!notes) return

  await fetch('http://localhost:3000/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      printer_serial: selectedPrinter.value.serial_number,
      user_id: currentUser.value,
      notes: notes
    })
  })

  openHistory(selectedPrinter.value)
}

</script>