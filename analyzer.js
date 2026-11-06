const RULES = [
  {
    id: 'hardcoded-secret',
    severity: 'critical',
    pattern: /\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*(['"])[^'"\n]{8,}\2/ig,
    message: 'Possible hardcoded credential or secret.',
    recommendation: 'Move the secret to a secure environment variable or secret manager, rotate it if it was committed, and avoid logging it.'
  },
  {
    id: 'dynamic-eval',
    severity: 'high',
    pattern: /\beval\s*\(/g,
    message: 'Dynamic code execution through eval() was found.',
    recommendation: 'Avoid eval(). Use explicit parsing or a constrained interpreter; validate untrusted input.'
  },
  {
    id: 'debugger-statement',
    severity: 'low',
    pattern: /\bdebugger\s*;?/g,
    message: 'A debugger statement remains in the source.',
    recommendation: 'Remove debugger statements before shipping production code.'
  },
  {
    id: 'console-log',
    severity: 'low',
    pattern: /\bconsole\.(log|debug|info)\s*\(/g,
    message: 'Debug or informational console output was found.',
    recommendation: 'Use the project logging system and remove noisy or sensitive production logs.'
  },
  {
    id: 'loose-equality',
    severity: 'medium',
    pattern: /(^|[^=!])==(?!=)/g,
    message: 'Loose equality (==) was found.',
    recommendation: 'Prefer strict equality (===) unless coercion is intentional and documented.'
  },
  {
    id: 'typescript-any',
    severity: 'low',
    pattern: /:\s*any\b/g,
    message: 'A TypeScript any annotation was found.',
    recommendation: 'Prefer a precise type, unknown with validation, or a suitable generic.'
  },
  {
    id: 'empty-catch',
    severity: 'medium',
    pattern: /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g,
    message: 'An empty catch block may hide failures.',
    recommendation: 'Handle the error, add contextual logging, or document why it is intentionally ignored.'
  },
  {
    id: 'todo-fixme',
    severity: 'info',
    pattern: /\b(TODO|FIXME|HACK)\b/g,
    message: 'A TODO/FIXME/HACK marker remains in the source.',
    recommendation: 'Confirm whether the work is still needed and track unresolved items.'
  }
]

const severityWeight = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 1
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split('\n').length
}

function countBySeverity(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  for (const finding of findings) counts[finding.severity] += 1
  return counts
}

export function analyzeCode(code, options = {}) {
  const language = String(options.language || 'unknown')
  const focus = String(options.focus || 'all')
  const findings = []

  for (const rule of RULES) {
    rule.pattern.lastIndex = 0
    for (const match of code.matchAll(rule.pattern)) {
      const index = match.index ?? 0
      const line = lineNumberAt(code, index)
      const lineText = code.split('\n')[line - 1]?.trim() || ''
      findings.push({
        severity: rule.severity,
        rule: rule.id,
        line,
        message: rule.message,
        recommendation: rule.recommendation,
        evidence: lineText.slice(0, 180)
      })
    }
  }

  findings.sort((a, b) => {
    const order = ['critical', 'high', 'medium', 'low', 'info']
    return order.indexOf(a.severity) - order.indexOf(b.severity) || a.line - b.line
  })

  const counts = countBySeverity(findings)
  const penalty = findings.reduce((sum, item) => sum + severityWeight[item.severity], 0)
  const score = Math.max(0, 100 - penalty)
  const summary = findings.length === 0
    ? 'No configured heuristic patterns were detected. This does not prove the code is bug-free or secure.'
    : `Detected ${findings.length} potential issue(s): ${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low, and ${counts.info} informational.`

  return {
    language,
    focus,
    summary,
    score,
    counts,
    findings,
    limitations: 'Heuristic pattern scan only. It does not parse every language, resolve dependencies, execute code, prove exploitability, or replace linting, tests, dependency scanning, and a professional security review. Findings may include false positives and false negatives.'
  }
}
