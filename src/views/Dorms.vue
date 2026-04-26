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

          <div
            v-for="printer in printers":key="printer.serial_number"
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
const currentUser = ref(localStorage.getItem("user_id"))

const dormGroups = {
  "Academic Way": ["College Hall", "Shango Hall", "ShangoEOP", "Bouton Hall"],
  "Parker Quad": ["Capen Hall", "CapenEOP", "Scudder Hall", "Bliss Hall", "Gage Hall"],
  "Peregrine Suites": ["Awosting Hall", "Mohonk Hall", "Shawangunk Hall", "Ashokan Hall", "Minnewaska Hall"],
  "Southside Dorms": ["Ridgeview Hall", "Esopus Hall", "Lenape Hall"]
}

// load printers
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

// group printers
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

// toggles dropdown
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
      notes
    })
  })

  openHistory(selectedPrinter.value)
}
</script>