# Scores and Rankings API Documentation

## Overview

This module provides API endpoints for retrieving user scores and generating leaderboards for the Cave Exploration Game.

## Endpoints

### 1. Get User Score

**Endpoint**: `GET /api/scores/:userId`

**Description**: Retrieve a specific user's current score and information.

**URL Parameters**:
- `userId` (required): The unique identifier of the user

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "username": "张三",
  "score": 50
}
```

**Error Responses**:

- **Code**: 400 Bad Request
- **Content**: `{ "error": "用户ID不能为空" }`
- **Condition**: userId parameter is empty or whitespace

---

- **Code**: 404 Not Found
- **Content**: `{ "error": "用户不存在" }`
- **Condition**: No user found with the given userId

---

- **Code**: 500 Internal Server Error
- **Content**: `{ "error": "获取用户积分失败" }`
- **Condition**: Database error or server error

**Example Request**:
```bash
curl http://localhost:3000/api/scores/123e4567-e89b-12d3-a456-426614174000
```

**Example Response**:
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "username": "张三",
  "score": 50
}
```

---

### 2. Get Rankings

**Endpoint**: `GET /api/rankings`

**Description**: Retrieve the leaderboard showing all users who have completed the game, sorted by score (descending) and completion time (ascending).

**Query Parameters**:
- `limit` (optional): Maximum number of results to return
  - Type: Integer
  - Default: 100
  - Range: 1-1000
  - Example: `?limit=10`

