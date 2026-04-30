<template>
  <div class="storage">
    <h1>Supply Inventory</h1>

    <!-- Section Tabs -->
    <div class="tabs">
      <button :class="{ active: activeTab === 'academic' }" @click="activeTab = 'academic'">Academic Buildings</button>
      <button :class="{ active: activeTab === 'dorm' }" @click="activeTab = 'dorm'">Dorms</button>
      <button :class="{ active: activeTab === 'storage' }" @click="activeTab = 'storage'">Storage</button>
    </div>

    <!-- Academic Buildings -->
    <div v-if="activeTab === 'academic'">
      <div v-for="loc in academicLocations" :key="loc.location_id" class="location-block">
        <div class="location-header" @click="toggle(loc.location_id)">
          {{ loc.name }} {{ openLocations.includes(loc.location_id) ? '▲' : '▼' }}
        </div>
        <div v-if="openLocations.includes(loc.location_id)" class="location-body">
          <SupplySection :location="loc" :user="user" />
        </div>
      </div>
    </div>

    <!-- Dorms grouped by group_name -->
    <div v-if="activeTab === 'dorm'">
      <div v-for="(locs, group) in dormGroups" :key="group" class="dorm-group">
        <h2 class="group-header">{{ group }}</h2>
        <div v-for="loc in locs" :key="loc.location_id" class="location-block">
          <div class="location-header" @click="toggle(loc.location_id)">
            {{ loc.name }} {{ openLocations.includes(loc.location_id) ? '▲' : '▼' }}
          </div>
          <div v-if="openLocations.includes(loc.location_id)" class="location-body">
            <SupplySection :location="loc" :user="user" />
          </div>
        </div>
      </div>
    </div>

    <!-- Storage -->
    <div v-if="activeTab === 'storage'">
      <div v-for="loc in storageLocations" :key="loc.location_id" class="location-block">
        <div class="location-header" @click="toggle(loc.location_id)">
          {{ loc.name }} {{ openLocations.includes(loc.location_id) ? '▲' : '▼' }}
        </div>
        <div v-if="openLocations.includes(loc.location_id)" class="location-body">
          <SupplySection :location="loc" :user="user" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({ user: Object });

const activeTab = ref('academic');
const locations = ref([]);
const openLocations = ref([]);

const tonerModels = [
  '650A BLK', '650A Cyan', '650A Mag', '650A Yel',
  '507X BLK', '507A Cyan', '507A Mag', '507A Yel',
  '90X', '81X', '37X', '25X', '14X', '87A', '89A', '64X'
];

onMounted(async () => {
  const res = await fetch('http://localhost:3000/locations');
  locations.value = await res.json();
});

const academicLocations = computed(() =>
  locations.value.filter(l => l.type === 'academic')
);

const storageLocations = computed(() =>
  locations.value.filter(l => l.type === 'storage')
);

const dormGroups = computed(() => {
  const dorms = locations.value.filter(l => l.type === 'dorm');
  return dorms.reduce((groups, loc) => {
    const g = loc.group_name || 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(loc);
    return groups;
  }, {});
});

function toggle(id) {
  if (openLocations.value.includes(id)) {
    openLocations.value = openLocations.value.filter(i => i !== id);
  } else {
    openLocations.value.push(id);
  }
}

