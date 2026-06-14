# Admin Operations Guide - v2.0 Production System

## Overview

This guide provides day-to-day operational procedures for managing the production recommendation system.

---

## 🚀 Daily Operations

### 1. System Health Check

**Morning health check:**
```bash
# Check API status
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "operational",
#   "mode": "production",
#   "version": "2.0.0-production"
# }

# Detailed status
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/status

# Expected response shows:
# - API mode (mock/production)
# - Active model version
# - Cache status
# - Database connectivity
```

### 2. Monitor Metrics

**Check performance metrics:**
```bash
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/api/admin/metrics

# Look for:
# - recommendation_requests: Should be growing
# - avg_response_time_ms: Should be < 100ms
# - cache_hit_rate: Should be > 0.6
# - error_rate: Should be < 0.01 (1%)
```

**Performance targets:**
| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Response Time | <50ms | >100ms | >500ms |
| Cache Hit Rate | >70% | <50% | <30% |
| Error Rate | <0.5% | >1% | >5% |
| CPU Usage | <40% | >70% | >90% |

### 3. View Recent Activity

```bash
# Get recent audit logs
curl -H "X-API-Key: sk_live_admin_key" \
  "http://localhost:5000/api/admin/audit?limit=20"

# Filter by action
curl -H "X-API-Key: sk_live_admin_key" \
  "http://localhost:5000/api/admin/audit?action=UPDATE_WEIGHTS"

# Look for unauthorized changes
curl -H "X-API-Key: sk_live_admin_key" \
  "http://localhost:5000/api/admin/audit?action=SWITCH_MODE"
```

---

## ⚙️ Configuration Management

### Update System Configuration

```bash
# 1. Get current config
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/api/admin/config

# 2. Modify as needed
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_admin_key" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "system": {
        "default_limit": 15,
        "cache_ttl": 1800
      }
    },
    "reason": "Increasing default recommendations and reducing cache TTL"
  }'
```

### Common Configuration Changes

**Increase recommendation limit:**
```bash
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "config": {
      "api": {
        "default_limit": 20,
        "max_limit": 100
      }
    },
    "reason": "User request for more recommendations"
  }'
```

**Enable debug logging:**
```bash
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "config": {
      "system": {
        "log_level": "DEBUG",
        "debug_mode": true
      }
    },
    "reason": "Investigating performance issue"
  }'
```

**Disable caching temporarily:**
```bash
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "config": {
      "system": {
        "cache_enabled": false
      }
    },
    "reason": "Testing fresh recommendations"
  }'
```

---

## 📊 Scoring & Optimization

### Update Scoring Weights

**Global weights:**
```bash
curl -X PUT http://localhost:5000/api/admin/weights \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "weights": {
      "department": 0.40,
      "skills": 0.30,
      "experience": 0.15,
      "achievements": 0.10,
      "activity": 0.05
    },
    "reason": "Emphasize skills matching over department"
  }'
```

**Department-specific weights:**
```bash
curl -X PUT http://localhost:5000/api/admin/weights \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "scope": "Computer Science and Engineering",
    "weights": {
      "department": 0.25,
      "skills": 0.50,
      "experience": 0.15,
      "achievements": 0.10,
      "activity": 0.00
    },
    "reason": "CSE values skills higher than department"
  }'
```

### Review Recommendation Quality

**Check recent recommendations:**
```bash
# Via database
db.recommendation_cache.find().limit(10)

# Check score distribution
db.recommendation_cache.aggregate([
  {
    $group: {
      _id: null,
      avg_score: {$avg: "$recommendations.recommendationScore"},
      max_score: {$max: "$recommendations.recommendationScore"},
      min_score: {$min: "$recommendations.recommendationScore"}
    }
  }
])
```

---

## 🛠️ Skill & Department Management

### Add New Skills

```bash
# Single skill
curl -X POST http://localhost:5000/api/admin/skills \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "skill_name": "Kubernetes",
    "category": "DevOps",
    "weight": 0.95
  }'

# Bulk add
for skill in "Terraform" "Ansible" "GitLab"; do
  curl -X POST http://localhost:5000/api/admin/skills \
    -H "X-API-Key: sk_live_admin_key" \
    -d "{\"skill_name\": \"$skill\", \"category\": \"DevOps\"}"
done
```

### Update Department Relationships

```bash
# Add relationship between departments
# Via MongoDB (direct method)
db.department_mappings.updateOne(
  {department: "Electronics and Telecommunication"},
  {
    $addToSet: {related_departments: "Artificial Intelligence and Data Science"},
    $set: {similarity_score: 0.65}
  }
)

# Create bidirectional relationship
db.department_mappings.updateOne(
  {department: "Artificial Intelligence and Data Science"},
  {$addToSet: {related_departments: "Electronics and Telecommunication"}}
)
```

---

## 🤖 Model Management

### Train New Model

```bash
# Train when you have collected enough data
python train.py --model-type hybrid

# Output:
# Training started...
# ✓ Loaded 500 students
# ✓ Loaded 800 alumni
# ✓ Training hybrid model
# ✓ Model saved as v2.pkl
# ✓ Accuracy: 0.82
```

### Register Model Version

```bash
# Automatically done by training script
# But can manually register if needed

curl -X POST http://localhost:5000/api/admin/models/register \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "version": 3,
    "model_type": "hybrid",
    "file_path": "./models/alumni_model_v3.pkl",
    "metrics": {
      "students_trained": 600,
      "alumni_trained": 1000,
      "accuracy": 0.85,
      "training_time_seconds": 120
    }
  }'
```

### View All Models

