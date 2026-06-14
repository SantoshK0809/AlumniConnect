# Production-Ready Flask API
# Fully dynamic configuration, model versioning, admin endpoints, monitoring

import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional
from functools import wraps
import traceback

from flask import Flask, jsonify, request, render_template_string
from dotenv import load_dotenv
from pymongo import MongoClient

from config_manager import ConfigurationManager
from db_schemas import DatabaseSchemas
from models_production import HybridRecommendationModel
from mock_service_production import ProductionMockService

load_dotenv()

# ============================================
# INITIALIZATION
# ============================================

app = Flask(__name__)

# Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'aluminiconnect')
API_MODE = os.getenv('API_MODE', 'auto')  # 'auto', 'mock', 'production'
API_PORT = int(os.getenv('API_PORT', 5000))
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
DEBUG_MODE = os.getenv('DEBUG_MODE', 'False').lower() == 'true'

# Setup logging
logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger(__name__)

# Global instances
config_manager = None
mock_service = None
production_model = None
current_mode = None
db = None

# ============================================
# INITIALIZATION FUNCTIONS
# ============================================

def init_database():
    """Initialize database connection and schemas"""
    global config_manager, db
    
    try:
        config_manager = ConfigurationManager(MONGODB_URI, DATABASE_NAME)
        if not config_manager.connect():
            logger.error("✗ Database connection failed")
            return False
        
        db = config_manager.db
        
        # Create indexes
        DatabaseSchemas.create_all_indexes(db)
        
        logger.info("✓ Database initialized")
        return True
        
    except Exception as e:
        logger.error(f"✗ Database initialization failed: {e}")
        return False

def init_api_mode():
    """Initialize API mode and services"""
    global current_mode, mock_service, production_model
    
    try:
        # Check if trained model exists
        active_model = config_manager.get_active_model()
        
        if API_MODE == 'mock':
            current_mode = 'mock'
        elif API_MODE == 'production' and active_model:
            current_mode = 'production'
        elif API_MODE == 'auto':
            # Auto-detect based on model presence
            current_mode = 'production' if active_model else 'mock'
        else:
            current_mode = 'mock'
        
        # Initialize mock service
        mock_service = ProductionMockService(config_manager)
        logger.info(f"✓ Mock service initialized")
        
        # Try to load production model if mode allows
        if current_mode == 'production' and active_model:
            try:
                production_model = HybridRecommendationModel(config_manager)
                logger.info(f"✓ Production model loaded (v{active_model.get('version')})")
            except Exception as e:
                logger.warning(f"⚠ Production model failed to load: {e}")
                logger.info("  Falling back to mock mode")
                current_mode = 'mock'
        
        logger.info(f"✓ API initialized in {current_mode.upper()} mode")
        return True
        
    except Exception as e:
        logger.error(f"✗ API initialization failed: {e}")
        return False

# ============================================
# DECORATORS
# ============================================

def require_api_key(f):
    """Decorator to validate API key"""
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'success': False, 'error': 'Missing X-API-Key header'}), 401
        
        # Validate API key from database
        try:
            key_doc = config_manager.db['api_keys'].find_one({'api_key': api_key, 'enabled': True})
            if not key_doc:
                return jsonify({'success': False, 'error': 'Invalid API key'}), 401
        except:
            pass
        
        return f(*args, **kwargs)
    
    return decorated

def require_admin_key(f):
    """Decorator to require admin authorization"""
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'success': False, 'error': 'Missing X-API-Key header'}), 401
        
        try:
            key_doc = config_manager.db['api_keys'].find_one({
                'api_key': api_key,
                'enabled': True,
                'scope': {'$in': ['admin:write', 'admin:*']}
            })
            
            if not key_doc:
                return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        except:
            return jsonify({'success': False, 'error': 'Authorization failed'}), 403
        
        return f(*args, **kwargs)
    
    return decorated

