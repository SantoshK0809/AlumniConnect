# Transition Guide: Mock Mode → Production Mode

## Overview

Currently running in **MOCK MODE** with test data. This guide explains how to transition to **PRODUCTION MODE** using real recommendations when your data is available.

---

## Current State (Mock Mode)

```
Your AlumniConnect Platform
        ↓
Express Backend (Node.js)
        ↓
Python Dev API (app_dev.py)
        ↓
Mock Service (returns test data)
```

**Status:** ✅ Ready to use
**Data Required:** None
**Model Required:** No
**Performance:** Instant

---

## Target State (Production Mode)

```
Your AlumniConnect Platform
        ↓
Express Backend (Node.js)
        ↓
Python Production API (app.py)
        ↓
Trained ML Model
        ↓
Real Student/Alumni Data (MongoDB)
```

**Status:** Production-ready
**Data Required:** Yes (Student & Alumni profiles)
**Model Required:** Yes (trained with your data)
**Performance:** < 100ms per request

---

## 📊 Data Requirements

Before you can transition to production, you need:

### In your MongoDB:

1. **Students Collection**
   ```javascript
   {
     user: ObjectId,
     department: String,
     batch: Number,
     skills: [String],
     projects: [String],
     achievements: [String],
     bio: String,
     verified: Boolean,
     isActive: Boolean
   }
   ```

2. **Alumni Collection**
   ```javascript
   {
     user: ObjectId,
     department: String,
     graduationYear: Number,
     skills: [String],
     achievements: [String],
     currentCompany: String,
     currentPosition: String,
     bio: String,
     verified: Boolean,
     isActive: Boolean
   }
   ```

3. **Users Collection** (referenced by Student/Alumni)
   ```javascript
   {
     name: String,
     email: String,
     role: String // "Student" or "Alumni"
   }
   ```

### Minimum Data Volume:**
- **50+ students** with filled profiles
- **50+ alumni** with filled profiles
- **50% profile completeness** on average

---

## 🚀 Transition Steps

### Step 1: Verify Data in MongoDB

```bash
# Connect to MongoDB
mongosh

# Check your database
use aluminiconnect
db.students.countDocuments({isActive: true})
db.alumni.countDocuments({isActive: true})

# Should return counts > 50
```

### Step 2: Prepare for Training

Stop the current dev API:
```bash
# In Terminal 1, press Ctrl+C to stop app_dev.py
```

### Step 3: Train the Model

```bash
cd d:\AluminiConnect\ml_recommendation

# Activate virtual environment
venv\Scripts\activate.bat

# Train with your real data from MongoDB
python train.py --model-type hybrid

# Output should show: ✓ Model saved to ./models/alumni_recommendation_model.pkl
```

**Training will:**
- ✓ Extract all your student/alumni data from MongoDB
- ✓ Process and clean the data
- ✓ Generate feature matrices
- ✓ Train the recommendation model
- ✓ Save model to `./models/alumni_recommendation_model.pkl`
- ✓ Save statistics to `./models/alumni_recommendation_model_stats.json`

### Step 4: Switch to Production API

Replace `app_dev.py` with `app.py`:

```bash
# Start production API instead
python app.py

# Output should show:
# ✓ Real Mode: Using trained model
# ✓ Model and profiles loaded successfully
```

### Step 5: Update Backend (No Code Changes Needed!)

Your Express backend will automatically work with production mode. The API contract is identical:

```javascript
// No changes needed to your code!
const result = await callMLAPI('/api/recommendations/alumni', 'POST', {
  student_id: studentId,
  limit: 10
});

// Will now return real recommendations instead of mock!
```

### Step 6: Test Production Recommendations

```bash
# Get recommendations (now using real model!)
curl -X POST http://localhost:5000/api/recommendations/alumni \
  -H "Content-Type: application/json" \
  -d '{"student_id":"YOUR_REAL_STUDENT_ID","limit":10}'
```

---

## 🎯 During Transition

### Day 1-2: Training Phase
- Run model training
- Monitor training output for any errors
- Verify model file was created

### Day 3: Production Rollout
- Switch to production API
- Run test queries with real student IDs
- Monitor recommendation quality
- Gather initial feedback

### Day 4+: Optimization
- Analyze recommendation scores
- Retrain periodically (weekly/monthly)
- Gather user feedback
- Fine-tune weights in `config.py`

---

## 🔍 Monitoring Recommendations

### Check Model Statistics
```bash
curl http://localhost:5000/api/model/stats

Response:
{
  "students_count": 150,
  "alumni_count": 200,
  "average_similarity": 0.45,
  "max_similarity": 1.0,
  "timestamp": "2024-04-15T10:30:00"
}
```

