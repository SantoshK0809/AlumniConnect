# Flask API for Recommendation System
# Exposes ML models as REST endpoints

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import json
import traceback
from models import AlumniRecommendationModel
from data_processor import DataProcessor
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# Global model storage
loaded_model = None
student_profiles = None
alumni_profiles = None


# ==================== UTILITY FUNCTIONS ====================

def load_model(model_path='./models/alumni_recommendation_model.pkl'):
    """Load trained model from disk"""
    global loaded_model
    
    if loaded_model is not None:
        return loaded_model
    
    try:
        model = AlumniRecommendationModel()
        model.load_model(model_path)
        loaded_model = model
        return model
    except Exception as e:
        raise Exception(f"Failed to load model: {str(e)}")


def load_profiles():
    """Load student and alumni profiles from files"""
    global student_profiles, alumni_profiles
    
    if student_profiles is not None and alumni_profiles is not None:
        return student_profiles, alumni_profiles
    
    try:
        student_profiles = pd.read_csv('./data/students.csv')
        alumni_profiles = pd.read_csv('./data/alumni.csv')
        return student_profiles, alumni_profiles
    except Exception as e:
        raise Exception(f"Failed to load profiles: {str(e)}")


# ==================== HEALTH CHECK ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Alumni Recommendation System API'
    }), 200


# ==================== RECOMMENDATION ENDPOINTS ====================