- `offset` (optional): Number of results to skip (for pagination)
  - Type: Integer
  - Default: 0
  - Minimum: 0
  - Example: `?offset=20`

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "rankings": [
    {
      "rank": 1,
      "username": "李四",
      "score": 100,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "rank": 2,
      "username": "张三",
      "score": 50,
      "timestamp": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

**Error Responses**:

- **Code**: 400 Bad Request
- **Content**: `{ "error": "limit 参数必须在 1-1000 之间" }`
- **Condition**: limit parameter is less than 1 or greater than 1000

---

- **Code**: 400 Bad Request
- **Content**: `{ "error": "offset 参数不能为负数" }`
- **Condition**: offset parameter is negative

---

- **Code**: 500 Internal Server Error
- **Content**: `{ "error": "获取排名列表失败" }`
- **Condition**: Database error or server error

**Sorting Rules**:
1. **Primary Sort**: Score (descending) - Users with higher scores appear first
2. **Secondary Sort**: Timestamp (ascending) - When scores are equal, users who completed earlier appear first

**Filtering**:
- Only includes users who have completed the game (`completed_at IS NOT NULL`)
- Users who haven't finished the game are excluded from rankings

**Example Requests**:

Get top 10 rankings:
```bash
curl http://localhost:3000/api/rankings?limit=10
```

Get rankings 11-20 (second page):
```bash
curl http://localhost:3000/api/rankings?limit=10&offset=10
```

Get all rankings (default):
```bash
curl http://localhost:3000/api/rankings
```

**Example Response**:
```json
{
  "rankings": [
    {
      "rank": 1,
      "username": "高分玩家",
      "score": 200,
      "timestamp": "2024-01-15T09:00:00.000Z"
    },
    {
      "rank": 2,
      "username": "优秀玩家",
      "score": 180,
      "timestamp": "2024-01-15T09:15:00.000Z"
    },
    {
      "rank": 3,
      "username": "良好玩家",
      "score": 150,
      "timestamp": "2024-01-15T09:30:00.000Z"
    }
  ]
}
```

## Data Models

### User Score Response
```typescript
interface UserScoreResponse {
  userId: string;      // UUID of the user
  username: string;    // Display name of the user
  score: number;       // Current total score (0-200)
}
```

### Ranking Entry
```typescript
interface RankingEntry {
  rank: number;        // Position in leaderboard (1-indexed)
  username: string;    // Display name of the user
  score: number;       // Total score (0-200)
  timestamp: string;   // ISO 8601 timestamp of game completion
}
```

### Rankings Response
```typescript
interface RankingsResponse {
  rankings: RankingEntry[];  // Array of ranking entries
}
```

## Usage Examples

### Frontend Integration

#### Display User's Current Score
```javascript
async function displayUserScore(userId) {
  try {
    const response = await fetch(`/api/scores/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch score');
    }
    
    const data = await response.json();
    console.log(`${data.username}: ${data.score} points`);
    
    // Update UI
    document.getElementById('score').textContent = data.score;
    document.getElementById('username').textContent = data.username;
  } catch (error) {
    console.error('Error fetching score:', error);
  }
}
```

#### Display Leaderboard
```javascript
async function displayLeaderboard(limit = 10, offset = 0) {
  try {
    const response = await fetch(`/api/rankings?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch rankings');
    }
    
    const data = await response.json();
    
    // Update UI
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';
    
    data.rankings.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'ranking-row';
      row.innerHTML = `
        <span class="rank">#${entry.rank}</span>
        <span class="username">${entry.username}</span>
        <span class="score">${entry.score} 分</span>
      `;
      leaderboardElement.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
  }
}
```

#### Pagination Example
```javascript
class LeaderboardPagination {
  constructor(pageSize = 10) {
    this.pageSize = pageSize;
    this.currentPage = 0;
  }
  
  async loadPage(page) {
    const offset = page * this.pageSize;
    const response = await fetch(`/api/rankings?limit=${this.pageSize}&offset=${offset}`);
    const data = await response.json();
    
    this.currentPage = page;
    return data.rankings;
  }
  
  async nextPage() {
    return this.loadPage(this.currentPage + 1);
  }
  
  async previousPage() {
    if (this.currentPage > 0) {
      return this.loadPage(this.currentPage - 1);
    }
    return [];
  }
}

// Usage
const pagination = new LeaderboardPagination(10);
const rankings = await pagination.loadPage(0); // First page
```

## Database Schema

The endpoints rely on the following database schema:

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL
);

CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_score_time ON users(score DESC, created_at ASC);
```

**Key Fields**:
- `id`: Unique identifier for the user (UUID)
- `username`: Display name (unique, 1-50 characters)
- `score`: Total points earned (0-200)
- `created_at`: When the user started the game
- `completed_at`: When the user finished all questions (NULL if not completed)

## Performance Considerations

### Indexing
- The `idx_score_time` index optimizes the rankings query
- Composite index on (score DESC, created_at ASC) matches the ORDER BY clause
- Primary key index on `id` optimizes score lookups

### Query Optimization
- Rankings query uses a single SELECT with proper WHERE clause
- No N+1 query problems
- Limit parameter prevents excessive data transfer

### Caching Recommendations
For production environments with high traffic:
1. Cache rankings for 30-60 seconds (rankings don't change frequently)
2. Use Redis or in-memory cache
3. Invalidate cache when new scores are submitted
4. Cache individual user scores for 5-10 seconds

Example caching strategy:
```javascript
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

async function getCachedRankings(limit, offset) {
  const key = `rankings:${limit}:${offset}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchRankingsFromDB(limit, offset);
  cache.set(key, { data, timestamp: Date.now() });
  
  return data;
}
```

## Error Handling

### Client-Side Error Handling
```javascript
async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 400:
          console.error('Invalid request:', error.error);
          alert('请求参数无效');
          break;
        case 404:
          console.error('Not found:', error.error);
          alert('未找到用户');
          break;
        case 500:
          console.error('Server error:', error.error);
          alert('服务器错误，请稍后重试');
          break;
        default:
          console.error('Unknown error:', error);
          alert('发生未知错误');
      }
      
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network error:', error);
    alert('网络连接失败，请检查网络');
    return null;
  }
}
```

## Testing

### Unit Tests
Run unit tests with:
```bash
node --test src/routes/scores.test.js
```

### Property-Based Tests
Run property-based tests with:
```bash
node --test src/routes/scores.pbt.test.js
```

### Manual Testing
```bash
# Start the server
npm run dev

# In another terminal, test the endpoints
curl http://localhost:3000/api/scores/<userId>
curl http://localhost:3000/api/rankings
curl "http://localhost:3000/api/rankings?limit=5&offset=0"
```

## Security Considerations

1. **Input Validation**: All parameters are validated before database queries
2. **SQL Injection**: Using parameterized queries prevents SQL injection
3. **Rate Limiting**: Consider adding rate limiting for production (not implemented yet)
4. **CORS**: CORS is enabled; configure allowed origins in production
5. **Authentication**: Currently no authentication; add JWT or session-based auth if needed

## Future Enhancements

1. **Tie Handling**: Implement proper rank calculation for tied scores
2. **User Highlighting**: Add parameter to highlight specific user in rankings
3. **Date Range Filtering**: Filter rankings by completion date
4. **Statistics Endpoint**: Add aggregate statistics (avg score, total players, etc.)
5. **Real-time Updates**: WebSocket support for live leaderboard updates
6. **Caching Layer**: Redis integration for improved performance
7. **Rate Limiting**: Prevent abuse with rate limiting middleware
8. **Authentication**: Add user authentication for score updates

## Support

For issues or questions:
1. Check the implementation summary: `TASK_5.1_5.2_IMPLEMENTATION_SUMMARY.md`
2. Review test files for usage examples
3. Check server logs for error details
4. Verify database schema and indexes

## Related Files

- Implementation: `src/routes/scores.js`
- Unit Tests: `src/routes/scores.test.js`
- Property Tests: `src/routes/scores.pbt.test.js`
- Server Config: `src/index.js`
- Database: `database/db.js`
- Schema: `database/schema.sql`
