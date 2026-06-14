# Migration Guide: v1 → v2.0 (Production Ready)

## Overview

This guide covers upgrading from AlumniConnect ML v1 (with static configuration) to v2.0 (fully dynamic, production-ready system).

**Key Improvements:**
- ✅ All configuration moved to MongoDB (no more static files)
- ✅ Dynamic model versioning and management
- ✅ Admin API endpoints for runtime configuration
- ✅ Comprehensive audit logging and monitoring
- ✅ Full production-grade error handling
- ✅ Security with API key management
- ✅ No code changes needed for configuration updates

---

## What's Changed

### Before (v1 - Static)

```
config.py (hardcoded)
  ↓
app.py reads static file
  ↓
Restart API to apply changes
```

### After (v2.0 - Dynamic)

```
MongoDB Configuration Database
  ↓
ConfigurationManager reads on startup
  ↓
Caches with TTL (5 min default)
  ↓
Admin API updates configuration
  ↓
Changes apply instantly
```

---

## Step-by-Step Migration

### Phase 1: Backup & Assessment (15 min)

1. **Backup existing system:**
   ```bash
   # Backup MongoDB
   mongodump --db aluminiconnect --out ./backup_v1

   # Backup code
   cp -r ml_recommendation ml_recommendation_v1_backup
   ```

2. **Note down current configuration:**
   ```bash
   # If using old system, write down these values:
   # - Current weights
   # - Related departments
   # - Skills pool
   # - Experience thresholds
   # - API settings
   ```

### Phase 2: Set Up New System (20 min)

1. **Copy new files:**
   ```bash
   # Files to add:
   # - db_schemas.py
   # - config_manager.py
   # - models_production.py
   # - mock_service_production.py
   # - app_production.py
   # - init_database.py
   ```

2. **Update requirements.txt:**
   ```bash
   pip install -r requirements.txt
   # Ensures all dependencies are installed
   ```

3. **Initialize database:**
   ```bash
   python init_database.py
   
   # Output:
   # ✓ DATABASE INITIALIZATION COMPLETE
   # ✓ Collections created: 12
   # ✓ Skills seeded: 28
   ```

### Phase 3: Migrate Your Configuration (10 min)

1. **Via Python script:**
   ```python
   from config_manager import ConfigurationManager

   config_mgr = ConfigurationManager(
       'mongodb://localhost:27017',
       'aluminiconnect'
   )
   config_mgr.connect()

   # Update weights if different from defaults
   config_mgr.set_scoring_weights({
       'department': 0.35,      # Your values
       'skills': 0.25,
       'experience': 0.20,
       'achievements': 0.10,
       'activity': 0.10,
   }, user_id='admin')

   # Add custom departments if needed
   config_mgr.add_department_relationship(
       'CSE', 'IT', similarity=0.8
   )

   # Add custom skills
   for skill in ['Rust', 'Go', 'Swift']:
       config_mgr.add_skill(skill, 'Programming Language')

   config_mgr.disconnect()
   ```

2. **Or via MongoDB directly:**
   ```javascript
   // Update weights
   db.scoring_weights.updateOne(
     {_id: 'weights_global'},
     {$set: {weights: {department: 0.35, ...}}}
   )

   // Add company
   db.companies.insertOne({name: 'Netflix', enabled: true})

   // Add position
   db.positions.insertOne({title: 'Principal Engineer'})
   ```

### Phase 4: Test New System (10 min)

1. **Start services:**
   ```bash
   # Terminal 1: MongoDB
   mongod

   # Terminal 2: v2.0 API
   python app_production.py

   # Output should show:
   # ✓ Connected to MongoDB
   # ✓ Mock service initialized
   # ✓ API initialized in MOCK mode
   ```

2. **Test endpoints:**
   ```bash
   # Health check
   curl http://localhost:5000/health

   # Get recommendations
   curl -X POST http://localhost:5000/api/recommendations/alumni \
     -H "X-API-Key: sk_test_key_production" \
     -H "Content-Type: application/json" \
     -d '{
       "student_id": "test_1",
       "department": "Computer Science and Engineering"
     }'

   # Check configuration
   curl -X GET http://localhost:5000/api/admin/config \
     -H "X-API-Key: sk_test_key_production"
   ```

