import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeCode } from '../analyzer.js'

test('detects debugger and console logging', () => {
  const result = analyzeCode('debugger;\nconsole.log("hello")')
  assert.equal(result.counts.low, 2)
  assert.equal(result.findings[0].line, 1)
})

test('detects likely hardcoded credentials', () => {
  const result = analyzeCode('const api_key = "1234567890abcdef";')
  assert.equal(result.counts.critical, 1)
})

test('returns a clean report for code without configured patterns', () => {
  const result = analyzeCode('const total = 1 + 2;')
  assert.equal(result.findings.length, 0)
  assert.equal(result.score, 100)
})

test('reports source language and focus', () => {
  const result = analyzeCode('const x: any = 1;', {
    language: 'TypeScript',
    focus: 'maintainability'
  })
  assert.equal(result.language, 'TypeScript')
  assert.equal(result.focus, 'maintainability')
  assert.equal(result.counts.low, 1)
})
