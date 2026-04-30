//importing test utilities and printerUtils function file for tests
import { describe, it, expect } from 'vitest'
import { isLowToner, getStatus, getSeverityClass, filterProblemPrinters } from '../src/utils/printerUtils'

//running toner test cases
describe('Testing Low Toner Detection', () => {

  it('correctly detecting low toner (black)', () => {
    const printer = { black: 2 }
    expect(isLowToner(printer)).toBe(true)
  })

  it("correctly detecting low toner (cyan)", () => {
    expect(isLowToner({ cyan: 2 })).toBe(true)
  })

  it("correctly detecting low toner (magenta)", () => {
    expect(isLowToner({ magenta: 2 })).toBe(true)
  })

  it("correctly detecting low toner (yellow)", () => {
    expect(isLowToner({ yellow: 2 })).toBe(true)
  })

  it('correctly detecting normal toner levels (black)', () => {
    const printer = { black: 50 }
    expect(isLowToner(printer)).toBe(false)
  })

  it("returns false when all toner values are null", () => {
    expect(isLowToner({})).toBe(false)
  })
})

//running printer status tests
describe('Testing Printer Status Logic', () => {

  //error case
  it('returns ERROR when is_error is true', () => {
    const p = { is_error: true }
    expect(getStatus(p)).toBe('ERROR')
  })

  it('returns ERROR when status is offline', () => {
    const p = { status: 'offline' }
    expect(getStatus(p)).toBe('ERROR')
  })

  it('returns ERROR when status contains Offline (case insensitive)', () => {
    const p = { status: 'Offline - not responding' }
    expect(getStatus(p)).toBe('ERROR')
  })

  //low toner case
  it('returns LOW TONER when no error conditions exist', () => {
    const p = { is_error: false, status: 'ready' }
    expect(getStatus(p)).toBe('LOW TONER')
  })

})

//running tests for severity class logic
describe('Testing Severity Class Logic', () => {

  it('returns error-item when printer has error', () => {
    const p = { is_error: true }
    expect(getSeverityClass(p)).toBe('error-item')
  })

  it('returns error-item when printer is offline', () => {
    const p = { status: 'offline' }
    expect(getSeverityClass(p)).toBe('error-item')
  })

  it('returns warning-item for normal printers', () => {
    const p = { status: 'ready' }
    expect(getSeverityClass(p)).toBe('warning-item')
  })

})

//tests edges cases
describe('Edge Cases', () => {

  it('handles missing status safely', () => {
    const p = {}
    expect(getStatus(p)).toBe('LOW TONER')
  })

  it('handles null status safely', () => {
    const p = { status: null }
    expect(getStatus(p)).toBe('LOW TONER')
  })

})

//running tests for filtering problem printers
describe('Testing Filtering of Problem Printers', () => {

  it('filters printers with is_error = true', () => {
    const data = [
      { is_error: true },
      { is_error: false }
    ]

    const result = filterProblemPrinters(data)

    expect(result.length).toBe(1)
  })

  it('filters printers that are offline', () => {
    const data = [
      { status: 'offline' },
      { status: 'ready' }
    ]

    const result = filterProblemPrinters(data)

    expect(result.length).toBe(1)
  })

  it('filters printers with low toner', () => {
    const data = [
      { black: 2 },  
      { black: 50 }  
    ]

    const result = filterProblemPrinters(data)

    expect(result.length).toBe(1)
  })

  it('returns all problem printers (mixed case)', () => {
    const data = [
      { is_error: true },
      { status: 'offline' },
      { black: 2 },
      { status: 'ready', black: 50 }
    ]

    const result = filterProblemPrinters(data)

    expect(result.length).toBe(3)
  })

  it('returns empty array if no printers have issues', () => {
    const data = [
      { status: 'ready', black: 50 },
      { status: 'idle', black: 80 }
    ]

    const result = filterProblemPrinters(data)

    expect(result.length).toBe(0)
  })

})