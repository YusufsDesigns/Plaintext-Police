# Contributing to Plaintext Police

## What to Contribute
- New private key detection patterns in `src/detector.ts`
- False positive fixes (patterns firing when they shouldn't)
- New file type support
- Bug reports

## How to Contribute
1. Fork the repo
2. Create a branch: `git checkout -b fix/your-fix`
3. Make your changes
4. Add a test case in `test/detector.test.ts` proving it works
5. Open a pull request with a clear description

## Adding a Detection Pattern
Every new pattern must include:
- The regex in `PRIVATE_KEY_PATTERNS`
- A test case that matches it
- A test case that does NOT match (to prevent false positives)

## Reporting False Positives
Open an issue with the exact line that triggered the alert
and we will fix the pattern.