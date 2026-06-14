# Configuration file for ML Recommendation System

import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'aluminiconnect')

# Model Configuration
MODEL_TYPE = os.getenv('MODEL_TYPE', 'hybrid')  # 'content' or 'hybrid'
MODEL_DIR = os.getenv('MODEL_DIR', './models')
DATA_DIR = os.getenv('DATA_DIR', './data')

# Training Configuration
CONTENT_WEIGHT = 0.7  # Weight for content-based recommendations
COLLABORATIVE_WEIGHT = 0.3  # Weight for collaborative filtering

# Model Parameters
N_RECOMMENDATION_FACTORS = 10  # For collaborative filtering
DEFAULT_RECOMMENDATIONS_LIMIT = 10
MIN_SIMILARITY_SCORE = 0.0
MAX_RECOMMENDATIONS = 50

# Recommendation Scoring Weights
DEPARTMENT_WEIGHT = 0.35  # 35% of score
SKILLS_WEIGHT = 0.25      # 25% of score
EXPERIENCE_WEIGHT = 0.20   # 20% of score
ACHIEVEMENTS_WEIGHT = 0.10 # 10% of score
ACTIVITY_WEIGHT = 0.10     # 10% of score

# Department Similarity Groups
RELATED_DEPARTMENTS = {
    'computer science and engineering': [
        'information technology',
        'artificial intelligence and data science'
    ],
    'information technology': [
        'computer science and engineering',
        'artificial intelligence and data science'
    ],
    'artificial intelligence and data science': [
        'computer science and engineering',
        'information technology'
    ],
    'electronics and telecommunication': [
        'electrical engineering',
        'instrumentation engineering'
    ],
    'electrical engineering': [
        'electronics and telecommunication',
        'instrumentation engineering'
    ],
    'instrumentation engineering': [
        'electronics and telecommunication',
        'electrical engineering'
    ],
    'mechanical engineering': ['civil engineering', 'chemical engineering'],
    'civil engineering': ['mechanical engineering', 'chemical engineering'],
    'chemical engineering': ['mechanical engineering', 'civil engineering']
}

# Experience Level Thresholds (years after graduation)
EXPERIENCE_PREFERENCE = {
    'ideal_min': 2,      # Minimum years for ideal recommendations
    'ideal_max': 8,      # Maximum years for ideal recommendations
    'good_min': 1,       # Minimum years for good recommendations
    'good_max': 10       # Maximum years for good recommendations
}

# API Configuration
API_HOST = os.getenv('API_HOST', '0.0.0.0')
API_PORT = int(os.getenv('API_PORT', 5000))
API_DEBUG = os.getenv('API_DEBUG', 'False').lower() == 'true'

# Batch Configuration
BATCH_SIZE = 32  # For processing multiple recommendations
CACHE_ENABLED = True
CACHE_TTL = 3600  # Cache time-to-live in seconds (1 hour)

# Logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_DIR = os.getenv('LOG_DIR', './logs')

# Feature Engineering
MAX_SKILLS_PER_PROFILE = 20
MAX_ACHIEVEMENTS_PER_PROFILE = 15
SKILL_SIMILARITY_THRESHOLD = 0.5

# Data Quality
MIN_PROFILE_COMPLETENESS = 0.5  # 50% of profile must be complete
REQUIRE_VERIFIED = False  # Require verified profiles
REQUIRE_ACTIVE = True  # Require active profiles
