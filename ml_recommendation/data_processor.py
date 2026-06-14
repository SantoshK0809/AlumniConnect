# Data Processing Module for Recommendation System

import pandas as pd
import numpy as np
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime
import json

load_dotenv()


class DataProcessor:
    """
    Handles data extraction from MongoDB and preprocessing for ML models
    """

    def __init__(self, mongo_uri=None):
        """
        Initialize MongoDB connection
        
        Args:
            mongo_uri: MongoDB connection string (defaults to env variable)
        """
        self.mongo_uri = mongo_uri or os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
        self.client = None
        self.db = None

    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client.get_database()
            print("Connected to MongoDB successfully")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise

    def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")

    def fetch_students_data(self):
        """
        Fetch and prepare student data from MongoDB
        
        Returns:
            DataFrame with student profiles
        """
        try:
            students = list(self.db.students.find())
            users = {str(u['_id']): u for u in self.db.users.find()}
            
            data = []
            for student in students:
                user = users.get(str(student.get('user')))
                if user:
                    data.append({
                        'student_id': str(student['_id']),
                        'user_id': str(student['user']),
                        'name': user.get('name', ''),
                        'email': user.get('email', ''),
                        'department': student.get('department', ''),
                        'batch': student.get('batch', 2024),
                        'currentYear': student.get('currentYear', ''),
                        'skills': ','.join(student.get('skills', [])),
                        'projects': ','.join(student.get('projects', [])),
                        'achievements': ','.join(student.get('achievements', [])),
                        'bio': student.get('bio', ''),
                        'verified': student.get('verified', False),
                        'isActive': student.get('isActive', True),
                    })
            
            df = pd.DataFrame(data)
            print(f"Fetched {len(df)} students")
            return df
            
        except Exception as e:
            print(f"Error fetching student data: {e}")
            raise

    def fetch_alumni_data(self):
        """
        Fetch and prepare alumni data from MongoDB
        
        Returns:
            DataFrame with alumni profiles
        """
        try:
            alumni = list(self.db.alumni.find())
            users = {str(u['_id']): u for u in self.db.users.find()}
            
            data = []
            for alumnus in alumni:
                user = users.get(str(alumnus.get('user')))
                if user:
                    data.append({
                        'alumni_id': str(alumnus['_id']),
                        'user_id': str(alumnus['user']),
                        'name': user.get('name', ''),
                        'email': user.get('email', ''),
                        'department': alumnus.get('department', ''),
                        'graduationYear': alumnus.get('graduationYear', 2020),
                        'currentCompany': alumnus.get('currentCompany', ''),
                        'currentPosition': alumnus.get('currentPosition', ''),
                        'skills': ','.join(alumnus.get('skills', [])),
                        'achievements': ','.join(alumnus.get('achievements', [])),
                        'contributions': ','.join(alumnus.get('contributions', [])),
                        'bio': alumnus.get('bio', ''),
                        'location': alumnus.get('location', ''),
                        'linkedin': alumnus.get('linkedin', ''),
                        'verified': alumnus.get('verified', False),
                        'isActive': alumnus.get('isActive', True),
                    })
            
            df = pd.DataFrame(data)
            print(f"Fetched {len(df)} alumni")
            return df
            
        except Exception as e:
            print(f"Error fetching alumni data: {e}")
            raise

    def fetch_interaction_data(self):
        """
        Fetch interaction data (profiles views, connections, messages, etc.)
        
        Returns:
            DataFrame with interaction records
        """
        try:
            interactions = []
            
            # Get message interactions
            messages = list(self.db.messages.find({}, {
                'user': 1,
                'receiver': 1,
                'createdAt': 1
            }))
            
            for msg in messages:
                interactions.append({
                    'student_id': str(msg.get('user')),
                    'alumni_id': str(msg.get('receiver')),
                    'interaction_type': 'message',
                    'weight': 1,
                    'timestamp': msg.get('createdAt')
                })
            
            df = pd.DataFrame(interactions) if interactions else pd.DataFrame()
            print(f"Fetched {len(df)} interaction records")
            return df
            
        except Exception as e:
            print(f"Error fetching interaction data: {e}")
            return pd.DataFrame()

    def clean_data(self, df, data_type='student'):
        """
        Clean and validate data
        
        Args:
            df: DataFrame to clean
            data_type: 'student' or 'alumni'
            
        Returns:
            Cleaned DataFrame
        """
        # Remove duplicates
        df = df.drop_duplicates(subset=['email'], keep='first')
        
        # Fill missing values
        if data_type == 'student':
            df['skills'] = df['skills'].fillna('')
            df['projects'] = df['projects'].fillna('')
            df['achievements'] = df['achievements'].fillna('')
            df['batch'] = df['batch'].fillna(2024)
        else:
            df['skills'] = df['skills'].fillna('')
            df['achievements'] = df['achievements'].fillna('')
            df['contributions'] = df['contributions'].fillna('')
            df['graduationYear'] = df['graduationYear'].fillna(2020)
        
        # Remove inactive users
        df = df[df['isActive'] == True]
        
        # Verify required fields
        required_fields = ['department', 'email', 'name']
        df = df.dropna(subset=required_fields)
        
        print(f"Cleaned {len(df)} records")
        return df

    @staticmethod
    def parse_skills(skills_string):
        """
        Parse skills from string format
        
        Args:
            skills_string: Comma-separated string or list
            
        Returns:
            List of skills
        """
        if isinstance(skills_string, list):
            return skills_string
        if isinstance(skills_string, str):
            return [s.strip().lower() for s in skills_string.split(',') if s.strip()]
        return []

    def export_data(self, students_df, alumni_df, interactions_df, output_dir='./data'):
        """
        Export processed data to CSV files
        
        Args:
            students_df: Student DataFrame
            alumni_df: Alumni DataFrame
            interactions_df: Interactions DataFrame
            output_dir: Directory to save files
        """
        os.makedirs(output_dir, exist_ok=True)
        
        students_df.to_csv(f'{output_dir}/students.csv', index=False)
        alumni_df.to_csv(f'{output_dir}/alumni.csv', index=False)
        
        if not interactions_df.empty:
            interactions_df.to_csv(f'{output_dir}/interactions.csv', index=False)
        
        print(f"Data exported to {output_dir}")

    def prepare_training_data(self):
        """
        Complete pipeline: fetch, clean, and export data
        
        Returns:
            Tuple of (students_df, alumni_df, interactions_df)
        """
        # Connect to database
        self.connect()
        
        try:
            # Fetch data
            print("\n--- Fetching Data ---")
            students_df = self.fetch_students_data()
            alumni_df = self.fetch_alumni_data()
            interactions_df = self.fetch_interaction_data()
            
            # Clean data
            print("\n--- Cleaning Data ---")
            students_df = self.clean_data(students_df, 'student')
            alumni_df = self.clean_data(alumni_df, 'alumni')
            
            # Export data
            print("\n--- Exporting Data ---")
            self.export_data(students_df, alumni_df, interactions_df)
            
            return students_df, alumni_df, interactions_df
            
        finally:
            self.disconnect()


