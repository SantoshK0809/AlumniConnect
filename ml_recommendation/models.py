# Alumni Recommendation System - Python ML Pipeline
# This module contains the core recommendation algorithms

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import csr_matrix
import pickle
import warnings

warnings.filterwarnings('ignore')


class AlumniRecommendationModel:
    """
    Hybrid recommendation system combining content-based and collaborative filtering
    """

    def __init__(self):
        self.scaler = StandardScaler()
        self.mlb_skills = MultiLabelBinarizer()
        self.mlb_achievements = MultiLabelBinarizer()
        self.tfidf_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        
        self.student_features = None
        self.alumni_features = None
        self.student_profiles = None
        self.alumni_profiles = None
        self.similarity_matrix = None

    def preprocess_data(self, students_df, alumni_df):
        """
        Preprocess student and alumni data for modeling
        
        Args:
            students_df: DataFrame with student profiles
            alumni_df: DataFrame with alumni profiles
            
        Returns:
            Processed feature matrices
        """
        self.student_profiles = students_df.copy()
        self.alumni_profiles = alumni_df.copy()
        
        # Extract and encode skills
        all_student_skills = [str(s).split(',') if pd.notna(s) else [] 
                             for s in students_df.get('skills', [])]
        all_alumni_skills = [str(s).split(',') if pd.notna(s) else [] 
                            for s in alumni_df.get('skills', [])]
        
        self.mlb_skills.fit(all_student_skills + all_alumni_skills)
        
        # Extract and encode achievements
        all_student_projects = [str(p).split(',') if pd.notna(p) else [] 
                               for p in students_df.get('projects', [])]
        all_alumni_achievements = [str(a).split(',') if pd.notna(a) else [] 
                                  for a in alumni_df.get('achievements', [])]
        
        self.mlb_achievements.fit(all_student_projects + all_alumni_achievements)
        
        # Encode skills for students and alumni
        student_skills_encoded = self.mlb_skills.transform(all_student_skills)
        alumni_skills_encoded = self.mlb_skills.transform(all_alumni_skills)
        
        # Encode achievements/projects
        student_projects_encoded = self.mlb_achievements.transform(all_student_projects)
        alumni_achievements_encoded = self.mlb_achievements.transform(all_alumni_achievements)
        
        # Create numerical features
        student_features = self._create_feature_matrix(
            students_df, student_skills_encoded, student_projects_encoded
        )
        alumni_features = self._create_feature_matrix(
            alumni_df, alumni_skills_encoded, alumni_achievements_encoded
        )
        
        self.student_features = student_features
        self.alumni_features = alumni_features
        
        return student_features, alumni_features

    def _create_feature_matrix(self, profile_df, skills_encoded, achievements_encoded):
        """
        Create feature matrix combining multiple feature types
        """
        features = []
        
        # Department encoding
        departments = profile_df.get('department', [])
        dept_mapping = self._get_department_mapping()
        dept_encoded = np.array([dept_mapping.get(str(d).lower(), 0) for d in departments]).reshape(-1, 1)
        
        # Batch/Graduation year (normalized)
        years = profile_df.get('batch', []) if 'batch' in profile_df.columns else profile_df.get('graduationYear', [])
        years_normalized = np.array([max(0, (y - 2015) / 10) if pd.notna(y) else 0 for y in years]).reshape(-1, 1)
        
        # Combine all features
        combined = np.hstack([
            dept_encoded,
            years_normalized,
            skills_encoded.toarray() if hasattr(skills_encoded, 'toarray') else skills_encoded,
            achievements_encoded.toarray() if hasattr(achievements_encoded, 'toarray') else achievements_encoded
        ])
        
        return combined

    def _get_department_mapping(self):
        """Map departments to numerical values"""
        return {
            'computer science and engineering': 1,
            'information technology': 1,
            'artificial intelligence and data science': 1,
            'electronics and telecommunication': 2,
            'electrical engineering': 2,
            'instrumentation engineering': 2,
            'mechanical engineering': 3,
            'civil engineering': 3,
            'chemical engineering': 3
        }

    def compute_similarity_matrix(self):
        """
        Compute cosine similarity between students and alumni
        """
        if self.student_features is None or self.alumni_features is None:
            raise ValueError("Features not computed. Run preprocess_data first.")
        
        self.similarity_matrix = cosine_similarity(self.student_features, self.alumni_features)
        return self.similarity_matrix

    def get_recommendations(self, student_idx, n_recommendations=10, min_score=0.0):
        """
        Get top N alumni recommendations for a specific student
        
        Args:
            student_idx: Index of student
            n_recommendations: Number of recommendations
            min_score: Minimum similarity score (0-1)
            
        Returns:
            List of (alumni_idx, score) tuples
        """
        if self.similarity_matrix is None:
            self.compute_similarity_matrix()
        
        scores = self.similarity_matrix[student_idx]
        
        # Filter by minimum score
        valid_indices = np.where(scores >= min_score)[0]
        valid_scores = scores[valid_indices]
        
        # Sort and get top N
        top_indices = valid_scores.argsort()[::-1][:n_recommendations]
        recommendations = [(valid_indices[i], valid_scores[i]) for i in top_indices]
        
        return recommendations

    def get_recommendations_bulk(self, n_recommendations=10, min_score=0.0):
        """
        Get recommendations for all students
        
        Returns:
            Dictionary mapping student_idx to list of (alumni_idx, score)
        """
        recommendations = {}
        for student_idx in range(len(self.student_profiles)):
            recommendations[student_idx] = self.get_recommendations(
                student_idx, n_recommendations, min_score
            )
        return recommendations

    def get_similar_alumni(self, alumni_idx, n_similar=10):
        """
        Get similar alumni for a given alumni (for networking)
        """
        if self.alumni_features is None:
            raise ValueError("Alumni features not computed")
        
        similarities = cosine_similarity(
            self.alumni_features[alumni_idx].reshape(1, -1),
            self.alumni_features
        )[0]
        
        # Exclude self
        similarities[alumni_idx] = -1
        
        top_indices = np.argsort(similarities)[::-1][:n_similar]
        top_scores = [similarities[i] for i in top_indices]
        
        return list(zip(top_indices, top_scores))

    def save_model(self, filepath):
        """Save trained model to disk"""
        model_data = {
            'scaler': self.scaler,
            'mlb_skills': self.mlb_skills,
            'mlb_achievements': self.mlb_achievements,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'student_features': self.student_features,
            'alumni_features': self.alumni_features,
            'similarity_matrix': self.similarity_matrix,
            'student_profiles': self.student_profiles,
            'alumni_profiles': self.alumni_profiles
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"Model saved to {filepath}")

    def load_model(self, filepath):
        """Load trained model from disk"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.scaler = model_data['scaler']
        self.mlb_skills = model_data['mlb_skills']
        self.mlb_achievements = model_data['mlb_achievements']
        self.tfidf_vectorizer = model_data['tfidf_vectorizer']
        self.student_features = model_data['student_features']
        self.alumni_features = model_data['alumni_features']
        self.similarity_matrix = model_data['similarity_matrix']
        self.student_profiles = model_data['student_profiles']
        self.alumni_profiles = model_data['alumni_profiles']
        
        print(f"Model loaded from {filepath}")


class CollaborativeFilteringModel:
    """
    Collaborative filtering using matrix factorization
    For when we have interaction data (views, connections, etc.)
    """

    def __init__(self, n_factors=10):
        self.n_factors = n_factors
        self.user_factors = None
        self.item_factors = None
        self.interaction_matrix = None

    def create_interaction_matrix(self, interactions_df):
        """
        Create user-item interaction matrix
        
        Args:
            interactions_df: DataFrame with columns ['student_id', 'alumni_id', 'interaction_type', 'weight']
        """
        self.interaction_matrix = interactions_df.pivot_table(
            index='student_id',
            columns='alumni_id',
            values='weight',
            fill_value=0
        )
        return self.interaction_matrix

    def train(self, interaction_matrix, learning_rate=0.01, n_epochs=100):
        """
        Simple matrix factorization training
        """
        self.interaction_matrix = interaction_matrix
        n_users, n_items = interaction_matrix.shape
        
        # Initialize factors randomly
        self.user_factors = np.random.randn(n_users, self.n_factors) * 0.01
        self.item_factors = np.random.randn(n_items, self.n_factors) * 0.01
        
        # Simple SGD training
        for epoch in range(n_epochs):
            for i in range(n_users):
                for j in range(n_items):
                    if interaction_matrix.iloc[i, j] != 0:
                        # Prediction
                        pred = np.dot(self.user_factors[i], self.item_factors[j])
                        error = interaction_matrix.iloc[i, j] - pred
                        
                        # Update factors
                        self.user_factors[i] += learning_rate * error * self.item_factors[j]
                        self.item_factors[j] += learning_rate * error * self.user_factors[i]

    def get_recommendations(self, user_idx, n_recommendations=10):
        """Get recommendations for a user using collaborative filtering"""
        if self.user_factors is None:
            raise ValueError("Model not trained")
        
        predictions = np.dot(self.user_factors[user_idx], self.item_factors.T)
        top_indices = np.argsort(predictions)[::-1][:n_recommendations]
        top_scores = predictions[top_indices]
        
        return list(zip(top_indices, top_scores))


class HybridRecommendationModel:
    """
    Hybrid recommender combining content-based and collaborative filtering
    """

    def __init__(self, content_weight=0.7, collaborative_weight=0.3):
        self.content_model = AlumniRecommendationModel()
        self.collaborative_model = CollaborativeFilteringModel()
        self.content_weight = content_weight
        self.collaborative_weight = collaborative_weight

    def train(self, students_df, alumni_df, interactions_df=None):
        """
        Train hybrid model
        """
        # Train content-based model
        self.content_model.preprocess_data(students_df, alumni_df)
        self.content_model.compute_similarity_matrix()
        
        # Train collaborative model if interactions provided
        if interactions_df is not None and not interactions_df.empty:
            interaction_matrix = self.collaborative_model.create_interaction_matrix(
                interactions_df
            )
            self.collaborative_model.train(interaction_matrix)

    def get_recommendations(self, student_idx, n_recommendations=10):
        """
        Get hybrid recommendations
        """
        # Get content-based scores
        content_recs = self.content_model.get_recommendations(
            student_idx, n_recommendations * 2  # Get more to rank later
        )
        
        # Normalize content scores
        content_scores = {}
        for alumni_idx, score in content_recs:
            content_scores[alumni_idx] = score
        
        # Get collaborative scores if model is trained
        if self.collaborative_model.user_factors is not None:
            try:
                collab_recs = self.collaborative_model.get_recommendations(
                    student_idx, n_recommendations * 2
                )
                collab_scores = {}
                for alumni_idx, score in collab_recs:
                    # Normalize collaborative scores to 0-1
                    collab_scores[alumni_idx] = (score - np.min(score)) / (np.max(score) - np.min(score) + 1e-6)
            except:
                collab_scores = {}
        else:
            collab_scores = {}
        
        # Combine scores
        combined_scores = {}
        all_alumni = set(content_scores.keys()) | set(collab_scores.keys())
        
        for alumni_idx in all_alumni:
            content_score = content_scores.get(alumni_idx, 0)
            collab_score = collab_scores.get(alumni_idx, 0)
            
            combined_score = (
                self.content_weight * content_score +
                self.collaborative_weight * collab_score
            )
            combined_scores[alumni_idx] = combined_score
        
        # Sort and return top N
        sorted_recs = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_recs[:n_recommendations]
