# Property-Based Testing for Question Structure

## Overview

This directory contains property-based tests (PBT) for validating the question structure integrity in the cave exploration game database.

## Test File

- `question-structure.pbt.test.js` - Property-based tests for **Property 7: Question Structure Integrity**

## Requirements

Before running the tests, ensure you have:

1. Node.js >= 18.0.0 installed
2. Dependencies installed (run `npm install` in the backend directory)

## Installing Dependencies

```bash
cd cave-exploration-game/backend
npm install
```

This will install:
- `better-sqlite3` - SQLite database driver
- `fast-check` - Property-based testing library

## Running the Tests

### Run all database tests (including PBT):

```bash
cd cave-exploration-game/backend
npm run test:db
```

### Run only property-based tests:

```bash
cd cave-exploration-game/backend
npm run test:pbt
```

### Run specific test file:

```bash
cd cave-exploration-game/backend
node --test database/question-structure.pbt.test.js
```

## Property 7: Question Structure Integrity

**Validates Requirements: 4.4**

This property verifies that for any question in the database:

1. **Exactly 3 options**: Each question must have exactly 3 options (a, b, c)
2. **Exactly 1 correct answer**: Only one option's ID matches the correct answer ID
3. **Valid option IDs**: All option IDs must be 'a', 'b', or 'c'
4. **Unique option IDs**: No duplicate option IDs within a question
5. **Non-empty text**: All options must have non-empty text
6. **Exactly 2 distractors**: Each question must have exactly 2 incorrect options

## Test Structure

The property-based tests use `fast-check` to:

1. Load all questions from the seeded database
2. For each question, verify the structural properties
3. Run the property checks across all questions (up to 100 iterations)

## Expected Output

When tests pass, you should see output like:

```
✔ 属性 7: 题目结构完整性 - 每道题应该有恰好3个选项且只有1个正确答案
✔ 属性 7: 题目结构完整性 - 验证题目和选项的关联关系
✔ 属性 7: 题目结构完整性 - 验证选项ID的有效性
✔ 属性 7: 题目结构完整性 - 验证每道题恰好有2个干扰项
```

## Troubleshooting

### Error: Cannot find module 'fast-check'

Make sure you've installed dependencies:
```bash
npm install
```

### Error: Database file not found

The test creates a temporary database. If you see this error, ensure:
1. The `schema.sql` file exists in the database directory
2. The `seed.js` file exists and can be imported

### Error: No questions in database

The test requires seeded data. The `seedQuestions` function from `seed.js` is called automatically in the `before` hook.

## Integration with CI/CD

To run these tests in a CI/CD pipeline:

```yaml
- name: Install dependencies
  run: cd cave-exploration-game/backend && npm install

- name: Run property-based tests
  run: cd cave-exploration-game/backend && npm run test:pbt
```

## Related Files

- `schema.sql` - Database schema definition
- `seed.js` - Question data seeding script
- `seed.test.js` - Unit tests for seed data
- `schema.test.js` - Unit tests for database schema

## Notes

- The test creates a temporary database file (`cave-game-pbt-test.db`) which is automatically cleaned up after tests complete
- Property-based tests complement the existing unit tests by verifying properties across all questions
- The number of test iterations is limited to the number of questions in the database (max 100)
