# Frontend Utilities

This directory contains core utility classes for the Cave Exploration Game frontend.

## StateManager

**Purpose**: Centralized game state management with event-driven architecture.

### Quick Start

```javascript
import StateManager from './utils/StateManager.js';

const stateManager = new StateManager();

// Listen to state changes
stateManager.on('scoreChanged', ({ newScore, delta }) => {
  console.log(`Score changed by ${delta} to ${newScore}`);
});

// Set user
stateManager.setUsername('张三', 'user-123');

// Update score
stateManager.updateScore(10);

// Mark question completed
stateManager.markQuestionCompleted('q1');

// Change game phase
stateManager.setGamePhase('playing');
```

### State Structure

```javascript
{
  user: {
    id: string,
    username: string,
    score: number,
    completedQuestions: Set<string>
  },
  game: {
    phase: 'login' | 'playing' | 'finished',
    questions: Question[],
    interactionPoints: InteractionPoint[],
    currentQuestion: Question | null
  }
}
```

### Available Events

| Event | Data | Description |
|-------|------|-------------|
| `userChanged` | `UserState` | User session created/updated |
| `scoreChanged` | `{oldScore, newScore, delta}` | Score updated |
| `questionCompleted` | `questionId` | Question marked completed |
| `allQuestionsCompleted` | - | All questions finished |
| `phaseChanged` | `{oldPhase, newPhase}` | Game phase changed |
| `questionsLoaded` | `Question[]` | Questions loaded |
| `interactionPointsLoaded` | `InteractionPoint[]` | Points loaded |
| `currentQuestionChanged` | `Question \| null` | Current question changed |
| `interactionPointStateChanged` | `{pointId, state}` | Point state changed |
| `stateReset` | - | State reset to initial |

### Methods

#### User Management
- `setUsername(username, userId)` - Create user session
- `updateScore(delta)` - Update user score
- `markQuestionCompleted(questionId)` - Mark question as done

#### Game Management
- `setGamePhase(phase)` - Change game phase
- `setQuestions(questions)` - Load questions
- `setInteractionPoints(points)` - Load interaction points
- `setCurrentQuestion(question)` - Set current question
- `updateInteractionPointState(pointId, state)` - Update point state
- `reset()` - Reset all state

#### Event System
- `on(event, callback)` - Register event listener
- `off(event, callback)` - Remove event listener

#### Debugging
- `getSnapshot()` - Get current state snapshot

---

## APIClient

**Purpose**: HTTP client for backend API communication with error handling and retry logic.

### Quick Start

```javascript
import APIClient from './utils/APIClient.js';

const apiClient = new APIClient();

// Register user
try {
  const { userId } = await apiClient.registerUser('张三');
  console.log('User registered:', userId);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Get questions
const { questions } = await apiClient.getQuestions();

// Submit answer
const result = await apiClient.submitAnswer(userId, questionId, answerId);
if (result.correct) {
  console.log(`Correct! Earned ${result.scoreEarned} points`);
}

// Get rankings
const { rankings } = await apiClient.getRankings(10, 0);
```

### API Methods

#### User Management
```javascript
// Register new user
await apiClient.registerUser(username)
// Returns: {success: boolean, userId: string, message: string}

// Check username availability
await apiClient.checkUsername(username)
// Returns: {available: boolean}
```

#### Questions
```javascript
// Get all questions
await apiClient.getQuestions()
// Returns: {questions: Question[]}

// Submit answer
await apiClient.submitAnswer(userId, questionId, answerId)
// Returns: {correct: boolean, scoreEarned: number, totalScore: number}
```

#### Scores & Rankings
```javascript
// Get user score
await apiClient.getUserScore(userId)
// Returns: {userId: string, username: string, score: number}

// Get rankings
await apiClient.getRankings(limit = 100, offset = 0)
// Returns: {rankings: Ranking[]}
```

### Configuration

```javascript
// Create with custom config
const apiClient = new APIClient({
  baseURL: '/api',
  timeout: 10000,      // 10 seconds
  maxRetries: 3,
  retryDelay: 1000     // 1 second
});

// Or configure after creation
apiClient.setBaseURL('/custom-api');
apiClient.setTimeout(5000);
apiClient.setMaxRetries(2);
```

### Error Handling

```javascript
import APIClient, { APIError } from './utils/APIClient.js';

try {
  await apiClient.registerUser('张三');
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Original Error:', error.originalError);
  }
}
```

