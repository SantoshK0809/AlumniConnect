# Flask API for Recommendation System
# Connects directly to MongoDB - no CSV files needed

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback
from models import AlumniRecommendationModel
import pandas as pd
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'test')

# Global model storage
loaded_model = None
db_client = None
db = None


# ==================== DATABASE ====================

def get_db():
    """Get MongoDB database connection."""
    global db_client, db
    if db is None:
        db_client = MongoClient(MONGODB_URI)
        db = db_client[DATABASE_NAME]
    return db


def fetch_students_df():
    """Fetch student profiles from MongoDB and return as DataFrame."""
    database = get_db()
    students = list(database['students'].find({'isActive': True}))
    users = {u['_id']: u for u in database['users'].find()}

    rows = []
    for s in students:
        user = users.get(s.get('user'))
        if not user:
            continue
        rows.append({
            'student_id': str(s['_id']),
            'user_id': str(s['user']),
            'name': user.get('name', ''),
            'email': user.get('email', ''),
            'department': s.get('department', ''),
            'batch': s.get('batch', 0),
            'skills': ','.join(s.get('skills', [])),
            'projects': ','.join(s.get('projects', [])),
            'achievements': ','.join(s.get('achievements', [])),
            'bio': s.get('bio', ''),
            'verified': s.get('verified', False),
            'isActive': s.get('isActive', True),
        })

    return pd.DataFrame(rows) if rows else pd.DataFrame(columns=[
        'student_id', 'user_id', 'name', 'email', 'department',
        'batch', 'skills', 'projects', 'achievements', 'bio',
        'verified', 'isActive'
    ])


def fetch_alumni_df():
    """Fetch alumni profiles from MongoDB and return as DataFrame."""
    database = get_db()
    alumni = list(database['alumnis'].find({'isActive': True}))
    users = {u['_id']: u for u in database['users'].find()}

    rows = []
    for a in alumni:
        user = users.get(a.get('user'))
        if not user:
            continue
        rows.append({
            'alumni_id': str(a['_id']),
            'user_id': str(a['user']),
            'name': user.get('name', ''),
            'email': user.get('email', ''),
            'department': a.get('department', ''),
            'graduationYear': a.get('graduationYear', 0),
            'currentCompany': a.get('currentCompany', ''),
            'currentPosition': a.get('currentPosition', ''),
            'skills': ','.join(a.get('skills', [])),
            'achievements': ','.join(a.get('achievements', [])),
            'bio': a.get('bio', ''),
            'linkedin': a.get('linkedin', ''),
            'location': a.get('location', ''),
            'contact': a.get('contact', ''),
            'verified': a.get('verified', False),
            'isActive': a.get('isActive', True),
        })

    return pd.DataFrame(rows) if rows else pd.DataFrame(columns=[
        'alumni_id', 'user_id', 'name', 'email', 'department',
        'graduationYear', 'currentCompany', 'currentPosition',
        'skills', 'achievements', 'bio', 'linkedin', 'location',
        'contact', 'verified', 'isActive'
    ])


# ==================== MODEL ====================

def train_model_from_db():
    """Train the model using live MongoDB data."""
    global loaded_model

    students_df = fetch_students_df()
    alumni_df = fetch_alumni_df()

    if students_df.empty or alumni_df.empty:
        print("[WARN] Not enough data to train. Need both students and alumni.")
        loaded_model = None
        return None

    model = AlumniRecommendationModel()
    model.preprocess_data(students_df, alumni_df)
    model.compute_similarity_matrix()
    loaded_model = model

    print(f"[OK] Model trained with {len(students_df)} students and {len(alumni_df)} alumni")
    return model


def get_model():
    """Get the trained model, training if needed."""
    global loaded_model
    if loaded_model is None:
        train_model_from_db()
    return loaded_model


# ==================== HEALTH CHECK ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        database = get_db()
        student_count = database['students'].count_documents({'isActive': True})
        alumni_count = database['alumnis'].count_documents({'isActive': True})

        return jsonify({
            'status': 'healthy',
            'service': 'Alumni Recommendation System API',
            'database': 'connected',
            'data': {
                'students': student_count,
                'alumni': alumni_count,
            },
            'model_loaded': loaded_model is not None
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'degraded',
            'service': 'Alumni Recommendation System API',
            'error': str(e)
        }), 200


# ==================== RECOMMENDATION ENDPOINTS ====================

