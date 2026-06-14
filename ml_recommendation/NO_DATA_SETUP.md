# Integration Guide Without Training Data

## Quick Summary

Your recommendation system is now ready to integrate **WITHOUT requiring trained data**! It runs in **MOCK MODE** by default, providing realistic test recommendations until you have real data.

---

## 🚀 3-Step Integration

### Step 1: Add Routes to Node.js Backend

Update your `Backend/app.js`:

```javascript
// ... existing imports ...
const recommendationRoutes = require('./routes/recommendationRoutes');

// ... existing middleware setup ...

// Register recommendation routes
app.use('/api/student/recommendations', recommendationRoutes);

// ... rest of your app ...
```

### Step 2: Add Environment Variable

Update `Backend/.env`:

```env
# ... existing env vars ...

# Python ML API Configuration
ML_API_URL=http://localhost:5000
ML_API_TIMEOUT=10000
```

### Step 3: Start Both Services

**Terminal 1 - Start Python ML API (Development Mode):**
```bash
cd d:\AluminiConnect\ml_recommendation
python app_dev.py
# Output: ✓ Mock Mode: Using simulated data
```

**Terminal 2 - Start Node.js Backend:**
```bash
cd d:\AluminiConnect\Backend
npm start
```

**Done!** Your API is now running with mock recommendations.

---

## 📋 Available Endpoints (Ready to Use)

### Get Recommendations
```bash
GET /api/student/recommendations?studentId=demo&limit=10

Response:
{
  "success": true,
  "data": {
    "count": 10,
    "recommendations": [
      {
        "id": "MOCK_ALM_00001",
        "name": "Alumni Profile 1",
        "department": "Computer Science and Engineering",
        "currentCompany": "Google",
        "matchScore": 87.5,
        "skills": ["Python", "React", "Node.js"]
      }
    ],
    "mode": "development"
  }
}
```

### Get Analytics
```bash
GET /api/student/recommendations/analytics?studentId=demo

Response:
{
  "success": true,
  "data": {
    "totalRecommendations": 50,
    "averageScore": 72,
    "maxScore": 95,
    "minScore": 40
  }
}
```

### Check Status
```bash
GET /api/student/recommendations/status

Response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "mode": "development",
    "modelAvailable": false,
    "description": "Mock mode uses simulated data for development"
  }
}
```

---

## 🎨 Frontend Component (React)

Create `Frontend/src/components/RecommendationsList.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export function RecommendationsList() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(
        '/api/student/recommendations?studentId=demo&limit=10'
      );
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data.recommendations);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading recommendations...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recommended Alumni</h2>
        <span className="text-sm text-gray-500">Demo Mode (Mock Data)</span>
      </div>

      {recommendations.map((alumni) => (
        <Card key={alumni.id} className="p-4 hover:shadow-lg transition">
          <div className="flex justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{alumni.name}</h3>
              <p className="text-gray-600">
                {alumni.currentPosition} at {alumni.currentCompany}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {alumni.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-2">{alumni.bio}</p>
            </div>

            <div className="ml-4 text-right">
              <div
                className={`text-3xl font-bold ${
                  alumni.matchScore > 80 ? 'text-green-600' : 'text-blue-600'
                }`}
              >
                {alumni.matchScore.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500">Match Score</p>

              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
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

## 🔄 Switching to Real Model (When Ready)

### When You Have Real Data:

#### 1. Generate Sample Data (Optional - for testing structure)
```bash
python generate_sample_data.py --students 100 --alumni 150
```

#### 2. Extract Data from MongoDB and Train
```bash
cd d:\AluminiConnect\ml_recommendation
python train.py --model-type hybrid
```

#### 3. Restart API in Production Mode
```bash
# Stop current app_dev.py (Ctrl+C)

# Set environment variable
set USE_MOCK_MODE=False

# Start production API
python app.py
```

#### 4. Switch Backend to Production Mode
```bash
# The backend will automatically detect production mode
# No code changes needed!
```

---

## 📝 Development Workflow

### Current: MOCK MODE (You are here ✓)
```
UI → Express Backend → Python Dev API (Mock Mode)
                            ↓
                     Returns realistic test data
                     No model training needed
```

### Future: PRODUCTION MODE
```
UI → Express Backend → Python Production API (Real Model)
                            ↓
                     MongoDB (Student/Alumni Data)
                            ↓
                     Trained ML Model
                            ↓
                     Returns real recommendations
```

---

## 🧪 Testing the Integration

### Test 1: Check API is running
```bash
curl http://localhost:5000/health
```

### Test 2: Get recommendations via Express
```bash
curl http://localhost:3000/api/student/recommendations?studentId=demo
```

### Test 3: Try frontend component
Navigate to page with `<RecommendationsList />` component

---

## 🚨 Troubleshooting

### Issue: "ML API is unavailable"
```bash
# Check if Python API is running
curl http://localhost:5000/health

# If not, start it
cd d:\AluminiConnect\ml_recommendation
python app_dev.py
```

### Issue: Mock recommendations look the same
- That's normal! Mock mode generates similar data structure
- Change the department query to see variety:
  ```bash
  curl "http://localhost:3000/api/student/recommendations?dept=Electronics"
  ```

### Issue: Connection refused on port 5000
```bash
# Port already in use - change it in .env
ML_API_URL=http://localhost:5001
```

---

## 📊 Mock Mode Features

✅ **Same API contract** as production
✅ **Realistic data** with proper schema
✅ **No MongoDB** required
✅ **Instant responses** (< 10ms)
✅ **Perfect for development** and testing
✅ **Easy transition** to real model

---

## 🔐 Admin Endpoints (When Ready)

Once you train the model, use these admin endpoints:

### Train the Model
```bash
POST /api/student/recommendations/train
Header: Authorization: Bearer {ADMIN_TOKEN}
```

### Switch Mode
```bash
POST /api/student/recommendations/mode
Header: Authorization: Bearer {ADMIN_TOKEN}
Body: {"mode": "production"}
```

### Get Model Stats
```bash
GET /api/student/recommendations/stats
Header: Authorization: Bearer {ADMIN_TOKEN}
```

---

## 📋 Next Steps Checklist

- [ ] Copy `recommendationRoutes.js` to Backend
- [ ] Add route to `app.js`
- [ ] Add `ML_API_URL` to `.env`
- [ ] Start Python API: `python app_dev.py`
- [ ] Start Node.js: `npm start`
- [ ] Test endpoint: `curl localhost:3000/api/student/recommendations`
- [ ] Create React component for recommendations
- [ ] Display recommendations in UI
- [ ] Gather feedback on recommendation quality
- [ ] Train model when you have real data

---

## 🎓 Understanding Mock Mode

**Mock Mode:**
- Generates realistic student/alumni profiles
- Creates biased similarity scores (higher for same department)
- Returns recommendations matching real API format
- No model or database needed

**Perfect for:**
- UI/UX development
- Testing integration
- Demo presentations
- Gathering requirements

**Transition to production:**
- Zero code changes needed!
- Just train model and restart API
- Frontend works identically

---

## 💡 Advanced: Custom Mock Data

To customize mock recommendations, edit `mock_service.py`:

```python
# Add more companies
self.companies = [
    'Your Company 1',
    'Your Company 2',
    # ... add more
]

# Add more skills
self.skills_pool = [
    'Your Skill 1',
    'Your Skill 2',
    # ... add more
]
```

---

**That's it!** Your recommendation system is now running in development mode. 🎉

**Questions?** See the full documentation:
- [README.md](ml_recommendation/README.md) - Complete reference
- [INTEGRATION.md](ml_recommendation/INTEGRATION.md) - Backend integration details
