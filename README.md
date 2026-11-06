# DeepSeek Harness – Code Quality Assistant

A small DeepSeek Harness bundle that registers a model-callable tool named
`review_code_quality`.

## What it does

- Scans source text for selected maintainability and security-risk patterns.
- Reports severity, line number, evidence, and a suggested remediation.
- Returns a structured report for the Harness Agent to interpret.

## Important limitations

This is a heuristic pattern scanner, not a full static analyzer or security scanner.
It does not execute code, parse every language, inspect dependencies, or prove that a
finding is exploitable. False positives and false negatives are possible.

The plugin only reviews source text explicitly passed to its tool. It does not
read or modify project files by itself.

## Compatibility

The package is authored against the public DeepSeek Harness plugin/tool API and
`@deepseek-ai/dsh-tools` version `0.2.2-rc.1`. Check your installed Harness version
before installing. If your DSH release uses another version, align the peer and
development dependency versions with that release.

## Install from GitHub

After pushing this folder to a public GitHub repository:

```bash
dsh plugin --profile web add github:trantancuong/dsh-code-quality-assistant
```

If your profile is not named `web`, replace `web` with the profile you use.

The package ships plain JavaScript, so it does not need a TypeScript build or a
`prepare` script during Git installation.

## Use it

Start or reopen a Harness session and ask:

> Use review_code_quality to review this code for security and maintainability issues: [paste code]

The Agent can call the tool and explain the returned findings.

## Test locally

Requires Node.js:

```bash
npm test
```

## Repository setup

This repository contains the plugin source and test files. Review compatibility
with your installed DeepSeek Harness release before installing it.

## Files

- `index.js` – registers the Harness tool.
- `analyzer.js` – heuristic analysis implementation.
- `cordis.patch.yml` – adds this plugin to the Harness bundle.
- `test/analyzer.test.js` – unit tests.
- `package.json` – package and DSH bundle manifest.
