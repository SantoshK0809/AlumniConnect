# Quick Start Guide - Alumni Recommendation System

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.8+
- MongoDB (local or cloud)
- Git (optional)

---

## Method 1: Fastest Start (Windows)

### Step 1: Setup
```cmd
setup.bat
```

### Step 2: Generate Sample Data (Optional)
```cmd
python generate_sample_data.py --students 100 --alumni 150
```

### Step 3: Train Model
```cmd
python train.py --model-type hybrid --use-local-files
```

### Step 4: Start API
```cmd
python app.py
```

Done! Your API is running on `http://localhost:5000`

---

## Method 2: Linux/macOS

### Step 1: Setup
```bash
chmod +x setup.sh
./setup.sh
```

### Step 2: Generate Sample Data
```bash
python generate_sample_data.py --students 100 --alumni 150
```

### Step 3: Train Model
```bash
python train.py --model-type hybrid --use-local-files
```

### Step 4: Start API
```bash
python app.py
```

---

## Method 3: Docker (Recommended for Production)

### Step 1: Build and Run
```bash
docker-compose up -d
```

### Step 2: Wait for Services
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f recommendation_api
```

### Step 3: Generate and Train (if using new MongoDB)
```bash
# Train in background
docker-compose exec recommendation_api python train.py --model-type hybrid
```

### Step 4: Test
```bash
curl http://localhost:5000/health
```

---

## First API Call

### Get Recommendations for a Student

```bash
curl -X POST http://localhost:5000/api/recommendations/alumni \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "STU00001",
    "limit": 10,
    "min_score": 0
  }'
```

### Expected Response:
```json
{
  "success": true,
  "count": 10,
  "recommendations": [
    {
      "alumni_id": "ALM00001",
      "name": "Alumni 1",
      "department": "Computer Science and Engineering",
      "currentCompany": "Google",
      "currentPosition": "Senior Engineer",
      "skills": ["Python", "Node.js", "React"],
      "recommendationScore": 87.5
    }
  ]
}
```

---

## Common Issues & Quick Fixes

### Issue: "Port 5000 in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# macOS/Linux
lsof -i :5000
kill -9 [PID]
```

### Issue: "MongoDB connection failed"
Check `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017
```

Start MongoDB:
```bash
# Windows: mongod
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongodb
```

### Issue: "Model not found"
Train the model:
```bash
python train.py --model-type hybrid
```

Or generate sample data and train:
```bash
python generate_sample_data.py
python train.py --model-type hybrid --use-local-files
```

---

## Next Steps

1. **Explore Recommendations**
   ```bash
   python test.py
   ```

2. **Check Model Stats**
   ```bash
   curl http://localhost:5000/api/model/stats
   ```

3. **Integrate with Backend**
   See [INTEGRATION.md](INTEGRATION.md)

4. **Read Full Documentation**
   See [README.md](README.md)

5. **Deploy to Production**
   See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `setup.bat` or `setup.sh` | Install dependencies |
| `python generate_sample_data.py` | Create test data |
| `python train.py` | Train ML model |
| `python app.py` | Start API server |
| `python test.py` | Run test suite |
| `docker-compose up` | Start with Docker |
| `curl http://localhost:5000/health` | Check API status |

---

## Verifying Installation

```bash
# 1. Check Python
python --version

# 2. Check dependencies
pip list | grep pandas

# 3. Check MongoDB
mongosh --eval "db.adminCommand('ping')"

# 4. Check model
ls -la models/

# 5. Check data
ls -la data/
```

---

## Stop the Services

```bash
# Flask API: Ctrl+C in terminal

# Docker: 
docker-compose down

# Stop MongoDB:
# Windows: mongod stops with terminal close
# macOS: brew services stop mongodb-community
# Linux: sudo systemctl stop mongodb
```

---

## Getting Help

1. **Check logs**:
   ```bash
   cat logs/*.log
   tail -f logs/*.log  # For live logs
   ```

2. **Validate setup**:
   ```bash
   python -c "from models import AlumniRecommendationModel; print('✓ Models OK')"
   ```

3. **Check database connection**:
   ```bash
   python -c "from data_processor import DataProcessor; dp = DataProcessor(); dp.connect(); print('✓ MongoDB OK')"
   ```

4. **Read documentation**:
   - [INSTALL.md](INSTALL.md) - Detailed installation
   - [README.md](README.md) - Full documentation
   - [INTEGRATION.md](INTEGRATION.md) - Node.js integration

---

## Quick Stats

After training on sample data:

```
Students: 100
Alumni: 150
Recommendations per query: 10 (configurable)
Average inference time: < 100ms
Model size: ~5MB
```

---

**That's it!** You now have a working recommendation system. 🎉

For detailed information, see the full documentation in [README.md](README.md).