def handle_errors(f):
    """Decorator to handle errors uniformly"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"✗ Error in {f.__name__}: {e}")
            logger.error(traceback.format_exc())
            return jsonify({
                'success': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }), 500
    
    return decorated

# ============================================
# HEALTH & STATUS ENDPOINTS
# ============================================

@app.route('/health', methods=['GET'])
@handle_errors
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'operational',
        'mode': current_mode,
        'timestamp': datetime.utcnow().isoformat(),
        'version': '2.0.0-production'
    })

@app.route('/status', methods=['GET'])
@handle_errors
def status():
    """Detailed system status"""
    try:
        latest_metrics = config_manager.get_latest_metrics()
        active_model = config_manager.get_active_model()
        
        return jsonify({
            'success': True,
            'mode': current_mode,
            'model': {
                'active_version': active_model.get('version') if active_model else None,
                'model_type': active_model.get('model_type') if active_model else 'none',
                'status': active_model.get('status') if active_model else 'not_loaded',
                'trained_at': active_model.get('trained_at') if active_model else None,
            },
            'config': {
                'loaded': config_manager is not None,
                'cache_ttl': config_manager.cache_ttl if config_manager else None,
            },
            'api': {
                'pool_status': mock_service.get_stats() if mock_service else None,
            },
            'metrics': latest_metrics,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"⚠ Status check error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================
# RECOMMENDATION ENDPOINTS
# ============================================

@app.route('/api/recommendations/alumni', methods=['POST'])
@require_api_key
@handle_errors
def get_recommendations():
    """Get alumni recommendations for a student"""
    data = request.get_json() or {}
    
    student_id = data.get('student_id')
    student_dept = data.get('department', 'Computer Science and Engineering')
    limit = data.get('limit', 10)
    min_score = data.get('min_score', 0.0)
    
    if not student_id:
        return jsonify({'success': False, 'error': 'student_id is required'}), 400
    
    # Get recommendations based on current mode
    if current_mode == 'mock':
        result = mock_service.get_mock_recommendations(
            student_id=student_id,
            student_dept=student_dept,
            limit=limit,
            min_score=min_score
        )
    else:
        # Production mode using trained model
        student_profile = {
            'student_id': student_id,
            'department': student_dept
        }
        
        recommendations = production_model.get_recommendations(student_profile, limit)
        
        result = {
            'success': True,
            'student_id': student_id,
            'count': len(recommendations),
            'recommendations': recommendations,
            'mode': 'production',
            'timestamp': datetime.utcnow().isoformat()
        }
    
    # Record metrics
    try:
        config_manager.record_metrics({
            'recommendation_requests': 1,
            'endpoint': 'get_recommendations',
            'mode': current_mode,
            'student_dept': student_dept
        })
    except:
        pass
    
    return jsonify(result)

@app.route('/api/recommendations/analytics', methods=['POST'])
@require_api_key
@handle_errors
def get_analytics():
    """Get analytics for a student"""
    data = request.get_json() or {}
    student_id = data.get('student_id')
    
    if current_mode == 'mock':
        result = mock_service.get_mock_analytics(student_id)
    else:
        result = {
            'success': True,
            'student_id': student_id,
            'mode': 'production',
            'analytics': {
                'timestamp': datetime.utcnow().isoformat()
            }
        }
    
    return jsonify(result)

# ============================================
# CONFIGURATION ADMIN ENDPOINTS
# ============================================

@app.route('/api/admin/config', methods=['GET'])
@require_admin_key
@handle_errors
def get_config():
    """Get current configuration"""
    config = config_manager.get_global_config(force_refresh=True)
    
    return jsonify({
        'success': True,
        'config': config,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/admin/config', methods=['PUT'])
@require_admin_key
@handle_errors
def update_config():
    """Update configuration"""
    data = request.get_json() or {}
    user_id = request.headers.get('X-User-Id', 'admin')
    reason = data.get('reason', 'Configuration update')
    
    updates = data.get('config', {})
    
    if not updates:
        return jsonify({'success': False, 'error': 'No configuration provided'}), 400
    
    success = config_manager.update_global_config(updates, user_id, reason)
    
    return jsonify({
        'success': success,
        'message': 'Configuration updated' if success else 'Update failed',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/admin/weights', methods=['GET'])
@require_admin_key
@handle_errors
def get_weights():
    """Get scoring weights"""
    department = request.args.get('department')
    weights = config_manager.get_scoring_weights(department)
    
    return jsonify({
        'success': True,
        'weights': weights,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/admin/weights', methods=['PUT'])
@require_admin_key
@handle_errors
def update_weights():
    """Update scoring weights"""
    data = request.get_json() or {}
    user_id = request.headers.get('X-User-Id', 'admin')
    department = data.get('department')
    weights = data.get('weights', {})
    reason = data.get('reason', 'Weights update')
    
    success = config_manager.set_scoring_weights(weights, department, user_id, reason)
    
    return jsonify({
        'success': success,
        'message': 'Weights updated' if success else 'Update failed',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/admin/skills', methods=['GET'])
@require_admin_key
@handle_errors
def get_skills():
    """Get all skills"""
    category = request.args.get('category')
    skills = config_manager.get_skills(category=category)
    
    return jsonify({
        'success': True,
        'count': len(skills),
        'skills': skills,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/admin/skills', methods=['POST'])
@require_admin_key
@handle_errors
def add_skill():
    """Add a new skill"""
    data = request.get_json() or {}
    user_id = request.headers.get('X-User-Id', 'admin')
    
    skill_name = data.get('skill_name')
    category = data.get('category')
    
    if not skill_name or not category:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    success = config_manager.add_skill(skill_name, category, user_id=user_id)
    
    return jsonify({
        'success': success,
        'message': f'Skill {skill_name} added' if success else 'Add failed',
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================
# MODEL MANAGEMENT
# ============================================

@app.route('/api/admin/models', methods=['GET'])
@require_admin_key
@handle_errors
def get_models():
    """Get all model versions"""
    models = config_manager.get_model_versions()
    
    return jsonify({
        'success': True,
        'count': len(models),
        'models': models,
        'active_version': current_mode == 'production',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/admin/models/activate', methods=['POST'])
@require_admin_key
@handle_errors
def activate_model():
    """Activate a specific model version"""
    data = request.get_json() or {}
    user_id = request.headers.get('X-User-Id', 'admin')
    version = data.get('version')
    
    if version is None:
        return jsonify({'success': False, 'error': 'version is required'}), 400
    
    success = config_manager.activate_model_version(version, user_id)
    
    if success:
        # Restart API in appropriate mode
        global current_mode
        current_mode = 'production'
    
    return jsonify({
        'success': success,
        'message': f'Model v{version} activated' if success else 'Activation failed',
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================
# API MODE CONTROL
# ============================================

@app.route('/api/admin/mode', methods=['GET'])
@require_admin_key
@handle_errors
def get_mode():
    """Get current API mode"""
    return jsonify({
        'success': True,
        'mode': current_mode,
        'available_modes': ['mock', 'production'],
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/admin/mode', methods=['POST'])
@require_admin_key
@handle_errors
def set_mode():
    """Switch API mode"""
    global current_mode
    data = request.get_json() or {}
    mode = data.get('mode')
    user_id = request.headers.get('X-User-Id', 'admin')
    
    if mode not in ['mock', 'production']:
        return jsonify({'success': False, 'error': 'Invalid mode'}), 400
    
    old_mode = current_mode
    current_mode = mode
    
    try:
        config_manager._log_audit(
            action='SWITCH_MODE',
            user_id=user_id,
            resource='api_mode',
            resource_id='global',
            changes={'old_mode': old_mode, 'new_mode': mode},
            reason=data.get('reason', 'Mode switch')
        )
    except:
        pass
    
    return jsonify({
        'success': True,
        'message': f'Switched from {old_mode} to {mode}',
        'mode': current_mode,
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================
# AUDIT & MONITORING
# ============================================

@app.route('/api/admin/audit', methods=['GET'])
@require_admin_key
@handle_errors
def get_audit_logs():
    """Get audit logs"""
    action = request.args.get('action')
    limit = int(request.args.get('limit', 50))
    
    logs = config_manager.get_audit_logs(action=action, limit=limit)
    
    return jsonify({
        'success': True,
        'count': len(logs),
        'logs': logs,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/admin/metrics', methods=['GET'])
@require_admin_key
@handle_errors
def get_metrics():
    """Get system metrics"""
    metrics = config_manager.get_latest_metrics()
    
    return jsonify({
        'success': True,
        'metrics': metrics,
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'timestamp': datetime.utcnow().isoformat()
    }), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    logger.error(f"✗ Server error: {error}")
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'timestamp': datetime.utcnow().isoformat()
    }), 500

# ============================================
# STARTUP & SHUTDOWN
# ============================================

@app.before_first_request
def startup():
    """Initialize on first request"""
    if not init_database():
        logger.error("✗ Failed to initialize database")
        raise RuntimeError("Database initialization failed")
    
    if not init_api_mode():
        logger.error("✗ Failed to initialize API mode")
        raise RuntimeError("API initialization failed")

@app.teardown_appcontext
def shutdown(error=None):
    """Cleanup on shutdown"""
    if error:
        logger.error(f"⚠ Shutdown error: {error}")
    
    if config_manager:
        config_manager.disconnect()

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("AlumniConnect - Production Recommendation API")
    logger.info("=" * 60)
    logger.info(f"Version: 2.0.0 (Production)")
    logger.info(f"Mode: {API_MODE}")
    logger.info(f"Debug: {DEBUG_MODE}")
    logger.info(f"Database: {MONGODB_URI}")
    logger.info("=" * 60)
    
    app.run(
        host='0.0.0.0',
        port=API_PORT,
        debug=DEBUG_MODE,
        threaded=True
    )