### Retry Logic

The client automatically retries failed requests:
- **Network errors**: Retries with exponential backoff
- **Timeout errors**: Retries with exponential backoff
- **Server errors (5xx)**: Retries with exponential backoff
- **Client errors (4xx)**: No retry (immediate failure)

Retry delays use exponential backoff:
- 1st retry: 1 second
- 2nd retry: 2 seconds
- 3rd retry: 4 seconds

---

## Integration Example

Complete game flow using both utilities:

```javascript
import StateManager from './utils/StateManager.js';
import APIClient from './utils/APIClient.js';

const stateManager = new StateManager();
const apiClient = new APIClient();

// Setup event listeners
stateManager.on('scoreChanged', ({ newScore, delta }) => {
  updateScoreDisplay(newScore);
  showScoreAnimation(delta);
});

stateManager.on('allQuestionsCompleted', async () => {
  stateManager.setGamePhase('finished');
  const { rankings } = await apiClient.getRankings();
  showRankingsPage(rankings);
});

// User registration
async function registerUser(username) {
  try {
    const { userId } = await apiClient.registerUser(username);
    stateManager.setUsername(username, userId);
    stateManager.setGamePhase('playing');
    
    // Load questions
    const { questions } = await apiClient.getQuestions();
    stateManager.setQuestions(questions);
    
    return true;
  } catch (error) {
    showError(error.message);
    return false;
  }
}

// Answer submission
async function submitAnswer(questionId, answerId) {
  try {
    const userId = stateManager.user.id;
    const result = await apiClient.submitAnswer(userId, questionId, answerId);
    
    if (result.correct) {
      stateManager.updateScore(result.scoreEarned);
      stateManager.markQuestionCompleted(questionId);
      showCorrectFeedback(result.scoreEarned);
    } else {
      showIncorrectFeedback();
    }
    
    return result.correct;
  } catch (error) {
    showError(error.message);
    return false;
  }
}
```

---

## Testing

Both utilities have comprehensive test suites:

```bash
# Run all tests
npm test

# Run specific tests
npm test StateManager.test.js
npm test APIClient.test.js

# Run with coverage
npm test -- --coverage
```

---

## Best Practices

### StateManager
1. **Single Instance**: Use one StateManager instance per application
2. **Event Cleanup**: Remove event listeners when components unmount
3. **Immutability**: Don't modify state directly, use provided methods
4. **Error Handling**: Wrap state updates in try-catch blocks

### APIClient
1. **Single Instance**: Reuse one APIClient instance
2. **Error Handling**: Always wrap API calls in try-catch
3. **User Feedback**: Show loading states during API calls
4. **Retry Logic**: Trust the built-in retry mechanism
5. **Timeout**: Adjust timeout based on network conditions

---

## Type Definitions

### Question
```javascript
{
  id: string,
  text: string,
  options: Array<{id: string, text: string}>,
  correctAnswerId: string,
  difficulty: 'basic' | 'advanced'
}
```

### InteractionPoint
```javascript
{
  id: string,
  x: number,              // 0-1 (percentage)
  y: number,              // 0-1 (percentage)
  state: 'active' | 'completed' | 'hover',
  questionId: string
}
```

### Ranking
```javascript
{
  rank: number,
  username: string,
  score: number,
  timestamp: string       // ISO 8601 format
}
```

---

## Troubleshooting

### StateManager Issues

**Problem**: Events not firing
- **Solution**: Ensure listeners are registered before state changes
- **Check**: Verify event names match exactly (case-sensitive)

**Problem**: State not updating
- **Solution**: Check for errors in console, ensure user is logged in
- **Check**: Verify method parameters are valid

### APIClient Issues

**Problem**: Network errors
- **Solution**: Check backend server is running
- **Check**: Verify baseURL is correct
- **Check**: Check browser console for CORS errors

**Problem**: Timeout errors
- **Solution**: Increase timeout with `setTimeout()`
- **Check**: Verify network connection
- **Check**: Check backend response time

**Problem**: Retry not working
- **Solution**: Verify error type (4xx errors don't retry)
- **Check**: Check maxRetries configuration
- **Check**: Look for retry warnings in console

---

## Contributing

When adding new features:
1. Update the class implementation
2. Add comprehensive unit tests
3. Update this README
4. Update JSDoc comments
5. Run tests and ensure they pass

---

## License

MIT
