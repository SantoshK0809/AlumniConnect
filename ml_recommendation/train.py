# Training Script for Recommendation Models

import pandas as pd
import numpy as np
from models import AlumniRecommendationModel, HybridRecommendationModel
from data_processor import DataProcessor, FeatureEngineer
import os
import json
from datetime import datetime
import argparse


class ModelTrainer:
    """
    End-to-end trainer for recommendation models
    """

    def __init__(self, model_type='hybrid', model_dir='./models'):
        """
        Initialize trainer
        
        Args:
            model_type: 'content', 'hybrid'
            model_dir: Directory to save models
        """
        self.model_type = model_type
        self.model_dir = model_dir
        self.model = None
        self.training_stats = {}
        
        os.makedirs(model_dir, exist_ok=True)

    def prepare_data(self, use_local_files=True):
        """
        Prepare training data
        
        Args:
            use_local_files: If True, load from CSV files; if False, fetch from MongoDB
            
        Returns:
            Tuple of (students_df, alumni_df, interactions_df)
        """
        print("=" * 80)
        print("PREPARING DATA")
        print("=" * 80)
        
        if use_local_files:
            print("\nLoading data from local CSV files...")
            try:
                students_df = pd.read_csv('./data/students.csv')
                alumni_df = pd.read_csv('./data/alumni.csv')
                
                interactions_df = None
                if os.path.exists('./data/interactions.csv'):
                    interactions_df = pd.read_csv('./data/interactions.csv')
                else:
                    interactions_df = pd.DataFrame()
                    
                print(f"✓ Loaded {len(students_df)} students")
                print(f"✓ Loaded {len(alumni_df)} alumni")
                print(f"✓ Loaded {len(interactions_df)} interactions")
                
            except FileNotFoundError:
                print("CSV files not found. Fetching from MongoDB...")
                use_local_files = False
        
        if not use_local_files:
            print("\nFetching data from MongoDB...")
            processor = DataProcessor()
            students_df, alumni_df, interactions_df = processor.prepare_training_data()
        
        return students_df, alumni_df, interactions_df

    def train_content_based_model(self, students_df, alumni_df):
        """
        Train content-based recommendation model
        """
        print("\n" + "=" * 80)
        print("TRAINING CONTENT-BASED MODEL")
        print("=" * 80)
        
        self.model = AlumniRecommendationModel()
        
        print("\nPreprocessing data...")
        student_features, alumni_features = self.model.preprocess_data(students_df, alumni_df)
        print(f"✓ Student features shape: {student_features.shape}")
        print(f"✓ Alumni features shape: {alumni_features.shape}")
        
        print("\nComputing similarity matrix...")
        similarity_matrix = self.model.compute_similarity_matrix()
        print(f"✓ Similarity matrix shape: {similarity_matrix.shape}")
        
        # Training statistics
        self.training_stats = {
            'model_type': 'content-based',
            'timestamp': datetime.now().isoformat(),
            'students_count': len(students_df),
            'alumni_count': len(alumni_df),
            'feature_dimensions': student_features.shape[1],
            'average_similarity': float(np.mean(similarity_matrix)),
            'max_similarity': float(np.max(similarity_matrix)),
            'min_similarity': float(np.min(similarity_matrix))
        }
        
        print("\nTraining Statistics:")
        for key, value in self.training_stats.items():
            print(f"  {key}: {value}")

    def train_hybrid_model(self, students_df, alumni_df, interactions_df):
        """
        Train hybrid model combining content-based and collaborative filtering
        """
        print("\n" + "=" * 80)
        print("TRAINING HYBRID MODEL")
        print("=" * 80)
        
        self.model = HybridRecommendationModel(content_weight=0.7, collaborative_weight=0.3)
        
        print("\nTraining hybrid model...")
        self.model.train(students_df, alumni_df, interactions_df if not interactions_df.empty else None)
        
        self.training_stats = {
            'model_type': 'hybrid',
            'timestamp': datetime.now().isoformat(),
            'students_count': len(students_df),
            'alumni_count': len(alumni_df),
            'interactions_count': len(interactions_df) if not interactions_df.empty else 0,
            'content_weight': 0.7,
            'collaborative_weight': 0.3
        }
        
        print("\nTraining Statistics:")
        for key, value in self.training_stats.items():
            print(f"  {key}: {value}")

    def evaluate_model(self, students_df, alumni_df, n_samples=10):
        """
        Evaluate model performance on sample recommendations
        
        Args:
            students_df: Student profiles
            alumni_df: Alumni profiles
            n_samples: Number of sample recommendations to show
        """
        print("\n" + "=" * 80)
        print("MODEL EVALUATION")
        print("=" * 80)
        
        if self.model is None:
            print("Model not trained")
            return
        
        print(f"\nGenerating sample recommendations for {min(n_samples, len(students_df))} students...")
        
        evaluation_results = []
        
        for student_idx in range(min(n_samples, len(students_df))):
            student = students_df.iloc[student_idx]
            
            if self.model_type == 'content':
                recommendations = self.model.get_recommendations(student_idx, 5)
            else:
                recommendations = self.model.content_model.get_recommendations(student_idx, 5)
            
            top_alumni = [(alumni_df.iloc[idx]['name'], score) for idx, score in recommendations]
            
            result = {
                'student_id': student['student_id'],
                'student_name': student['name'],
                'department': student['department'],
                'recommendations': top_alumni
            }
            evaluation_results.append(result)
            
            print(f"\n  Student: {student['name']} ({student['department']})")
            print(f"  Top recommendations:")
            for i, (alumni_name, score) in enumerate(top_alumni, 1):
                print(f"    {i}. {alumni_name} (Score: {score:.2%})")
        
        return evaluation_results

    def save_model(self, model_name='alumni_recommendation_model'):
        """
        Save trained model to disk
        
        Args:
            model_name: Name for the model file
        """
        if self.model is None:
            print("No model to save")
            return
        
        print("\n" + "=" * 80)
        print("SAVING MODEL")
        print("=" * 80)
        
        model_path = os.path.join(self.model_dir, f"{model_name}.pkl")
        
        if self.model_type == 'content':
            self.model.save_model(model_path)
        else:
            self.model.content_model.save_model(model_path)
        
        # Save statistics
        stats_path = os.path.join(self.model_dir, f"{model_name}_stats.json")
        with open(stats_path, 'w') as f:
            json.dump(self.training_stats, f, indent=2)
        
        print(f"✓ Model saved to {model_path}")
        print(f"✓ Statistics saved to {stats_path}")

    def run_complete_pipeline(self, model_name='alumni_recommendation_model', 
                            use_local_files=True, evaluate=True):
        """
        Run complete training pipeline
        """
        print("\n" * 2)
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 20 + "ALUMNI RECOMMENDATION MODEL TRAINING" + " " * 22 + "║")
        print("╚" + "=" * 78 + "╝")
        
        # Prepare data
        students_df, alumni_df, interactions_df = self.prepare_data(use_local_files)
        
        # Train model
        if self.model_type == 'hybrid':
            self.train_hybrid_model(students_df, alumni_df, interactions_df)
        else:
            self.train_content_based_model(students_df, alumni_df)
        
        # Evaluate
        if evaluate:
            self.evaluate_model(students_df, alumni_df, n_samples=5)
        
        # Save model
        self.save_model(model_name)
        
        print("\n" + "=" * 80)
        print("✓ TRAINING COMPLETE")
        print("=" * 80 + "\n")


def main():
    """
    Main entry point for model training
    """
    parser = argparse.ArgumentParser(description='Train Alumni Recommendation Model')
    parser.add_argument('--model-type', choices=['content', 'hybrid'], default='hybrid',
                       help='Type of model to train')
    parser.add_argument('--model-name', default='alumni_recommendation_model',
                       help='Name for the trained model')
    parser.add_argument('--model-dir', default='./models',
                       help='Directory to save models')
    parser.add_argument('--use-local-files', action='store_true',
                       help='Load data from local CSV files instead of MongoDB')
    parser.add_argument('--no-evaluate', action='store_true',
                       help='Skip model evaluation')
    
    args = parser.parse_args()
    
    trainer = ModelTrainer(model_type=args.model_type, model_dir=args.model_dir)
    trainer.run_complete_pipeline(
        model_name=args.model_name,
        use_local_files=args.use_local_files,
        evaluate=not args.no_evaluate
    )


if __name__ == '__main__':
    main()
