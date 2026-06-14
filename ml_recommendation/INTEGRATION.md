# Integration Guide - Connecting Python ML to Node.js Backend

## Overview

This guide explains how to integrate the Python ML recommendation system with your Node.js Express backend.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Express Backend                        │
│  ├─ Authentication                                          │
│  ├─ User Management                                         │
│  ├─ Profile Management                                      │
│  └─ [NEW] Recommendation Routes ◄──────────┐               │
└──────────────────────────────────────────────┼──────────────┘
                                               │ HTTP
                                               ▼
                            ┌──────────────────────────────┐
                            │  Python Flask API            │
                            │  (ML Recommendation Service) │
                            │                              │
                            │  ├─ Models                   │
                            │  ├─ Algorithms               │
                            │  └─ Inference                │
                            └──────────────────────────────┘
```

---

## Step 1: Verify Python API is Running

Before integrating, ensure the Python API is running:

```bash
curl http://localhost:5000/health

# Response:
# {"status": "healthy", "service": "Alumni Recommendation System API"}
```

---

## Step 2: Create Recommendation Routes in Node.js

Create a new file: `Backend/routes/recommendationRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Configuration
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';
const ML_API_TIMEOUT = 10000; // 10 seconds

/**
 * Helper function to call ML API
 */
async function callMLAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: ML_API_TIMEOUT
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const url = `${ML_API_URL}${endpoint}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`ML API call failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * GET /api/recommendations/alumni
 * Get recommended alumni for the student
 * Query params: limit, min_score, filter_department
 */
router.get(
  '/alumni',
  verifyToken,
  authorizeRoles('Student'),
  async (req, res) => {
    try {
      const studentUserId = req.user.id;
      const { limit = 10, min_score = 0, filter_department } = req.query;

      // Call Python ML API
      const recommendations = await callMLAPI('/api/recommendations/alumni', 'POST', {
        student_id: studentUserId,
        limit: parseInt(limit),
        min_score: parseFloat(min_score),
        filter_department
      });

      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recommendations'
      });
    }
  }
);

/**
 * GET /api/recommendations/alumni/:alumniId/detail
 * Get detailed recommendation analysis for a specific alumni
 */
router.get(
  '/alumni/:alumniId/detail',
  verifyToken,
  authorizeRoles('Student'),
  async (req, res) => {
    try {
      const studentUserId = req.user.id;
      const alumniId = req.params.alumniId;

      const detail = await callMLAPI(
        `/api/recommendations/alumni/${alumniId}/detail?student_id=${studentUserId}`
      );

      res.status(200).json({
        success: true,
        data: detail
      });
    } catch (error) {
      console.error('Error fetching recommendation detail:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recommendation details'
      });
    }
  }
);

/**
 * GET /api/recommendations/analytics
 * Get analytics about recommendations for a student
 */
router.get(
  '/analytics',
  verifyToken,
  authorizeRoles('Student'),
  async (req, res) => {
    try {
      const studentUserId = req.user.id;

      const analytics = await callMLAPI('/api/recommendations/analytics', 'POST', {
        student_id: studentUserId
      });

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics'
      });
    }
  }
);

/**
 * GET /api/recommendations/similar-alumni/:alumniId
 * Get similar alumni for networking
 */
router.get(
  '/similar-alumni/:alumniId',
  verifyToken,
  async (req, res) => {
    try {
      const alumniId = req.params.alumniId;
      const { limit = 10 } = req.query;

      const similar = await callMLAPI(
        `/api/recommendations/similar-alumni?alumni_id=${alumniId}&limit=${limit}`
      );

      res.status(200).json({
        success: true,
        data: similar
      });
    } catch (error) {
      console.error('Error fetching similar alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch similar alumni'
      });
    }
  }
);

/**
 * GET /api/recommendations/model/stats
 * Get ML model statistics
 */
router.get(
  '/model/stats',
  verifyToken,
  authorizeRoles('SuperAdmin'),
  async (req, res) => {
    try {
      const stats = await callMLAPI('/api/model/stats');

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching model stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model statistics'
      });
    }
  }
);

/**
 * POST /api/recommendations/model/retrain
 * Trigger model retraining (Admin only)
 */
router.post(
  '/model/retrain',
  verifyToken,
  authorizeRoles('SuperAdmin'),
  async (req, res) => {
    try {
      const result = await callMLAPI('/api/model/retrain', 'POST');

      res.status(200).json({
        success: true,
        message: result.message || 'Model retraining initiated'
      });
    } catch (error) {
      console.error('Error retraining model:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrain model'
      });
    }
  }
);

module.exports = router;
```

---

## Step 3: Register Routes in Express App

Update `Backend/app.js`:

```javascript
// ... existing imports ...
const recommendationRoutes = require('./routes/recommendationRoutes');

