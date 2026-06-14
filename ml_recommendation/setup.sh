#!/bin/bash
# Quick start script for Alumni Recommendation System (Linux/Mac)

echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                 Alumni Recommendation System - Quick Start                      ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓ Python ${PYTHON_VERSION} found${NC}"
echo ""

# Create virtual environment
echo -e "${BLUE}Step 1: Creating virtual environment...${NC}"
if [ -d "venv" ]; then
    echo "  Virtual environment already exists"
else
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi
echo ""

# Activate virtual environment
echo -e "${BLUE}Step 2: Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Step 3: Installing dependencies...${NC}"
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Create necessary directories
echo -e "${BLUE}Step 4: Creating necessary directories...${NC}"
mkdir -p data
mkdir -p models
mkdir -p logs
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Check .env file
echo -e "${BLUE}Step 5: Checking environment configuration...${NC}"
if [ -f ".env" ]; then
    echo "  .env file found"
else
    echo -e "${YELLOW}⚠ .env file not found. Creating default .env...${NC}"
    cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=aluminiconnect
MODEL_TYPE=hybrid
MODEL_DIR=./models
DATA_DIR=./data
API_PORT=5000
EOF
    echo -e "${GREEN}✓ Default .env created. Please update with your settings.${NC}"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                           Setup Complete! ✓                                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Update .env with your MongoDB connection string:"
echo "   nano .env"
echo ""
echo "2. Extract data from MongoDB and train the model:"
echo "   python train.py --model-type hybrid"
echo ""
echo "   Or train from local CSV files (if available):"
echo "   python train.py --model-type hybrid --use-local-files"
echo ""
echo "3. Start the API server:"
echo "   python app.py"
echo ""
echo "4. Run tests to validate the model:"
echo "   python test.py"
echo ""
echo -e "${YELLOW}Note:${NC} The virtual environment is already activated."
echo "To deactivate later, run: deactivate"
echo ""