@app.route('/api/recommendations/alumni', methods=['POST'])
def get_alumni_recommendations():
    """
    Get recommended alumni for a student.

    POST body:
    {
        "student_id": "string" (MongoDB ObjectId of student profile),
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

        model = get_model()
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not trained. Need student and alumni data.'
            }), 503

        students_df = model.student_profiles
        alumni_df = model.alumni_profiles

        # Find student by student_id (MongoDB _id)
        student_row = students_df[students_df['student_id'] == student_id]
        if student_row.empty:
            return jsonify({'error': 'Student not found in model data'}), 404

        student_idx = student_row.index[0]

        # Get recommendations
        recommendations = model.get_recommendations(student_idx, limit, min_score)

        # Build response
        result = []
        for alumni_idx, score in recommendations:
            alumni = alumni_df.iloc[alumni_idx]

            if filter_dept and str(alumni.get('department', '')).lower() != filter_dept.lower():
                continue

            result.append({
                'alumni_id': str(alumni.get('alumni_id', '')),
                'user_id': str(alumni.get('user_id', '')),
                'name': str(alumni.get('name', '')),
                'email': str(alumni.get('email', '')),
                'department': str(alumni.get('department', '')),
                'graduationYear': int(alumni.get('graduationYear', 0)),
                'currentCompany': str(alumni.get('currentCompany', '')),
                'currentPosition': str(alumni.get('currentPosition', '')),
                'skills': [s.strip() for s in str(alumni.get('skills', '')).split(',') if s.strip()],
                'achievements': [a.strip() for a in str(alumni.get('achievements', '')).split(',') if a.strip()],
                'bio': str(alumni.get('bio', '')),
                'linkedIn': str(alumni.get('linkedin', '')),
                'location': str(alumni.get('location', '')),
                'recommendationScore': round(float(score) * 100, 2)
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


@app.route('/api/recommendations/analytics', methods=['POST'])
def get_recommendation_analytics():
    """Get analytics about recommendations for a student."""
    try:
        data = request.get_json()
        student_id = data.get('student_id')

        if not student_id:
            return jsonify({'error': 'student_id is required'}), 400

        model = get_model()
        if model is None:
            return jsonify({'error': 'Model not trained'}), 503

        students_df = model.student_profiles
        alumni_df = model.alumni_profiles

        student_row = students_df[students_df['student_id'] == student_id]
        if student_row.empty:
            return jsonify({'error': 'Student not found'}), 404

        student_idx = student_row.index[0]
        all_recommendations = model.get_recommendations(student_idx, len(alumni_df))

        scores = [score for _, score in all_recommendations]
        dept_breakdown = {}
        for alumni_idx, _ in all_recommendations:
            dept = str(alumni_df.iloc[alumni_idx].get('department', 'Unknown'))
            dept_breakdown[dept] = dept_breakdown.get(dept, 0) + 1

        return jsonify({
            'success': True,
            'analytics': {
                'totalRecommendations': len(all_recommendations),
                'averageScore': round(float(np.mean(scores)) * 100, 2) if scores else 0,
                'maxScore': round(float(max(scores)) * 100, 2) if scores else 0,
                'minScore': round(float(min(scores)) * 100, 2) if scores else 0,
                'departmentBreakdown': dept_breakdown
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


@app.route('/api/recommendations/similar-alumni', methods=['GET'])
def get_similar_alumni():
    """Get similar alumni for networking."""
    try:
        alumni_id = request.args.get('alumni_id')
        limit = int(request.args.get('limit', 10))

        if not alumni_id:
            return jsonify({'error': 'alumni_id query parameter is required'}), 400

        model = get_model()
        if model is None:
            return jsonify({'error': 'Model not trained'}), 503

        alumni_df = model.alumni_profiles
        alumni_row = alumni_df[alumni_df['alumni_id'] == alumni_id]
        if alumni_row.empty:
            return jsonify({'error': 'Alumni not found'}), 404

        alumni_idx = alumni_row.index[0]
        similar = model.get_similar_alumni(alumni_idx, limit)

        result = []
        for similar_idx, score in similar:
            s = alumni_df.iloc[similar_idx]
            result.append({
                'alumni_id': str(s.get('alumni_id', '')),
                'name': str(s.get('name', '')),
                'department': str(s.get('department', '')),
                'currentCompany': str(s.get('currentCompany', '')),
                'similarityScore': round(float(score) * 100, 2)
            })

        return jsonify({
            'success': True,
            'count': len(result),
            'similarAlumni': result
        }), 200

    except Exception as e:
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


# ==================== MODEL MANAGEMENT ====================

@app.route('/api/model/stats', methods=['GET'])
def get_model_stats():
    """Get model statistics."""
    try:
        model = get_model()
        if model is None:
            return jsonify({'error': 'Model not trained'}), 503

        return jsonify({
            'success': True,
            'stats': {
                'students': len(model.student_profiles),
                'alumni': len(model.alumni_profiles),
                'similarity_matrix_shape': list(model.similarity_matrix.shape) if model.similarity_matrix is not None else None,
                'model_loaded': True
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/retrain', methods=['POST'])
def retrain_model():
    """Retrain model from fresh MongoDB data."""
    try:
        global loaded_model
        loaded_model = None
        model = train_model_from_db()

        if model is None:
            return jsonify({
                'success': False,
                'message': 'Not enough data to train. Need both students and alumni.'
            }), 503

        return jsonify({
            'success': True,
            'message': 'Model retrained successfully from MongoDB data',
            'stats': {
                'students': len(model.student_profiles),
                'alumni': len(model.alumni_profiles),
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("Alumni Recommendation ML Service")
    print("=" * 50)

    # Connect to DB
    try:
        database = get_db()
        database.client.server_info()
        print(f"[OK] Connected to MongoDB: {DATABASE_NAME}")
    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")

    # Try to train model on startup
    try:
        train_model_from_db()
    except Exception as e:
        print(f"[WARN] Could not train model on startup: {e}")
        print("  Model will train when data is available and first request comes in.")

    # Run Flask app
    port = int(os.getenv('API_PORT', 5000))
    print(f"\n[OK] Starting Flask API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
