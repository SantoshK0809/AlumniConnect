# Production Deployment Guide - AlumniConnect Recommendation System v2.0

## Overview

This guide covers deploying the fully production-ready recommendation system with complete dynamic configuration, model versioning, and admin controls.

**System Architecture:**
```
Frontend/App → Express Backend → Python ML API → MongoDB
                                  ↑
                            Fully Dynamic Config
```

---

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# Backend
cd Backend
npm install

# ML System
cd ../ml_recommendation
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
# Create all collections and indexes
python init_database.py

# Output should show:
# ✓ DATABASE INITIALIZATION COMPLETE
# - Collections created: 12
# - Skills seeded: 28
# - Companies: 15
# - Positions: 10
```

### 3. Set Environment Variables

Create `.env` file in `ml_recommendation/`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=aluminiconnect

# API Configuration
API_MODE=auto                           # 'auto', 'mock', 'production'
API_PORT=5000
LOG_LEVEL=INFO
DEBUG_MODE=False

# Admin Key (change in production!)
ADMIN_API_KEY=sk_live_your_admin_key_here
```

### 4. Start Services

```bash
# Terminal 1: Start MongoDB (if not running)
mongod

# Terminal 2: Start ML API
cd ml_recommendation
python app_production.py

# Terminal 3: Start Node.js Backend
cd Backend
npm start

# Terminal 4: Start Frontend (optional)
cd Frontend
npm run dev
```

### 5. Test

```bash
# Health check
curl http://localhost:5000/health

# Get recommendations
curl -X POST http://localhost:3000/api/student/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "demo_student_1",
    "department": "Computer Science and Engineering",
    "limit": 5
  }'

# Expected response:
# {
#   "success": true,
#   "studentId": "demo_student_1",
#   "count": 5,
#   "recommendations": [...],
#   "mode": "mock"
# }
```

---

## 📊 Production Configuration

### 1. Global Configuration

**Get current config:**
```bash
curl -X GET http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_your_admin_key_here"
```

**Update config:**
```bash
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "system": {
        "model_type": "hybrid",
        "batch_size": 64
      },
      "api": {
        "default_limit": 15,
        "max_limit": 100
      }
    },
    "reason": "Increased performance for high-traffic"
  }'
```

### 2. Scoring Weights

All weights are stored in MongoDB and can be updated at runtime without restarting.

**Get weights:**
```bash
curl -X GET http://localhost:5000/api/admin/weights \
  -H "X-API-Key: sk_live_your_admin_key_here"
```

**Update weights:**
```bash
curl -X PUT http://localhost:5000/api/admin/weights \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "weights": {
      "department": 0.40,
      "skills": 0.30,
      "experience": 0.15,
      "achievements": 0.10,
      "activity": 0.05
    },
    "department": "Computer Science and Engineering",
    "reason": "Department-specific optimization for CSE"
  }'
```

### 3. Skills Management

**List all skills:**
```bash
curl -X GET http://localhost:5000/api/admin/skills \
  -H "X-API-Key: sk_live_your_admin_key_here"
```

**Add new skill:**
```bash
curl -X POST http://localhost:5000/api/admin/skills \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "skill_name": "Rust",
    "category": "Programming Language",
    "weight": 0.85
  }'
```

### 4. Department Management

**View department relationships:**
```bash
# Via MongoDB
db.department_mappings.find({})
```

**Add department relationship:**
```bash
# Direct MongoDB operation
db.department_mappings.updateOne(
  {department: "CSE"},
  {$addToSet: {related_departments: "AI/DS"}}
)
```

### 5. Companies & Positions

**Add company:**
```bash
# Via mock service in MongoDB
db.companies.insertOne({
  name: "Apple",
  enabled: true,
  created_at: new Date()
})
```

**Add position:**
```bash
db.positions.insertOne({
  title: "VP Engineering",
  enabled: true,
  created_at: new Date()
})
```

---

## 🤖 Model Management

### Production Model Training

When you have real student/alumni data in MongoDB:

```bash
# Train hybrid model
python train_production.py \
  --model-type hybrid \
  --test-split 0.2 \
  --epochs 100
```

### Register & Activate Model

```bash
# 1. Register new model version
curl -X POST http://localhost:5000/api/admin/models \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "version": 2,
    "model_type": "hybrid",
    "file_path": "./models/alumni_model_v2.pkl",
    "metrics": {
      "students_trained": 500,
      "alumni_trained": 800,
      "accuracy": 0.82
    }
  }'

# 2. View all models
curl -X GET http://localhost:5000/api/admin/models \
  -H "X-API-Key: sk_live_your_admin_key_here"

# 3. Activate specific version
curl -X POST http://localhost:5000/api/admin/models/activate \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "version": 2,
    "reason": "Improved accuracy from v1"
  }'
```

### Switch Between Mock & Production

```bash
# Check current mode
curl -X GET http://localhost:5000/api/admin/mode \
  -H "X-API-Key: sk_live_your_admin_key_here"

# Switch to mock (for testing)
curl -X POST http://localhost:5000/api/admin/mode \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "mock",
    "reason": "Testing new features"
  }'

# Switch to production
curl -X POST http://localhost:5000/api/admin/mode \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "production",
    "reason": "Deploying new trained model"
  }'
```