// ─── SupplySection (inline component) ────────────────────────────────────────
const SupplySection = {
  props: { location: Object, user: Object },
  setup(props) {
    const tonerLog = ref([]);
    const paperLog = ref([]);
    const newToner = ref({ model: '', quantity: 0 });
    const newPaper = ref({ quantity: 0 });
    const tonerMsg = ref('');
    const paperMsg = ref('');

    onMounted(() => {
      fetchToner();
      fetchPaper();
    });

    async function fetchToner() {
      const res = await fetch(`http://localhost:3000/toner/${props.location.location_id}`);
      tonerLog.value = await res.json();
    }

    async function fetchPaper() {
      const res = await fetch(`http://localhost:3000/paper/${props.location.location_id}`);
      paperLog.value = await res.json();
    }

    async function submitToner() {
      if (!newToner.value.model || newToner.value.quantity < 0) {
        tonerMsg.value = 'Please select a model and enter a quantity.';
        return;
      }
      const res = await fetch('http://localhost:3000/toner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: props.location.location_id,
          toner_model: newToner.value.model,
          quantity: newToner.value.quantity,
          user_id: props.user?.user_id
        })
      });
      if (res.ok) {
        tonerMsg.value = 'Saved!';
        newToner.value = { model: '', quantity: 0 };
        fetchToner();
        setTimeout(() => tonerMsg.value = '', 3000);
      } else {
        tonerMsg.value = 'Error saving.';
      }
    }

    async function submitPaper() {
      if (newPaper.value.quantity < 0) {
        paperMsg.value = 'Please enter a valid quantity.';
        return;
      }
      const res = await fetch('http://localhost:3000/paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: props.location.location_id,
          quantity: newPaper.value.quantity,
          user_id: props.user?.user_id
        })
      });
      if (res.ok) {
        paperMsg.value = 'Saved!';
        newPaper.value = { quantity: 0 };
        fetchPaper();
        setTimeout(() => paperMsg.value = '', 3000);
      } else {
        paperMsg.value = 'Error saving.';
      }
    }

    const tonerTotals = computed(() =>
      tonerLog.value.reduce((acc, e) => {
        acc[e.toner_model] = (acc[e.toner_model] || 0) + e.quantity;
        return acc;
      }, {})
    );

    const paperTotal = computed(() =>
      paperLog.value.reduce((sum, e) => sum + e.quantity, 0)
    );

    function formatDate(dt) {
      return new Date(dt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }

    return {
      tonerLog, paperLog, newToner, newPaper,
      tonerMsg, paperMsg, tonerModels,
      tonerTotals, paperTotal,
      submitToner, submitPaper, formatDate
    };
  },
  template: `
    <div class="supply-log">

      <!-- TONER -->
      <div class="section">
        <h3>Toner</h3>
        <table v-if="tonerLog.length">
          <thead>
            <tr><th>Model</th><th>Count</th><th>Counted By</th><th>Date</th></tr>
          </thead>
          <tbody>
            <tr v-for="e in tonerLog" :key="e.log_id">
              <td>{{ e.toner_model }}</td>
              <td>{{ e.quantity }}</td>
              <td>{{ e.counted_by }}</td>
              <td>{{ formatDate(e.counted_at) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr v-for="(total, model) in tonerTotals" :key="model">
              <td colspan="4"><strong>Total {{ model }}: {{ total }}</strong></td>
            </tr>
          </tfoot>
        </table>
        <p v-else class="empty">No toner entries yet.</p>

        <div class="add-form">
          <h4>+ Add Toner Count</h4>
          <select v-model="newToner.model">
            <option value="">Select model...</option>
            <option v-for="m in tonerModels" :key="m" :value="m">{{ m }}</option>
          </select>
          <input v-model.number="newToner.quantity" type="number" min="0" placeholder="Quantity" />
          <button @click="submitToner">Submit</button>
          <span v-if="tonerMsg" class="msg">{{ tonerMsg }}</span>
        </div>
      </div>

      <!-- PAPER -->
      <div class="section">
        <h3>Paper</h3>
        <table v-if="paperLog.length">
          <thead>
            <tr><th>Count (boxes)</th><th>Counted By</th><th>Date</th></tr>
          </thead>
          <tbody>
            <tr v-for="e in paperLog" :key="e.log_id">
              <td>{{ e.quantity }}</td>
              <td>{{ e.counted_by }}</td>
              <td>{{ formatDate(e.counted_at) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td colspan="3"><strong>Total Boxes: {{ paperTotal }}</strong></td></tr>
          </tfoot>
        </table>
        <p v-else class="empty">No paper entries yet.</p>

        <div class="add-form">
          <h4>+ Add Paper Count</h4>
          <input v-model.number="newPaper.quantity" type="number" min="0" placeholder="Boxes" />
          <button @click="submitPaper">Submit</button>
          <span v-if="paperMsg" class="msg">{{ paperMsg }}</span>
        </div>
      </div>

    </div>
  `
};
</script>

<style scoped>
.storage { padding: 20px; }

h1 { margin-bottom: 16px; }

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background: #2a2a2a;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.tabs button.active { background: #6c3bff; }

.group-header {
  font-size: 16px;
  color: #aaa;
  margin: 16px 0 8px;
  border-bottom: 1px solid #333;
  padding-bottom: 4px;
}

.location-block {
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}

.location-header {
  background: #1e1e1e;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}

.location-header:hover { background: #2a2a2a; }

.location-body {
  background: #111;
  padding: 16px;
}

.supply-log { display: flex; flex-direction: column; gap: 24px; }

.section h3 {
  font-size: 13px;
  margin-bottom: 10px;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 1px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-bottom: 12px;
}

th {
  text-align: left;
  padding: 8px;
  background: #1a1a1a;
  color: #aaa;
  border-bottom: 1px solid #333;
}

td {
  padding: 8px;
  border-bottom: 1px solid #222;
}

tfoot td {
  padding-top: 10px;
  color: #6c3bff;
  border-bottom: none;
}

.empty { color: #555; font-size: 13px; }

.add-form {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.add-form h4 {
  font-size: 13px;
  color: #888;
  margin: 0;
  width: 100%;
}

select, input {
  background: #1a1a1a;
  border: 1px solid #333;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
}

input { width: 100px; }

button {
  background: #6c3bff;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button:hover { background: #5a2ee0; }

.msg { font-size: 13px; color: #6c3bff; }
</style>