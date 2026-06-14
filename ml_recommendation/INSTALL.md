# Installation and Setup Guide

## Complete Installation Steps for Alumni Recommendation System

### Table of Contents
1. [System Requirements](#system-requirements)
2. [Pre-Installation Setup](#pre-installation-setup)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Training the Model](#training-the-model)
6. [Running the API](#running-the-api)
7. [Verification and Testing](#verification-and-testing)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Hardware
- **RAM**: Minimum 4GB (8GB+ recommended)
- **Disk Space**: 2GB+ for model and data
- **CPU**: Any modern processor (faster = faster training)

### Software
- **Python**: 3.8 or higher
- **MongoDB**: 4.0 or higher (local or cloud)
- **Operating System**: Windows, macOS, or Linux

### Check Your System

```bash
# Check Python version
python --version
# Should output: Python 3.8.x or higher

# Check pip
pip --version

# Check if MongoDB is installed or running
# MongoDB should be accessible at mongodb://127.0.0.1:27017
```

---

## Pre-Installation Setup

### 1. MongoDB Setup

#### Option A: Local MongoDB Installation

**Windows:**
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer
3. During installation, ensure "Install MongoDB as a Service" is checked
4. MongoDB will start automatically after installation

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/database`)
4. Use this in your `.env` file

### 2. Directory Structure

Create the project directory if it doesn't exist:

```bash
mkdir -p c:\Users\YourName\Projects\AlumniConnect\ml_recommendation
cd c:\Users\YourName\Projects\AlumniConnect\ml_recommendation
```

---

## Installation Steps

### Step 1: Clone or Download Files

If you have the files in a ZIP, extract them to your project directory.

### Step 2: Automatic Setup (Recommended)

#### For Windows:
Double-click `setup.bat` or run in Command Prompt:
```cmd
setup.bat
```

#### For macOS/Linux:
Run in Terminal:
```bash
chmod +x setup.sh
./setup.sh
```

### Step 3: Manual Setup (If Automatic Fails)

#### 3a. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 3b. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs:
- pandas, numpy, scikit-learn (ML libraries)
- Flask, flask-cors (Web framework)
- pymongo (Database driver)
- python-dotenv (Configuration)

#### 3c. Create Directories
```bash
mkdir data
mkdir models
mkdir logs
```

---

## Configuration

### Step 1: Create .env File

Create a file named `.env` in the `ml_recommendation` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=aluminiconnect

# Model Configuration
MODEL_TYPE=hybrid
MODEL_DIR=./models
DATA_DIR=./data

# API Configuration
API_HOST=0.0.0.0
API_PORT=5000
API_DEBUG=False

# Logging
LOG_LEVEL=INFO
LOG_DIR=./logs
```

### Step 2: Update for Your Environment

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aluminiconnect
```

**For Production:**
```env
API_PORT=5000
API_DEBUG=False
LOG_LEVEL=INFO
```

### Step 3: Verify Configuration

Test your MongoDB connection:

```bash
python -c "from data_processor import DataProcessor; dp = DataProcessor(); dp.connect(); print('✓ Connected to MongoDB')"
```

---

## Training the Model

### Option 1: Train Using MongoDB Data (First Time)

```bash
# Fetch data from MongoDB and train
python train.py --model-type hybrid --model-name alumni_recommendation_model
```

This will:
1. Connect to MongoDB
2. Extract student and alumni data
3. Export to CSV files
4. Train the recommendation model
5. Save the trained model

**Progress Output:**
```
================================================================================
PREPARING DATA
================================================================================

Fetching data from MongoDB...
✓ Loaded 150 students
✓ Loaded 200 alumni
✓ Loaded 45 interaction records

================================================================================
TRAINING HYBRID MODEL
================================================================================

Training hybrid model...
✓ Model trained successfully

================================================================================
SAVING MODEL
================================================================================

✓ Model saved to ./models/alumni_recommendation_model.pkl
✓ Statistics saved to ./models/alumni_recommendation_model_stats.json
```

### Option 2: Train Using Local CSV Files (Faster)

If you already have CSV files:

```bash
python train.py --model-type hybrid --use-local-files
```

### Training Options

```bash
python train.py --help

Options:
  --model-type {content, hybrid}     Model type (default: hybrid)
  --model-name TEXT                  Model filename (default: alumni_recommendation_model)
  --model-dir PATH                   Model directory (default: ./models)
  --use-local-files                  Use CSV files instead of MongoDB
  --no-evaluate                      Skip evaluation
```

### Custom Training

```bash
# Train content-based model
python train.py --model-type content --model-name content_model

# Train hybrid model without evaluation
python train.py --model-type hybrid --no-evaluate

# Save to custom directory
python train.py --model-dir /path/to/models --model-name custom_model
```

---

## Running the API

### Start the API Server

```bash
# Activate virtual environment first
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Run the API
python app.py
```

**Expected Output:**
```
✓ Model and profiles loaded successfully
* Running on http://0.0.0.0:5000
* Press CTRL+C to quit
```

### Test the API

In a new terminal:

```bash
# Health check
curl http://localhost:5000/health

# Get recommendations (replace student_id with actual ID)
curl -X POST http://localhost:5000/api/recommendations/alumni \
  -H "Content-Type: application/json" \
  -d '{"student_id":"YOUR_STUDENT_ID","limit":10}'

# Get model statistics
curl http://localhost:5000/api/model/stats
```

### API is Ready When:
- Server responds to `/health` endpoint
- Model successfully loaded
- Profiles loaded
- Port 5000 is accessible

---

## Verification and Testing

### Run Test Suite

```bash
python test.py
```

Tests include:
- ✓ Basic recommendations
- ✓ Filtering functionality
- ✓ Similarity score analysis
- ✓ Department matching
- ✓ Skill-based matching
- ✓ Edge cases

**Expected Output:**
```
╔════════════════════════════════════════════════════════════════════════════════╗
║                      RECOMMENDATION MODEL TEST SUITE                           ║
╚════════════════════════════════════════════════════════════════════════════════╝

TEST 1: Basic Recommendations
================================================================================
✓ Generated recommendations for 5 students
```

### Manual Testing

```bash
# Python interactive mode
python

# Load and test model
from models import AlumniRecommendationModel
from data_processor import DataProcessor
import pandas as pd

# Load data
students_df = pd.read_csv('./data/students.csv')
alumni_df = pd.read_csv('./data/alumni.csv')

# Load model
model = AlumniRecommendationModel()
model.load_model('./models/alumni_recommendation_model.pkl')

# Get recommendations
recommendations = model.get_recommendations(student_idx=0, n_recommendations=5)
print(f"Found {len(recommendations)} recommendations")

# Exit
exit()
```

---

## Troubleshooting

### Issue 1: "MongoDB connection failed"

**Error:**
```
Error connecting to MongoDB: [Errno 111] Connection refused
```

**Solutions:**
1. Check MongoDB is running:
   - Windows: Check Services (mongodb)
   - macOS: `brew services list`
   - Linux: `sudo systemctl status mongodb`

2. Start MongoDB:
   - Windows: Services → Start MongoDB
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongodb`

3. Check connection string in `.env`

4. If using MongoDB Atlas, ensure:
   - IP address is whitelisted
   - Connection string is correct
   - Network access is allowed

### Issue 2: "Model not found"

**Error:**
```
Failed to load model: [Errno 2] No such file or directory: './models/alumni_recommendation_model.pkl'
```

**Solution:**
Train the model first:
```bash
python train.py --model-type hybrid
```

### Issue 3: "CSV files not found"

**Error:**
```
FileNotFoundError: ./data/students.csv
```

**Solutions:**
1. Train from MongoDB (don't use `--use-local-files`):
   ```bash
   python train.py --model-type hybrid
   ```

2. Or copy CSV files to `data/` directory:
   - `data/students.csv`
   - `data/alumni.csv`
   - `data/interactions.csv` (optional)

### Issue 4: "Port 5000 already in use"

**Error:**
```
Address already in use
```

**Solutions:**
1. Use a different port in `.env`:
   ```env
   API_PORT=5001
   ```

2. Or kill the process using port 5000:
   - Windows: `netstat -ano | findstr :5000`
   - macOS/Linux: `lsof -i :5000`

### Issue 5: "Python module not found"

**Error:**
```
ModuleNotFoundError: No module named 'pandas'
```

**Solutions:**
1. Ensure virtual environment is activated
2. Reinstall dependencies:
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

3. Upgrade pip:
   ```bash
   pip install --upgrade pip
   ```

### Issue 6: "Insufficient memory"

**Error:**
```
MemoryError: Unable to allocate large dataset
```

**Solutions:**
1. Close other applications
2. Use `--use-local-files` flag (faster)
3. Process data in batches (modify training script)

### Issue 7: "Virtual environment not activating"

**Solutions:**

**Windows:**
```cmd
cd path\to\project
python -m venv venv
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
cd path/to/project
python3 -m venv venv
source venv/bin/activate
```

---

## Next Steps After Installation

### 1. Integrate with Node.js Backend

Add route to your Express backend:

```javascript
// routes/recommendations.js
const express = require('express');
const router = express.Router();

router.get('/alumni', async (req, res) => {
  const { studentId, limit = 10 } = req.query;
  
  const response = await fetch('http://localhost:5000/api/recommendations/alumni', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: studentId,
      limit: parseInt(limit)
    })
  });
  
  const data = await response.json();
  res.json(data);
});

module.exports = router;
```

### 2. Deploy to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guide.

### 3. Monitor and Maintain

- Monitor API logs: `tail -f logs/*.log`
- Retrain periodically: `python train.py --use-local-files`
- Check model performance: `python test.py`

---

## Support and Resources

- **Documentation**: See [README.md](README.md)
- **Testing**: Run `python test.py`
- **API Endpoints**: Visit `http://localhost:5000/health`
- **Issues**: Check logs in `./logs/` directory

---

**Installation Complete!** 🎉

You can now:
- Train models
- Run the API server
- Get recommendations for students
- Test and validate the system

For next steps, see [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md).