---

## 🔐 Security & API Keys

### Default API Key

**Development:** `sk_test_key_production`
**Change in production!**

### Create New API Key

```bash
# Via MongoDB
db.api_keys.insertOne({
  key_name: "Production Backend",
  api_key: "sk_live_xxxxxxxxxxxx",
  scope: ["recommendations:read", "analytics:read", "admin:write"],
  rate_limit: {
    requests_per_minute: 5000,
    requests_per_hour: 100000
  },
  enabled: true,
  created_at: new Date(),
  owner: "Backend Team"
})
```

### Rate Limiting

```bash
# Check rate limit
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1713177600

# Headers returned with each request
```

---

## 📋 Monitoring & Audit

### View Metrics

```bash
# Get system metrics
curl -X GET http://localhost:5000/api/admin/metrics \
  -H "X-API-Key: sk_live_your_admin_key_here"

# Response:
# {
#   "metrics": {
#     "recommendation_requests": 1250,
#     "cache_hit_rate": 0.64,
#     "avg_response_time_ms": 47,
#     "model_inference_time_ms": 8
#   }
# }
```

### Audit Logs

```bash
# Get all audit logs
curl -X GET http://localhost:5000/api/admin/audit \
  -H "X-API-Key: sk_live_your_admin_key_here"

# Filter by action
curl -X GET "http://localhost:5000/api/admin/audit?action=UPDATE_WEIGHTS" \
  -H "X-API-Key: sk_live_your_admin_key_here"

# Response:
# {
#   "logs": [
#     {
#       "timestamp": "2024-04-15T10:30:00",
#       "action": "UPDATE_WEIGHTS",
#       "user_id": "admin_123",
#       "changes": {...},
#       "reason": "Improved performance"
#     }
#   ]
# }
```

---

## 🐳 Docker Deployment

### Build Container

```dockerfile
# Dockerfile is already provided
# Build image
docker build -t alumniconnect-ml:2.0 .
```

### Run with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}

  ml_api:
    build: ./ml_recommendation
    ports:
      - "5000:5000"
    depends_on:
      - mongo
    environment:
      MONGODB_URI: ${MONGODB_URI}
      DATABASE_NAME: aluminiconnect
      API_MODE: auto
      LOG_LEVEL: INFO
    volumes:
      - ./ml_recommendation/models:/app/models

  backend:
    build: ./Backend
    ports:
      - "3000:3000"
    depends_on:
      - ml_api
    environment:
      ML_API_URL: http://ml_api:5000
      MONGO_URI: ${MONGODB_URI}

volumes:
  mongo_data:
```

**Deploy:**
```bash
docker-compose up -d

# Initialize database
docker-compose exec ml_api python init_database.py

# Check logs
docker-compose logs -f ml_api
```

---

## 📈 Performance Tuning

### Caching

```python
# In config:
{
  "system": {
    "cache_enabled": True,
    "cache_ttl": 3600  # 1 hour
  }
}

# More frequent updates → Lower TTL
# Read-heavy → Higher TTL
```

### Batch Processing

```python
{
  "system": {
    "batch_size": 64  # Increased from 32
  }
}
```

### Worker Threads

```python
{
  "performance": {
    "worker_threads": 8  # For high-load
  }
}
```

---

## ✅ Production Checklist

Before deploying to production:

- [ ] MongoDB setup with backups
- [ ] All API keys rotated (not using test keys)
- [ ] SSL/TLS certificates configured
- [ ] Rate limiting configured
- [ ] Monitoring and alerting setup
- [ ] Audit logging enabled
- [ ] Database indices created
- [ ] Model trained on real data
- [ ] Load testing completed
- [ ] Disaster recovery plan documented
- [ ] Admin authentication configured
- [ ] CORS configured properly
- [ ] Error tracking (Sentry/similar) setup
- [ ] APM (Application Performance Monitoring) configured
- [ ] Documentation updated
- [ ] Team trained on operations

---

## 🚨 Troubleshooting

### API not starting

```bash
# Check MongoDB connection
python -c "from pymongo import MongoClient; MongoClient('mongodb://localhost:27017').server_info()"

# Check logs
tail -f logs/recommendation_api.log

# Verify database initialization
python -c "from config_manager import ConfigurationManager; cm = ConfigurationManager('mongodb://localhost:27017', 'aluminiconnect'); print(cm.get_global_config())"
```

### Recommendations not changing

```bash
# Switch from production to mock to test
curl -X POST http://localhost:5000/api/admin/mode \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -d '{"mode": "mock"}'

# Check if model is loaded
curl http://localhost:5000/status
```

### Slow responses

```bash
# Check metrics
curl http://localhost:5000/api/admin/metrics

# Increase batch size
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -d '{"config": {"system": {"batch_size": 128}}}'

# Enable caching
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_your_admin_key_here" \
  -d '{"config": {"system": {"cache_enabled": true}}}'
```

---

## 📞 Support

For issues or questions:
1. Check audit logs: `/api/admin/audit`
2. Review metrics: `/api/admin/metrics`
3. Check system status: `/status`
4. Review application logs: `logs/`

---

**Version:** 2.0.0 (Production)  
**Last Updated:** April 15, 2024  
**Status:** Production Ready ✓