### Verify Recommendation Quality
```bash
# Test with different student IDs
curl -X POST http://localhost:5000/api/recommendations/alumni \
  -H "Content-Type: application/json" \
  -d '{"student_id":"REAL_STUDENT_ID_1","limit":5}'

# Check if:
# 1. Scores are between 0-100
# 2. Top matches have same/related departments
# 3. Scores vary reasonably (not all 100 or all 20)
```

---

## 🔄 Continuous Improvement

### Retrain Periodically

```bash
# Monthly retraining (recommended)
python train.py --model-type hybrid

# Or create a scheduled task (Windows Task Scheduler)
# Run: python train.py --model-type hybrid
# Frequency: Weekly or Monthly
```

### Adjust Weights

Edit `config.py` to change recommendation factors:

```python
# Increase weight for skills matching
SKILLS_WEIGHT = 0.35  # was 0.25

# Decrease weight for activity status
ACTIVITY_WEIGHT = 0.05  # was 0.10

# Retrain to apply changes
python train.py --model-type hybrid
```

---

## 📋 Troubleshooting Transition

### Issue: "Model not found" error
```
Error: Failed to load model
```
**Solution:** Check that model training completed successfully:
```bash
ls -la models/
# Should show: alumni_recommendation_model.pkl (>1MB)
```

### Issue: Low recommendation scores (all < 30)
```
recommendations_score: 22.5
```
**Solution:** 
1. Check data quality in MongoDB
2. Verify students and alumni have filled profiles
3. Try retraining with more data

### Issue: Training takes too long
```
Training... (> 30 minutes)
```
**Solution:**
1. Kill process (Ctrl+C)
2. Use CSV files for faster training:
   ```bash
   python train.py --model-type hybrid --use-local-files
   ```
3. Process smaller dataset

### Issue: Recommendations are all the same
```
All recommendations score 85.5%
```
**Solution:**
1. Add more skill/achievement variety to profiles
2. Ensure departments are properly set
3. Retrain model

---

## 📊 Performance Metrics

### Expected Performance

| Metric | Development (Mock) | Production (Real) |
|--------|-------------------|-------------------|
| Response Time | < 10ms | 50-200ms |
| Memory Usage | 50MB | 200-500MB |
| Scalability | Unlimited mock | 100K+ profiles |
| Model Size | N/A | 2-5MB |
| Accuracy | N/A | 70-90% satisfaction |

---

## 🎓 Understanding the Transition

### What Changes
- ✅ API returns real recommendations
- ✅ Based on actual student/alumni data
- ✅ Uses trained ML model
- ✅ Slower but more accurate

### What Doesn't Change
- ✅ API endpoints (same URLs)
- ✅ Request/response format
- ✅ Code in your backend
- ✅ Frontend components
- ✅ User experience

---

## 🚀 Rollback Plan

If production recommendations aren't working, you can quickly switch back:

```bash
# Stop production API
Ctrl+C

# Start development mode
python app_dev.py

# Everything works again with mock data!
```

---

## 📈 Success Criteria

Your transition is successful when:

- ✅ Model trains without errors
- ✅ Recommendations have varied scores (30-95)
- ✅ Same-department alumni rank higher
- ✅ Similar-skill alumni rank higher
- ✅ Response time is < 500ms
- ✅ Users give positive feedback

---

## 📞 Common Questions

### Q: Can I keep mock mode?
**A:** Yes! You can switch between modes:
```bash
# Switch to mock (development)
curl -X POST http://localhost:5000/api/mode/switch \
  -H "Content-Type: application/json" \
  -d '{"mode":"mock"}'

# Switch back to production
curl -X POST http://localhost:5000/api/mode/switch \
  -H "Content-Type: application/json" \
  -d '{"mode":"production"}'
```

### Q: How often should I retrain?
**A:** 
- Weekly for initial optimization
- Monthly once stable
- Immediately after bulk data updates

### Q: What if I get new data?
**A:** Simply retrain:
```bash
python train.py --model-type hybrid
```

### Q: Can I A/B test?
**A:** Yes, run two instances:
```bash
# Terminal 1: Production model
python app.py

# Terminal 2: Mock mode (different port)
USE_MOCK_MODE=True python app.py --port 5001
```

---

## Timeline Example

```
Current:  MOCK MODE (Your app running now ✓)
          Users get test recommendations

Week 1:   Data collection
          Student/alumni profiles added to MongoDB

Week 2:   Model training
          python train.py --model-type hybrid

Week 3:   Production rollout
          Switch from app_dev.py to app.py

Week 4+:  Optimization & feedback
          Retrain, adjust weights, gather user feedback
```

---

## Next Steps

1. **Now:** Continue using mock mode for development
2. **When ready:** Collect real data (50+ students & alumni)
3. **Then:** Run model training
4. **Finally:** Switch to production mode

**See:** [NO_DATA_SETUP.md](NO_DATA_SETUP.md) for current mock mode details

---

**Your recommendation system is designed for this transition.** 
Everything is ready - just collect data when you're ready! 🚀
