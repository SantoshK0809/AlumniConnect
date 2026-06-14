# Alumni Recommendation System - Package Init

__version__ = "1.0.0"
__author__ = "AlumniConnect Team"
__description__ = "Machine Learning Recommendation System for Alumni-Student Connections"

from .models import (
    AlumniRecommendationModel,
    CollaborativeFilteringModel,
    HybridRecommendationModel
)

from .data_processor import DataProcessor, FeatureEngineer

__all__ = [
    'AlumniRecommendationModel',
    'CollaborativeFilteringModel',
    'HybridRecommendationModel',
    'DataProcessor',
    'FeatureEngineer'
]
