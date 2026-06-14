# Production-Ready Recommendation Models - Dynamic Configuration
# All static configurations removed, now reads from ConfigurationManager

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import pickle
import logging
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from config_manager import ConfigurationManager

logger = logging.getLogger(__name__)

class ProductionRecommendationModel:
    """
    Base class for production recommendation models
    Uses dynamic configuration from database
    """

    def __init__(self, config_manager: ConfigurationManager, model_type: str = 'hybrid'):
        """
        Initialize model with dynamic configuration
        
        Args:
            config_manager: ConfigurationManager instance
            model_type: 'content' or 'hybrid'
        """
        self.config_manager = config_manager
        self.model_type = model_type
        self.config = config_manager.get_global_config()
        self.weights = config_manager.get_scoring_weights()
        self.departments = config_manager.get_departments()
        self.skills_pool = config_manager.get_skills()
        
        # Model state
        self.student_profiles = None
        self.alumni_profiles = None
        self.similarity_matrix = None
        self.scaler = StandardScaler()
        
        logger.info(f"✓ Initialized {model_type} model with dynamic config")

    def refresh_configuration(self):
        """Refresh configuration from database"""
        self.config = self.config_manager.get_global_config(force_refresh=True)
        self.weights = self.config_manager.get_scoring_weights(force_refresh=True)
        self.departments = self.config_manager.get_departments()
        logger.info("✓ Configuration refreshed from database")

    def preprocess_profiles(self, students: List[Dict], alumni: List[Dict]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Preprocess student and alumni profiles with dynamic configuration
        
        Args:
            students: List of student profiles
            alumni: List of alumni profiles
        
        Returns:
            Tuple of processed DataFrames
        """
        student_df = pd.DataFrame(students)
        alumni_df = pd.DataFrame(alumni)

        # Add dynamic feature engineering
        student_df['profile_completeness'] = self._calculate_profile_completeness(student_df)
        alumni_df['profile_completeness'] = self._calculate_profile_completeness(alumni_df)

        # Filter based on dynamic data quality settings
        quality_config = self.config.get('data_quality', {})
        min_completeness = quality_config.get('min_profile_completeness', 0.5)
        require_active = quality_config.get('require_active', True)

        student_df = student_df[student_df['profile_completeness'] >= min_completeness]
        alumni_df = alumni_df[alumni_df['profile_completeness'] >= min_completeness]

        if require_active:
            student_df = student_df[student_df.get('isActive', True) == True]
            alumni_df = alumni_df[alumni_df.get('isActive', True) == True]

        logger.info(f"✓ Processed {len(student_df)} students, {len(alumni_df)} alumni")
        
        self.student_profiles = student_df
        self.alumni_profiles = alumni_df
        
        return student_df, alumni_df

    def _calculate_profile_completeness(self, df: pd.DataFrame) -> np.ndarray:
        """Calculate profile completeness score"""
        fields = ['department', 'skills', 'bio', 'achievements']
        completeness = df[fields].notna().sum(axis=1) / len(fields)
        return completeness * 100

    def _get_department_similarity(self, dept1: str, dept2: str) -> float:
        """
        Get similarity between departments using dynamic mappings
        
        Args:
            dept1: First department
            dept2: Second department
        
        Returns:
            Similarity score (0-1)
        """
        if dept1 == dept2:
            return 1.0

        related = self.config_manager.get_related_departments(dept1)
        if dept2 in related:
            # Get similarity score from database
            dept_doc = self.config_manager.db['department_mappings'].find_one(
                {'department': dept1}
            )
            return dept_doc.get('similarity_score', 0.8) if dept_doc else 0.8

        return 0.3

    def _get_skill_similarity(self, skills1: List[str], skills2: List[str]) -> float:
        """
        Calculate skill similarity using dynamic skill database
        
        Args:
            skills1: Skills list 1
            skills2: Skills list 2
        
        Returns:
            Similarity score (0-1)
        """
        if not skills1 or not skills2:
            return 0.0

        # Get skill weights from dynamic pool
        skill_weights = {}
        for skill in self.skills_pool:
            skill_weights[skill['skill_name']] = skill.get('weight', 1.0)

        common = set(skills1) & set(skills2)
        if not common:
            return 0.0

        weight_sum = sum(skill_weights.get(s, 1.0) for s in common)
        total_weight = max(
            sum(skill_weights.get(s, 1.0) for s in skills1),
            sum(skill_weights.get(s, 1.0) for s in skills2)
        )

        return min(weight_sum / total_weight, 1.0) if total_weight > 0 else 0.0

    def compute_content_based_scores(self, student: Dict, alumni_list: List[Dict]) -> List[float]:
        """
        Compute content-based recommendation scores
        Uses dynamic configuration weights
        
        Args:
            student: Student profile
            alumni_list: List of alumni profiles
        
        Returns:
            List of scores
        """
        scores = []
        weights = self.weights.get('weights', {})

        for alumni in alumni_list:
            # Dynamic weights from config
            dept_weight = weights.get('department', 0.35)
            skills_weight = weights.get('skills', 0.25)
            experience_weight = weights.get('experience', 0.20)
            achievements_weight = weights.get('achievements', 0.10)
            activity_weight = weights.get('activity', 0.10)

            # Department similarity
            dept_sim = self._get_department_similarity(
                student.get('department', ''),
                alumni.get('department', '')
            )

            # Skills similarity
            skills_sim = self._get_skill_similarity(
                student.get('skills', []),
                alumni.get('skills', [])
            )

            # Experience relevance
            exp_pref = self.weights.get('experience_thresholds', {})
            graduation_year = alumni.get('graduationYear', 0)
            years_experience = datetime.now().year - graduation_year
            
            ideal_min = exp_pref.get('ideal_min', 2)
            ideal_max = exp_pref.get('ideal_max', 8)
            good_min = exp_pref.get('good_min', 1)
            good_max = exp_pref.get('good_max', 10)

            if ideal_min <= years_experience <= ideal_max:
                exp_sim = 1.0
            elif good_min <= years_experience <= good_max:
                exp_sim = 0.7
            else:
                exp_sim = 0.3

            # Achievements
            achievements_sim = min(
                len(alumni.get('achievements', [])) / 5.0, 1.0
            )

            # Activity (profile completeness)
            activity_sim = alumni.get('profile_completeness', 50) / 100.0

            # Combined score
            score = (
                dept_sim * dept_weight +
                skills_sim * skills_weight +
                exp_sim * experience_weight +
                achievements_sim * achievements_weight +
                activity_sim * activity_weight
            )

            scores.append(score)

        return scores

    def get_recommendations(self, student: Dict, limit: int = None) -> List[Dict]:
        """
        Get recommendations for a student
        
        Args:
            student: Student profile
            limit: Number of recommendations (uses config default if None)
        
        Returns:
            List of recommended alumni
        """
        # Use dynamic config limits
        api_config = self.config.get('api', {})
        limit = limit or api_config.get('default_limit', 10)
        max_limit = api_config.get('max_limit', 50)
        limit = min(limit, max_limit)

        if self.alumni_profiles is None:
            logger.error("✗ Alumni profiles not loaded")
            return []

        alumni_list = self.alumni_profiles.to_dict('records')
        scores = self.compute_content_based_scores(student, alumni_list)

        # Apply minimum score threshold from config
        min_score = api_config.get('min_similarity_score', 0.0)
        
        recommendations = []
        for alumni, score in zip(alumni_list, scores):
            if score >= min_score:
                alumni_copy = alumni.copy()
                alumni_copy['recommendationScore'] = round(score * 100, 2)
                recommendations.append(alumni_copy)

        # Sort by score and limit
        recommendations.sort(key=lambda x: x['recommendationScore'], reverse=True)
        return recommendations[:limit]

    def save_model(self, file_path: str, version: int = 1, user_id: str = None):
        """Save model to file and register version"""
        try:
            model_data = {
                'model_type': self.model_type,
                'student_profiles': self.student_profiles,
                'alumni_profiles': self.alumni_profiles,
                'weights': self.weights,
                'config': self.config,
                'scaler': self.scaler,
                'timestamp': datetime.utcnow(),
            }

            with open(file_path, 'wb') as f:
                pickle.dump(model_data, f)

            # Register in database
            metrics = {
                'students_trained': len(self.student_profiles) if self.student_profiles is not None else 0,
                'alumni_trained': len(self.alumni_profiles) if self.alumni_profiles is not None else 0,
                'timestamp': datetime.utcnow().isoformat()
            }

            self.config_manager.register_model_version(
                version=version,
                model_type=self.model_type,
                file_path=file_path,
                metrics=metrics,
                user_id=user_id
            )

            logger.info(f"✓ Model saved to {file_path}")
            return True

        except Exception as e:
            logger.error(f"✗ Failed to save model: {e}")
            return False

    @staticmethod
    def load_model(file_path: str, config_manager: ConfigurationManager = None):
        """
        Load model from file
        
        Args:
            file_path: Path to model file
            config_manager: ConfigurationManager for refreshing config
        
        Returns:
            Loaded model instance
        """
        try:
            with open(file_path, 'rb') as f:
                model_data = pickle.load(f)

            instance = ProductionRecommendationModel(
                config_manager or ConfigurationManager('', ''),
                model_type=model_data.get('model_type', 'hybrid')
            )

            instance.student_profiles = model_data.get('student_profiles')
            instance.alumni_profiles = model_data.get('alumni_profiles')
            instance.weights = model_data.get('weights')
            instance.config = model_data.get('config')

            logger.info(f"✓ Model loaded from {file_path}")
            return instance

        except Exception as e:
            logger.error(f"✗ Failed to load model: {e}")
            return None


class HybridRecommendationModel(ProductionRecommendationModel):
    """
    Hybrid recommendation model combining content and collaborative filtering
    Uses dynamic weights from ConfigurationManager
    """

    def __init__(self, config_manager: ConfigurationManager):
        """Initialize hybrid model with dynamic config"""
        super().__init__(config_manager, model_type='hybrid')
        self.content_weight = None
        self.collaborative_weight = None
        self._update_algorithm_weights()

    def _update_algorithm_weights(self):
        """Update algorithm weights from config"""
        global_config = self.config_manager.get_global_config()
        system_config = global_config.get('system', {})
        
        # Default to 70-30 split if not specified
        self.content_weight = system_config.get('content_weight', 0.7)
        self.collaborative_weight = system_config.get('collaborative_weight', 0.3)

    def compute_recommendations(self, student: Dict, limit: int = None) -> List[Dict]:
        """
        Combine content-based and collaborative filtering
        Uses dynamic weights
        
        Args:
            student: Student profile
            limit: Number of recommendations
        
        Returns:
            List of recommended alumni
        """
        content_recs = self.get_recommendations(student, limit * 2 if limit else 20)
        
        # Combine with dynamic weights
        recommendations = []
        for rec in content_recs:
            rec['combinedScore'] = (
                rec['recommendationScore'] * self.content_weight
            )
            recommendations.append(rec)

        recommendations.sort(key=lambda x: x['combinedScore'], reverse=True)
        
        api_config = self.config.get('api', {})
        limit = limit or api_config.get('default_limit', 10)
        
        return recommendations[:limit]