```bash
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/api/admin/models

# Response shows:
# [
#   {
#     "version": 3,
#     "status": "inactive",
#     "accuracy": 0.85,
#     "trained_at": "2024-04-15T10:30:00"
#   },
#   {
#     "version": 2,
#     "status": "active",
#     "accuracy": 0.82,
#     "trained_at": "2024-04-14T09:15:00"
#   }
# ]
```

### Activate Model

**Before activating:**
```bash
# Test recommendations with model in inactive state
curl -X POST http://localhost:5000/api/admin/mode \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{"mode": "production", "version": 3}'

# Get recommendations and review quality
```

**Activate after testing:**
```bash
curl -X POST http://localhost:5000/api/admin/models/activate \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "version": 3,
    "reason": "Improved accuracy from 0.82 to 0.85"
  }'
```

### Rollback Model

```bash
# Switch back to previous model
curl -X POST http://localhost:5000/api/admin/models/activate \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "version": 2,
    "reason": "v3 causing unexpected recommendations"
  }'
```

---

## 🔄 System Modes

### Check Current Mode

```bash
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/api/admin/mode

# Response:
# {
#   "mode": "production",
#   "available_modes": ["mock", "production"]
# }
```

### Switch Modes

**Production → Mock (for testing):**
```bash
curl -X POST http://localhost:5000/api/admin/mode \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "mode": "mock",
    "reason": "Testing new weight configuration"
  }'

# Recommendations now use synthetic test data
# No changes to real model
```

**Mock → Production (after validation):**
```bash
curl -X POST http://localhost:5000/api/admin/mode \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "mode": "production",
    "reason": "Validated new weights, deploying to production"
  }'
```

---

## 🔐 Security Management

### Create New API Key

```javascript
// In MongoDB
db.api_keys.insertOne({
  key_name: "Mobile App",
  api_key: "sk_live_mobile_app_key_12345",
  scope: ["recommendations:read"],
  rate_limit: {
    requests_per_minute: 100,
    requests_per_hour: 10000
  },
  enabled: true,
  created_at: new Date(),
  owner: "Mobile Team"
})
```

### Rotate API Key

```javascript
// Disable old key
db.api_keys.updateOne(
  {api_key: "sk_live_old_key"},
  {$set: {enabled: false, disabled_at: new Date()}}
)

// Enable new key
db.api_keys.updateOne(
  {api_key: "sk_live_new_key"},
  {$set: {enabled: true}}
)

// Announce change to team
```

### Check Rate Limits

```bash
# View API key details
db.api_keys.findOne({key_name: "Backend API"})

# Adjust if needed
db.api_keys.updateOne(
  {key_name: "Backend API"},
  {$set: {
    "rate_limit.requests_per_minute": 2000,
    "rate_limit.requests_per_hour": 100000
  }}
)
```

---

## 📈 Performance Tuning

### Identify Slow Operations

```bash
# Get response time distribution
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/api/admin/metrics | jq '.metrics.recommendation_requests'

# Look for high p95/p99 times
```

### Increase Performance

**Method 1: Enable aggressive caching**
```bash
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "config": {
      "system": {
        "cache_enabled": true,
        "cache_ttl": 7200
      }
    },
    "reason": "Increase to 2 hours for better hit rate"
  }'
```

**Method 2: Increase batch size (for bulk operations)**
```bash
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "config": {
      "system": {
        "batch_size": 128
      }
    },
    "reason": "Process larger batches at once"
  }'
```

**Method 3: Increase worker threads**
```bash
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "config": {
      "performance": {
        "worker_threads": 8
      }
    },
    "reason": "Utilize all CPU cores"
  }'
```

---

## 🚨 Troubleshooting

### API Not Responding

```bash
# 1. Check if running
lsof -i :5000

# 2. Check logs
tail -f logs/recommendation_api.log

# 3. Restart
pkill -f "python app_production.py"
python app_production.py
```

### Model Loading Fails

```bash
# 1. Check model file exists
ls -la models/

# 2. Check MongoDB contains model metadata
db.model_versions.findOne({status: "active"})

# 3. Fall back to mock mode
curl -X POST http://localhost:5000/api/admin/mode \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{"mode": "mock"}'
```

### High Error Rate

```bash
# 1. Check recent errors
curl -H "X-API-Key: sk_live_admin_key" \
  "http://localhost:5000/api/admin/audit?action=ERROR" | tail -20

# 2. Check metrics
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/api/admin/metrics | jq '.metrics.errors'

# 3. Enable debug logging
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{"config": {"system": {"log_level": "DEBUG"}}}'

# 4. Check logs for specific errors
```

---

## 📊 Regular Maintenance

### Daily (Automated)

- [ ] Health check monitoring
- [ ] Error rate monitoring
- [ ] Cache hit rate tracking

### Weekly

- [ ] Review audit logs
- [ ] Check model performance
- [ ] Verify recommendations quality
- [ ] Review metrics trends

### Monthly

- [ ] Full system audit
- [ ] Backup verification
- [ ] Performance analysis
- [ ] Plan model retraining

### Quarterly

- [ ] Review and update weights
- [ ] Add new skills based on demand
- [ ] Update department mappings
- [ ] Plan infrastructure scaling

---

## 📞 Quick Reference

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Get Configuration:**
```bash
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/api/admin/config
```

**Get Metrics:**
```bash
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/api/admin/metrics
```

**View Audit Logs:**
```bash
curl -H "X-API-Key: sk_live_admin_key" \
  "http://localhost:5000/api/admin/audit?limit=50"
```

**Check Mode:**
```bash
curl -H "X-API-Key: sk_live_admin_key" \
  http://localhost:5000/api/admin/mode
```

---

**Last Updated:** April 15, 2024  
**Version:** 2.0.0  
**Status:** Production Ready ✓