### Phase 5: Graduate to Production (30 min)

1. **Train model with real data:**
   ```bash
   # Ensure MongoDB has student/alumni data
   python train.py --model-type hybrid
   ```

2. **Activate production model:**
   ```bash
   curl -X POST http://localhost:5000/api/admin/models/activate \
     -H "X-API-Key: sk_test_key_production" \
     -d '{"version": 1}'
   ```

3. **Switch to production mode:**
   ```bash
   curl -X POST http://localhost:5000/api/admin/mode \
     -H "X-API-Key: sk_test_key_production" \
     -d '{"mode": "production"}'
   ```

### Phase 6: Update Backend Routes (5 min)

1. **Update app.js:**
   ```javascript
   // OLD
   // const recommendationRoutes = require('./routes/recommendationRoutes');
   
   // NEW
   const recommendationRoutes = require('./routes/recommendationRoutes_production');
   
   app.use('/api/student/recommendations', recommendationRoutes);
   ```

2. **Update environment variables:**
   ```env
   ML_API_URL=http://localhost:5000
   ML_API_KEY=sk_test_key_production
   ADMIN_API_KEY=sk_live_your_admin_key_here
   ```

### Phase 7: Validation (15 min)

1. **Verify all endpoints work:**
   ```bash
   # Public endpoints
   curl http://localhost:3000/api/student/recommendations?studentId=123
   curl http://localhost:3000/api/student/recommendations/analytics?studentId=123

   # Admin endpoints
   curl -H "X-API-Key: sk_live_your_admin_key_here" \
     http://localhost:5000/api/admin/config
   ```

2. **Check audit logs:**
   ```bash
   curl -H "X-API-Key: sk_live_your_admin_key_here" \
     http://localhost:5000/api/admin/audit
   ```

---

## File Structure Comparison

### Before (v1)
```
ml_recommendation/
  ├── config.py (static)
  ├── models.py (uses config.py)
  ├── mock_service.py (hardcoded pools)
  ├── app.py (production API)
  └── app_dev.py (development API)
```

### After (v2.0)
```
ml_recommendation/
  ├── config_manager.py (NEW - reads from MongoDB)
  ├── db_schemas.py (NEW - schema definitions)
  ├── models_production.py (NEW - updated models)
  ├── mock_service_production.py (NEW - dynamic pools)
  ├── app_production.py (NEW - full-featured API)
  ├── init_database.py (NEW - database setup)
  ├── DEPLOYMENT_PRODUCTION.md (NEW - deployment guide)
  │
  ├── config.py (OLD - deprecated, can delete)
  ├── models.py (OLD - deprecated, can delete)
  ├── mock_service.py (OLD - deprecated, can delete)
  └── app.py (OLD - deprecated, can delete)
```

---

## API Changes

### Endpoint Changes

| Endpoint | v1 | v2.0 | Notes |
|----------|----|----|-------|
| `/api/recommendations/alumni` | ✓ | ✓ | Same endpoint, better implementation |
| `/api/recommendations/analytics` | ✓ | ✓ | Same endpoint |
| `/api/admin/config` | ✗ | ✓ | NEW - Get/update global config |
| `/api/admin/weights` | ✗ | ✓ | NEW - Get/update weights |
| `/api/admin/skills` | ✗ | ✓ | NEW - Manage skills |
| `/api/admin/mode` | ~ | ✓ | Enhanced in v2.0 |
| `/api/admin/models` | ✗ | ✓ | NEW - Model versioning |
| `/api/admin/audit` | ✗ | ✓ | NEW - Audit logs |
| `/api/admin/metrics` | ✗ | ✓ | NEW - System metrics |

### Authentication

**v1:**
```bash
# No authentication
curl http://localhost:5000/recommendations
```

**v2.0:**
```bash
# Request header required
curl -H "X-API-Key: sk_test_key_production" \
  http://localhost:5000/api/recommendations/alumni
```

---

## Configuration Migration

### Old Static Config (v1)

```python
# config.py
DEPARTMENT_WEIGHT = 0.35
SKILLS_WEIGHT = 0.25
# ... hardcoded values
```

### New Dynamic Config (v2.0)

