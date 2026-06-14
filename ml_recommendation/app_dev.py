# Development Flask API with Mock Mode Support
# Run with: python app_dev.py
# Can work with or without trained model

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import traceback
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Mode configuration
USE_MOCK_MODE = os.getenv('USE_MOCK_MODE', 'True').lower() == 'true'
REAL_API_MODE = not USE_MOCK_MODE

# Import service based on mode
if USE_MOCK_MODE:
    from mock_service import get_mock_service
    mock_service = get_mock_service()
    print("✓ Mock Mode: Using simulated data")
else:
    try:
        from models import AlumniRecommendationModel
        import pandas as pd
        loaded_model = None
        student_profiles = None
        alumni_profiles = None
        print("✓ Real Mode: Using trained model")
    except Exception as e:
        print(f"✗ Could not load real model: {e}")
        print("✓ Falling back to Mock Mode")
        USE_MOCK_MODE = True
        from mock_service import get_mock_service
        mock_service = get_mock_service()


# ==================== UTILITY FUNCTIONS ====================

def ensure_model_loaded():
    """Load real model if using real mode"""
    global loaded_model, student_profiles, alumni_profiles
    
    if USE_MOCK_MODE:
        return True
    
    if loaded_model is not None:
        return True
    
    try:
        model = AlumniRecommendationModel()
        model.load_model('./models/alumni_recommendation_model.pkl')
        loaded_model = model
        
        student_profiles = pd.read_csv('./data/students.csv')
        alumni_profiles = pd.read_csv('./data/alumni.csv')
        
        return True
    except Exception as e:
        print(f"Warning: Could not load real model: {e}")
        return False


# ==================== HEALTH CHECK ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Alumni Recommendation System API (Development)',
        'mode': 'mock' if USE_MOCK_MODE else 'production',
        'timestamp': __import__('datetime').datetime.now().isoformat()
    }), 200


# ==================== RECOMMENDATION ENDPOINTS ====================