// ... existing middleware ...

// Register recommendation routes
app.use('/api/recommendations', recommendationRoutes);

// ... rest of app ...
```

---

## Step 4: Add Environment Variables

Update `Backend/.env`:

```env
# ... existing env vars ...

# Python ML API Configuration
ML_API_URL=http://localhost:5000
ML_API_TIMEOUT=10000
```

---

## Step 5: Create Frontend Integration

### React Component for Recommendations

Create `Frontend/src/components/ui/AlumniRecommendations.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from './Card';
import { Badge } from './Badge';

export function AlumniRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations/alumni?limit=10', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data = await response.json();
      setRecommendations(data.data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recommended Alumni</h2>
      
      {recommendations.map((alumni) => (
        <Card key={alumni.alumni_id} className="p-4 hover:shadow-lg transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{alumni.name}</h3>
              <p className="text-gray-600">{alumni.currentPosition} at {alumni.currentCompany}</p>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {alumni.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-2">{alumni.bio}</p>
            </div>
            
            <div className="ml-4 text-right">
              <div className="text-3xl font-bold text-blue-600">
                {alumni.recommendationScore.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500">Match Score</p>
              
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Connect
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

---

## Step 6: Error Handling & Retry Logic

```javascript
// Utility function with retry logic
async function callMLAPIWithRetry(endpoint, method = 'GET', body = null, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      };

      if (body) options.body = JSON.stringify(body);

      const response = await fetch(`${process.env.ML_API_URL}${endpoint}`, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError;
}
```

---

## Step 7: Caching (Optional)

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

async function callMLAPIWithCache(cacheKey, endpoint, method = 'GET', body = null) {
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Call ML API
  const result = await callMLAPI(endpoint, method, body);

  // Store in cache
  cache.set(cacheKey, result);

  return result;
}

// Usage
const recommendations = await callMLAPIWithCache(
  `recommendations-${userId}`,
  '/api/recommendations/alumni',
  'POST',
  { student_id: userId, limit: 10 }
);
```

---

## Step 8: Testing the Integration

### Test the Route

```bash
# Start Node server
npm start

# Test recommendations endpoint
curl -X GET http://localhost:3000/api/recommendations/alumni \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "success": true,
    "count": 10,
    "recommendations": [
      {
        "alumni_id": "ALM00001",
        "name": "John Doe",
        "department": "Computer Science and Engineering",
        "graduated": 2018,
        "currentCompany": "Google",
        "currentPosition": "Senior Engineer",
        "skills": ["Python", "React", "Node.js"],
        "recommendationScore": 87.5
      }
    ]
  }
}
```

---

## Step 9: Monitoring & Logs

Track the integration:

```javascript
// Middleware to log ML API calls
app.use((req, res, next) => {
  if (req.path.includes('/recommendations')) {
    console.log(`[ML API] ${req.method} ${req.path}`, {
      timestamp: new Date().toISOString(),
      userId: req.user?.id
    });
  }
  next();
});
```

---

## Step 10: Production Deployment

### Ensure Both Services Run

```bash
# Terminal 1: Node.js Backend
npm start

# Terminal 2: Python ML API
python app.py

# Or use docker-compose for both
docker-compose up -d
```

---

## Troubleshooting

### Issue: ML API Connection Refused

```bash
# Check if Python API is running
curl http://localhost:5000/health

# If not, start it
python app.py
```

### Issue: Slow Recommendations

```javascript
// Add timeout configuration in .env
ML_API_TIMEOUT=20000  // Increase to 20 seconds
```

### Issue: Recommendations Not Working for New Students

```bash
# Retrain the model after new students are added
curl -X POST http://localhost:3000/api/recommendations/model/retrain \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recommendations/alumni` | GET | Get recommendations |
| `/api/recommendations/alumni/:id/detail` | GET | Detailed analysis |
| `/api/recommendations/analytics` | GET | Analytics data |
| `/api/recommendations/similar-alumni/:id` | GET | Similar alumni |
| `/api/recommendations/model/stats` | GET | Model statistics |
| `/api/recommendations/model/retrain` | POST | Retrain model |

---

## Environment Setup

### .env Variables

```env
# Python ML Service
ML_API_URL=http://localhost:5000
ML_API_TIMEOUT=10000

# For production
ML_API_URL=https://ml-api.yourdomain.com
ML_API_TIMEOUT=30000
```

---

## Next Steps

1. Test all endpoints with sample data
2. Deploy both services (Node.js + Python)
3. Monitor logs and performance
4. Retrain model periodically
5. Gather user feedback

---

For more details, see:
- [Python ML Documentation](README.md)
- [Node.js Backend Documentation](../../Backend/README.md)