```bash
# Step 1: Initialize with defaults
python init_database.py

# Step 2: Update via API
curl -X PUT http://localhost:5000/api/admin/config \
  -H "X-API-Key: sk_live_admin_key" \
  -d '{
    "config": {
      "weights": {"department": 0.35}
    }
  }'

# Step 3: Changes apply instantly
```

---

## Rollback Plan

If you need to rollback to v1:

```bash
# 1. Stop v2.0
kill $(lsof -t -i:5000)

# 2. Restore backup
cp -r ml_recommendation_v1_backup ml_recommendation

# 3. Start v1
cd ml_recommendation
python app.py

# 4. Restore MongoDB backup (if needed)
mongorestore ./backup_v1
```

---

## Common Issues During Migration

### Issue 1: "No active model"
```
Error: Failed to load model
```
**Solution:** System starts in mock mode if no trained model exists. This is normal.
```bash
# Train a model or continue with mock mode
python train.py --model-type hybrid
```

### Issue 2: "Configuration not found"
```
Error: Database not initialized
```
**Solution:** Run database initialization script
```bash
python init_database.py
```

### Issue 3: "API key validation Failed"
```
Error: Invalid API key
```
**Solution:** Update to correct API key in environment variables
```bash
# Default development key
ML_API_KEY=sk_test_key_production

# Production key (change this!)
ADMIN_API_KEY=sk_live_your_admin_key_here
```

### Issue 4: "Old configuration not loaded"
```
# Clear cache and reload
curl -X POST http://localhost:5000/api/admin/refresh
```

---

## Performance Comparison

### v1 (Static)
- Startup time: ~2 seconds
- Config change: Restart API (downtime)
- Hot reload: ✗ Not supported

### v2.0 (Dynamic)
- Startup time: ~3 seconds (includes DB connection)
- Config change: Instant (zero downtime)
- Hot reload: ✓ Fully supported
- Cache refresh: Optional (5 min TTL default)

---

## Data Integrity

### Preserve Your Data

All your existing MongoDB data is preserved:
```javascript
// Your student data stays
db.students.find() // ✓ Still there

// Your alumni data stays
db.alumni.find()  // ✓ Still there

// Previous recommendations (if archived)
db.archived_recommendations.find()  // ✓ Still there
```

### Database Growth

v2.0 adds new collections but doesn't delete old ones:
```
Old collections (kept):
  - students
  - alumni
  - users
  - posts
  - ...

New collections (added):
  - recommendation_config
  - scoring_weights
  - department_mappings
  - skills_pool
  - model_versions
  - recommendation_cache
  - metrics
  - audit_logs
  - feature_flags
  - api_keys
  - companies
  - positions
```

---

## Success Criteria

You've successfully migrated when:

- ✅ Database initialized without errors
- ✅ `python app_production.py` starts successfully
- ✅ Health check returns 200 status
- ✅ Recommendations API returns results
- ✅ Can update configuration via API
- ✅ Audit logs show configuration changes
- ✅ System runs in mock mode initially
- ✅ Can switch to production mode after training
- ✅ No downtime during mode switches
- ✅ All endpoints return expected responses

---

## Next Steps After Migration

1. **Train production model:**
   ```bash
   python train.py --model-type hybrid
   ```

2. **Set up monitoring:**
   ```bash
   # Monitor metrics
   curl http://localhost:5000/api/admin/metrics
   ```

3. **Scale if needed:**
   - Increase API port pool
   - Add load balancer
   - Configure database replication

4. **Set up backups:**
   ```bash
   # Daily MongoDB backup
   mongodump --db aluminiconnect --out ./backups/$(date +%Y-%m-%d)
   ```

---

## Support Resources

- **Deployment Guide:** [DEPLOYMENT_PRODUCTION.md](DEPLOYMENT_PRODUCTION.md)
- **API Documentation:** [API Endpoints in app_production.py](app_production.py)
- **Configuration Reference:** [config_manager.py](config_manager.py)
- **Database Schema:** [db_schemas.py](db_schemas.py)

---

**Migration Version:** 1.0 → 2.0  
**Date:** April 15, 2024  
**Status:** Ready for Production ✓  
**Estimated Migration Time:** 1-2 hours including testing