@app.route('/api/recommendations/alumni', methods=['POST'])
def get_alumni_recommendations():
    """
    Get recommended alumni for a student
    
    Works in both MOCK and REAL modes
    """
    try:
        data = request.get_json()
        student_id = data.get('student_id', 'MOCK_STU_00001')
        limit = int(data.get('limit', 10))
        min_score = float(data.get('min_score', 0))
        filter_dept = data.get('filter_department')
        
        # MOCK MODE
        if USE_MOCK_MODE:
            # Default department for mock data
            student_dept = filter_dept or 'Computer Science and Engineering'
            result = mock_service.get_mock_recommendations(
                student_id, student_dept, limit, min_score
            )
            return jsonify(result), 200
        
        # REAL MODE
        if not ensure_model_loaded():
            # Fallback to mock if model fails
            student_dept = filter_dept or 'Computer Science and Engineering'
            result = mock_service.get_mock_recommendations(
                student_id, student_dept, limit, min_score
            )
            return jsonify(result), 200
        
        # Find student in database
        student_row = student_profiles[student_profiles['student_id'] == student_id]
        if student_row.empty:
            return jsonify({'error': 'Student not found'}), 404
        
        student_idx = student_row.index[0]
        recommendations = loaded_model.get_recommendations(student_idx, limit, min_score)
        
        # Build response
        result = []
        for alumni_idx, score in recommendations:
            alumni = alumni_profiles.iloc[alumni_idx]
            
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
                'recommendationScore': round(float(score) * 100, 2)
            })
        
        return jsonify({
            'success': True,
            'count': len(result),
            'recommendations': result,
            'mode': 'production'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/recommendations/analytics', methods=['POST'])
def get_recommendation_analytics():
    """Get analytics (works in both modes)"""
    try:
        data = request.get_json()
        student_id = data.get('student_id', 'MOCK_STU_00001')
        
        if USE_MOCK_MODE:
            result = mock_service.get_mock_analytics(student_id)
            return jsonify(result), 200
        
        if ensure_model_loaded():
            # Real analytics
            student_row = student_profiles[student_profiles['student_id'] == student_id]
            if not student_row.empty:
                student_idx = student_row.index[0]
                all_recommendations = loaded_model.get_recommendations(student_idx, len(alumni_profiles))
                scores = [score for _, score in all_recommendations]
                
                return jsonify({
                    'success': True,
                    'analytics': {
                        'totalRecommendations': len(all_recommendations),
                        'averageScore': round(sum(scores) / len(scores) * 100, 2) if scores else 0,
                        'maxScore': round(max(scores) * 100, 2) if scores else 0,
                        'minScore': round(min(scores) * 100, 2) if scores else 0,
                        'mode': 'production'
                    }
                }), 200
        
        # Fallback to mock
        result = mock_service.get_mock_analytics(student_id)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations/alumni/<alumni_id>/detail', methods=['GET'])
def get_recommendation_detail(alumni_id):
    """Get detailed recommendation"""
    try:
        student_id = request.args.get('student_id', 'MOCK_STU_00001')
        
        if USE_MOCK_MODE:
            result = mock_service.get_mock_detail(alumni_id, 'Computer Science and Engineering')
            return jsonify(result), 200
        
        if ensure_model_loaded():
            # Real detail
            return jsonify({
                'success': True,
                'detail': {'message': 'Real recommendation detail'},
                'mode': 'production'
            }), 200
        
        # Fallback to mock
        result = mock_service.get_mock_detail(alumni_id, 'Computer Science and Engineering')
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations/similar-alumni', methods=['GET'])
def get_similar_alumni():
    """Get similar alumni"""
    try:
        alumni_id = request.args.get('alumni_id')
        limit = int(request.args.get('limit', 10))
        
        if USE_MOCK_MODE:
            # Generate mock similar alumni
            similar_alumni = []
            for i in range(limit):
                similar_alumni.append({
                    'alumni_id': f'MOCK_ALM_{i+1:05d}',
                    'name': f'Similar Alumni {i+1}',
                    'department': 'Computer Science and Engineering',
                    'currentCompany': 'Tech Company',
                    'similarityScore': round(random.uniform(70, 95), 1)
                })
            
            return jsonify({
                'success': True,
                'count': len(similar_alumni),
                'similarAlumni': similar_alumni,
                'mode': 'mock'
            }), 200
        
        return jsonify({'success': False, 'message': 'Feature not available'}), 501
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== MODEL MANAGEMENT ====================

@app.route('/api/model/stats', methods=['GET'])
def get_model_stats():
    """Get model statistics"""
    try:
        if USE_MOCK_MODE:
            return jsonify({
                'success': True,
                'stats': {
                    'mode': 'mock',
                    'message': 'Using mock data. Train model with real data for production stats.',
                    'timestamp': __import__('datetime').datetime.now().isoformat()
                }
            }), 200
        
        if ensure_model_loaded():
            stats_path = './models/alumni_recommendation_model_stats.json'
            if os.path.exists(stats_path):
                with open(stats_path, 'r') as f:
                    stats = json.load(f)
                    stats['mode'] = 'production'
                    return jsonify({'success': True, 'stats': stats}), 200
        
        return jsonify({
            'success': False,
            'message': 'Model statistics not available'
        }), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/train', methods=['POST'])
def train_model():
    """
    Endpoint to train the model with real data
    Requires: MongoDB connection with student and alumni data
    """
    try:
        from train import ModelTrainer
        
        trainer = ModelTrainer(model_type='hybrid')
        trainer.run_complete_pipeline(
            model_name='alumni_recommendation_model',
            use_local_files=False,  # Use MongoDB
            evaluate=False
        )
        
        return jsonify({
            'success': True,
            'message': 'Model training completed successfully',
            'timestamp': __import__('datetime').datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Model training failed. Ensure MongoDB is running and has student/alumni data.'
        }), 500


# ==================== MODE MANAGEMENT ====================

@app.route('/api/mode', methods=['GET'])
def get_mode():
    """Get current API mode"""
    return jsonify({
        'mode': 'mock' if USE_MOCK_MODE else 'production',
        'description': 'Mock mode uses simulated data for development. Production mode uses trained ML model.',
        'model_available': os.path.exists('./models/alumni_recommendation_model.pkl')
    }), 200


@app.route('/api/mode/switch', methods=['POST'])
def switch_mode():
    """
    Switch between mock and production mode
    POST body: {"mode": "mock" or "production"}
    """
    try:
        global USE_MOCK_MODE
        
        data = request.get_json()
        requested_mode = data.get('mode', 'mock').lower()
        
        if requested_mode == 'mock':
            USE_MOCK_MODE = True
            return jsonify({
                'success': True,
                'mode': 'mock',
                'message': 'Switched to mock mode'
            }), 200
        
        elif requested_mode == 'production':
            if not os.path.exists('./models/alumni_recommendation_model.pkl'):
                return jsonify({
                    'success': False,
                    'message': 'Trained model not found. Train the model first or use mock mode.'
                }), 400
            
            if ensure_model_loaded():
                USE_MOCK_MODE = False
                return jsonify({
                    'success': True,
                    'mode': 'production',
                    'message': 'Switched to production mode'
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to load production model'
                }), 500
        
        return jsonify({
            'success': False,
            'message': 'Invalid mode. Use "mock" or "production"'
        }), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    import random
    
    print("\n" + "="*80)
    print("Alumni Recommendation API - Development Mode")
    print("="*80)
    print(f"\nAPI Mode: {'MOCK (Development)' if USE_MOCK_MODE else 'PRODUCTION (Real Model)'}")
    print("\nEndpoints:")
    print("  GET  /health                                 - Health check")
    print("  POST /api/recommendations/alumni              - Get recommendations")
    print("  POST /api/recommendations/analytics           - Get analytics")
    print("  GET  /api/recommendations/alumni/:id/detail  - Recommendation details")
    print("  GET  /api/model/stats                        - Model statistics")
    print("  GET  /api/mode                               - Current mode")
    print("  POST /api/mode/switch                        - Switch between modes")
    print("  POST /api/model/train                        - Train model (when ready)")
    print("\nDocumentation:")
    print("  See QUICKSTART.md or README.md for more info")
    print("="*80 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