@app.route('/api/recommendations/alumni', methods=['POST'])
def get_alumni_recommendations():
    """
    Get recommended alumni for a student
    
    POST body:
    {
        "student_id": "string",
        "limit": number (default: 10),
        "min_score": number (default: 0),
        "filter_department": string (optional)
    }
    """
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        limit = int(data.get('limit', 10))
        min_score = float(data.get('min_score', 0))
        filter_dept = data.get('filter_department')
        
        if not student_id:
            return jsonify({'error': 'student_id is required'}), 400
        
        # Load model and profiles
        model = load_model()
        students_df, alumni_df = load_profiles()
        
        # Find student index
        student_row = students_df[students_df['student_id'] == student_id]
        if student_row.empty:
            return jsonify({'error': 'Student not found'}), 404
        
        student_idx = student_row.index[0]
        
        # Get recommendations
        recommendations = model.get_recommendations(student_idx, limit, min_score)
        
        # Build response
        result = []
        for alumni_idx, score in recommendations:
            alumni = alumni_df.iloc[alumni_idx]
            
            # Apply department filter if specified
            if filter_dept and alumni['department'].lower() != filter_dept.lower():
                continue
            
            result.append({
                'alumni_id': alumni['alumni_id'],
                'user_id': alumni['user_id'],
                'name': alumni['name'],
                'email': alumni['email'],
                'department': alumni['department'],
                'graduationYear': int(alumni['graduationYear']),
                'currentCompany': alumni['currentCompany'],
                'currentPosition': alumni['currentPosition'],
                'skills': [s.strip() for s in str(alumni['skills']).split(',') if s.strip()],
                'achievements': [a.strip() for a in str(alumni['achievements']).split(',') if a.strip()],
                'bio': alumni['bio'],
                'linkedIn': alumni['linkedin'],
                'location': alumni['location'],
                'recommendationScore': round(float(score) * 100, 2)  # Convert to 0-100 scale
            })
        
        return jsonify({
            'success': True,
            'count': len(result),
            'recommendations': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/recommendations/alumni/<alumni_idx>/detail', methods=['GET'])
def get_recommendation_detail(alumni_idx):
    """
    Get detailed recommendation analysis for a specific alumni
    
    Query params:
    - student_id: string (required)
    """
    try:
        student_id = request.args.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'student_id query parameter is required'}), 400
        
        model = load_model()
        students_df, alumni_df = load_profiles()
        
        # Find student and alumni
        student_row = students_df[students_df['student_id'] == student_id]
        alumni_row = alumni_df[alumni_df['alumni_id'] == alumni_idx]
        
        if student_row.empty or alumni_row.empty:
            return jsonify({'error': 'Student or Alumni not found'}), 404
        
        student = student_row.iloc[0]
        alumni = alumni_row.iloc[0]
        student_idx = student_row.index[0]
        alumni_idx_computed = alumni_row.index[0]
        
        # Calculate scores
        score = model.calculateRecommendationScore(
            {'batch': student['batch'], 'department': student['department'], 
             'skills': str(student['skills']).split(','), 'projects': str(student['projects']).split(',')},
            {'graduationYear': alumni['graduationYear'], 'department': alumni['department'], 
             'skills': str(alumni['skills']).split(','), 'achievements': str(alumni['achievements']).split(','),
             'isActive': alumni['isActive'], 'verified': alumni['verified']}
        )
        
        dept_score = model.calculateDepartmentScore(student['department'], alumni['department']) * 35
        skills_score = model.calculateArraySimilarity(
            str(student['skills']).split(','),
            str(alumni['skills']).split(',')
        ) * 25
        exp_score = model.calculateExperienceScore(student['batch'], alumni['graduationYear']) * 20
        
        return jsonify({
            'success': True,
            'detail': {
                'alumni': {
                    'alumni_id': alumni['alumni_id'],
                    'name': alumni['name'],
                    'department': alumni['department'],
                    'currentCompany': alumni['currentCompany'],
                    'currentPosition': alumni['currentPosition'],
                },
                'scores': {
                    'overall': round(score, 2),
                    'department': round(dept_score, 2),
                    'skills': round(skills_score, 2),
                    'experience': round(exp_score, 2)
                },
                'reasoning': {
                    'department_match': 'Same' if student['department'] == alumni['department'] else 'Related',
                    'years_difference': int(alumni['graduationYear'] - student['batch']),
                    'matching_skills': len(set(str(student['skills']).split(',')) & 
                                         set(str(alumni['skills']).split(',')))
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/recommendations/analytics', methods=['POST'])
def get_recommendation_analytics():
    """
    Get analytics about recommendations for a student
    
    POST body:
    {
        "student_id": "string"
    }
    """
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'student_id is required'}), 400
        
        model = load_model()
        students_df, alumni_df = load_profiles()
        
        # Find student
        student_row = students_df[students_df['student_id'] == student_id]
        if student_row.empty:
            return jsonify({'error': 'Student not found'}), 404
        
        student_idx = student_row.index[0]
        
        # Get all recommendations
        all_recommendations = model.get_recommendations(student_idx, len(alumni_df))
        
        # Build analytics
        scores = [score for _, score in all_recommendations]
        dept_breakdown = {}
        
        for alumni_idx, _ in all_recommendations:
            alumni = alumni_df.iloc[alumni_idx]
            dept = alumni['department']
            dept_breakdown[dept] = dept_breakdown.get(dept, 0) + 1
        
        analytics = {
            'success': True,
            'analytics': {
                'totalRecommendations': len(all_recommendations),
                'averageScore': round(np.mean(scores) * 100, 2) if scores else 0,
                'maxScore': round(max(scores) * 100, 2) if scores else 0,
                'minScore': round(min(scores) * 100, 2) if scores else 0,
                'departmentBreakdown': dept_breakdown
            }
        }
        
        return jsonify(analytics), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/recommendations/similar-alumni', methods=['GET'])
def get_similar_alumni():
    """
    Get similar alumni (for networking)
    
    Query params:
    - alumni_id: string (required)
    - limit: number (default: 10)
    """
    try:
        alumni_id = request.args.get('alumni_id')
        limit = int(request.args.get('limit', 10))
        
        if not alumni_id:
            return jsonify({'error': 'alumni_id query parameter is required'}), 400
        
        model = load_model()
        students_df, alumni_df = load_profiles()
        
        # Find alumni index
        alumni_row = alumni_df[alumni_df['alumni_id'] == alumni_id]
        if alumni_row.empty:
            return jsonify({'error': 'Alumni not found'}), 404
        
        alumni_idx = alumni_row.index[0]
        
        # Get similar alumni
        similar = model.get_similar_alumni(alumni_idx, limit)
        
        result = []
        for similar_idx, score in similar:
            similar_alumni = alumni_df.iloc[similar_idx]
            result.append({
                'alumni_id': similar_alumni['alumni_id'],
                'name': similar_alumni['name'],
                'department': similar_alumni['department'],
                'currentCompany': similar_alumni['currentCompany'],
                'similarityScore': round(float(score) * 100, 2)
            })
        
        return jsonify({
            'success': True,
            'count': len(result),
            'similarAlumni': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


# ==================== MODEL MANAGEMENT ====================

@app.route('/api/model/stats', methods=['GET'])
def get_model_stats():
    """Get model statistics"""
    try:
        stats_path = './models/alumni_recommendation_model_stats.json'
        
        if not os.path.exists(stats_path):
            return jsonify({'error': 'Model statistics not found'}), 404
        
        with open(stats_path, 'r') as f:
            stats = json.load(f)
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/model/retrain', methods=['POST'])
def retrain_model():
    """
    Trigger model retraining
    (Note: In production, this should be an async task)
    """
    try:
        from train import ModelTrainer
        
        trainer = ModelTrainer(model_type='hybrid')
        trainer.run_complete_pipeline(use_local_files=True, evaluate=False)
        
        # Reload model
        global loaded_model
        loaded_model = None
        model = load_model()
        
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Load model on startup
    try:
        load_model()
        load_profiles()
        print("✓ Model and profiles loaded successfully")
    except Exception as e:
        print(f"Warning: Could not load model on startup: {e}")
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=False)
