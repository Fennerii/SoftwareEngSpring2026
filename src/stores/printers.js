import { ref } from 'vue'

export const printers = ref([])

export async function loadPrinters() {
    const res = await fetch('http://localhost:3000/printers')
    printers.value = await res.json()
}