class FeatureEngineer:
    """
    Advanced feature engineering for better recommendations
    """

    @staticmethod
    def extract_skills_features(skills_str):
        """Extract individual skills from comma-separated string"""
        return DataProcessor.parse_skills(skills_str)

    @staticmethod
    def calculate_experience_level(graduation_year):
        """
        Calculate experience level from graduation year
        
        Returns:
            Float between 0 and 1
        """
        current_year = datetime.now().year
        years_exp = current_year - graduation_year
        
        if years_exp <= 0:
            return 0
        elif years_exp > 15:
            return 1.0
        else:
            return min(years_exp / 15, 1.0)

    @staticmethod
    def calculate_profile_completeness(profile):
        """
        Calculate profile completeness score
        
        Args:
            profile: Dictionary or row with profile fields
            
        Returns:
            Score between 0 and 1
        """
        required_fields = ['name', 'email', 'department', 'skills', 'bio']
        filled_fields = sum(1 for field in required_fields if profile.get(field))
        return filled_fields / len(required_fields)

    @staticmethod
    def create_interest_vector(skills, projects, achievements):
        """
        Create a combined interest vector from multiple sources
        """
        interests = set()
        interests.update(DataProcessor.parse_skills(skills))
        interests.update(DataProcessor.parse_skills(projects))
        interests.update(DataProcessor.parse_skills(achievements))
        return list(interests)

    @staticmethod
    def calculate_skill_diversity(skills_list):
        """
        Calculate skill diversity score
        Higher score = more diverse skills
        """
        if not skills_list or len(skills_list) == 0:
            return 0
        
        # Normalize by count (diminishing returns)
        return min(len(set(skills_list)) / 10, 1.0)
