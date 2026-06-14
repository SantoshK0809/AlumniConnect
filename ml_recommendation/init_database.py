# Database Initialization Script
# Initializes MongoDB with all collections, indexes, and initial configuration

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import json

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'aluminiconnect')

def initialize_database():
    """Initialize MongoDB database with all necessary collections and indexes"""
    
    print("=" * 70)
    print("AlumniConnect - Database Initialization Script")
    print("=" * 70)
    print(f"\nMongoDB URI: {MONGODB_URI}")
    print(f"Database: {DATABASE_NAME}\n")
    
    try:
        # Connect to MongoDB
        print("✓ Connecting to MongoDB...")
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        client.server_info()  # Test connection
        db = client[DATABASE_NAME]
        print("✓ Connected successfully\n")
        
        # =======================================
        # 1. GLOBAL CONFIGURATION
        # =======================================
        print("Creating 'recommendation_config' collection...")
        db['recommendation_config'].delete_many({})  # Clear existing
        
        global_config = {
            '_id': 'global_config',
            'system': {
                'model_type': 'hybrid',
                'batch_size': 32,
                'cache_enabled': True,
                'cache_ttl': 3600,
                'log_level': 'INFO',
                'debug_mode': False,
                'content_weight': 0.7,
                'collaborative_weight': 0.3,
            },
            'api': {
                'default_limit': 10,
                'max_limit': 50,
                'min_similarity_score': 0.0,
                'timeout': 30,
                'retry_attempts': 3,
            },
            'data_quality': {
                'min_profile_completeness': 0.5,
                'require_verified': False,
                'require_active': True,
                'min_skills_per_profile': 1,
                'max_skills_per_profile': 20,
                'min_achievements_per_profile': 0,
                'max_achievements_per_profile': 15,
            },
            'performance': {
                'max_recommendations': 100,
                'similarity_threshold': 0.5,
                'enable_vectorization': True,
                'worker_threads': 4,
            },
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'updated_by': 'system'
        }
        
        db['recommendation_config'].insert_one(global_config)
        db['recommendation_config'].create_index([('_id', 1)])
        print("  ✓ Global configuration created\n")
        
        # =======================================
        # 2. SCORING WEIGHTS
        # =======================================
        print("Creating 'scoring_weights' collection...")
        db['scoring_weights'].delete_many({})
        
        global_weights = {
            '_id': 'weights_global',
            'scope': 'global',
            'weights': {
                'department': 0.35,
                'skills': 0.25,
                'experience': 0.20,
                'achievements': 0.10,
                'activity': 0.10,
            },
            'experience_thresholds': {
                'ideal_min': 2,
                'ideal_max': 8,
                'acceptable_min': 1,
                'acceptable_max': 10,
            },
            'min_score': 0.0,
            'max_score': 100.0,
            'enabled': True,
            'version': 1,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'updated_by': 'system',
            'notes': 'Default production weights',
        }
        
        db['scoring_weights'].insert_many([global_weights])
        db['scoring_weights'].create_index([('scope', 1)])
        db['scoring_weights'].create_index([('updated_at', -1)])
        print("  ✓ Scoring weights created\n")
        
        # =======================================
        # 3. DEPARTMENTS
        # =======================================
        print("Creating 'department_mappings' collection...")
        db['department_mappings'].delete_many({})
        
        departments_data = [
            {
                'department': 'Computer Science and Engineering',
                'related_departments': ['Information Technology', 'Artificial Intelligence and Data Science'],
                'similarity_score': 0.8,
                'aliases': ['CSE', 'CS', 'Computer Science'],
                'priority': 1,
                'enabled': True,
            },
            {
                'department': 'Information Technology',
                'related_departments': ['Computer Science and Engineering', 'Artificial Intelligence and Data Science'],
                'similarity_score': 0.8,
                'aliases': ['IT'],
                'priority': 1,
                'enabled': True,
            },
            {
                'department': 'Artificial Intelligence and Data Science',
                'related_departments': ['Computer Science and Engineering', 'Information Technology'],
                'similarity_score': 0.8,
                'aliases': ['AI', 'DS', 'AI/DS'],
                'priority': 1,
                'enabled': True,
            },
            {
                'department': 'Electronics and Telecommunication',
                'related_departments': ['Electrical Engineering', 'Instrumentation Engineering'],
                'similarity_score': 0.7,
                'aliases': ['E&TC'],
                'priority': 2,
                'enabled': True,
            },
            {
                'department': 'Electrical Engineering',
                'related_departments': ['Electronics and Telecommunication', 'Instrumentation Engineering'],
                'similarity_score': 0.7,
                'aliases': ['EE'],
                'priority': 2,
                'enabled': True,
            },
            {
                'department': 'Instrumentation Engineering',
                'related_departments': ['Electrical Engineering', 'Electronics and Telecommunication'],
                'similarity_score': 0.7,
                'aliases': [],
                'priority': 2,
                'enabled': True,
            },
            {
                'department': 'Mechanical Engineering',
                'related_departments': ['Civil Engineering', 'Chemical Engineering'],
                'similarity_score': 0.6,
                'aliases': ['Mech', 'ME'],
                'priority': 3,
                'enabled': True,
            },
            {
                'department': 'Civil Engineering',
                'related_departments': ['Mechanical Engineering', 'Chemical Engineering'],
                'similarity_score': 0.6,
                'aliases': ['CE'],
                'priority': 3,
                'enabled': True,
            },
            {
                'department': 'Chemical Engineering',
                'related_departments': ['Civil Engineering', 'Mechanical Engineering'],
                'similarity_score': 0.6,
                'aliases': ['Chem'],
                'priority': 3,
                'enabled': True,
            },
        ]
        
        for dept in departments_data:
            dept['_id'] = f"dept_{dept['department']}"
            dept['created_at'] = datetime.utcnow()
            dept['updated_at'] = datetime.utcnow()
            dept['updated_by'] = 'system'
        
        db['department_mappings'].insert_many(departments_data)
        db['department_mappings'].create_index([('department', 1)])
        db['department_mappings'].create_index([('priority', 1)])
        print("  ✓ Departments created\n")
        
        # =======================================
        # 4. SKILLS POOL
        # =======================================
        print("Creating 'skills_pool' collection...")
        db['skills_pool'].delete_many({})
        
        skills_data = [
            {'skill_name': 'Python', 'category': 'Programming Language', 'popularity_score': 95, 'weight': 1.0},
            {'skill_name': 'Java', 'category': 'Programming Language', 'popularity_score': 90, 'weight': 1.0},
            {'skill_name': 'JavaScript', 'category': 'Programming Language', 'popularity_score': 92, 'weight': 1.0},
            {'skill_name': 'TypeScript', 'category': 'Programming Language', 'popularity_score': 85, 'weight': 0.9},
            {'skill_name': 'C++', 'category': 'Programming Language', 'popularity_score': 80, 'weight': 0.9},
            {'skill_name': 'React', 'category': 'Frontend Framework', 'popularity_score': 93, 'weight': 1.0},
            {'skill_name': 'Angular', 'category': 'Frontend Framework', 'popularity_score': 75, 'weight': 0.8},
            {'skill_name': 'Vue.js', 'category': 'Frontend Framework', 'popularity_score': 70, 'weight': 0.7},
            {'skill_name': 'Node.js', 'category': 'Runtime Environment', 'popularity_score': 88, 'weight': 1.0},
            {'skill_name': 'Express.js', 'category': 'Backend Framework', 'popularity_score': 85, 'weight': 0.9},
            {'skill_name': 'Django', 'category': 'Backend Framework', 'popularity_score': 80, 'weight': 0.9},
            {'skill_name': 'Spring Boot', 'category': 'Backend Framework', 'popularity_score': 82, 'weight': 0.95},
            {'skill_name': 'MongoDB', 'category': 'Database', 'popularity_score': 85, 'weight': 0.9},
            {'skill_name': 'PostgreSQL', 'category': 'Database', 'popularity_score': 87, 'weight': 0.95},
            {'skill_name': 'MySQL', 'category': 'Database', 'popularity_score': 80, 'weight': 0.8},
            {'skill_name': 'AWS', 'category': 'Cloud Platform', 'popularity_score': 92, 'weight': 1.0},
            {'skill_name': 'Azure', 'category': 'Cloud Platform', 'popularity_score': 85, 'weight': 0.95},
            {'skill_name': 'GCP', 'category': 'Cloud Platform', 'popularity_score': 80, 'weight': 0.9},
            {'skill_name': 'Docker', 'category': 'DevOps', 'popularity_score': 90, 'weight': 1.0},
            {'skill_name': 'Kubernetes', 'category': 'DevOps', 'popularity_score': 80, 'weight': 0.9},
            {'skill_name': 'Machine Learning', 'category': 'AI/ML', 'popularity_score': 88, 'weight': 1.0},
            {'skill_name': 'Deep Learning', 'category': 'AI/ML', 'popularity_score': 82, 'weight': 0.95},
            {'skill_name': 'Data Analysis', 'category': 'Data Science', 'popularity_score': 85, 'weight': 0.9},
            {'skill_name': 'REST APIs', 'category': 'API Design', 'popularity_score': 90, 'weight': 1.0},
            {'skill_name': 'GraphQL', 'category': 'API Design', 'popularity_score': 75, 'weight': 0.8},
            {'skill_name': 'Git', 'category': 'Version Control', 'popularity_score': 98, 'weight': 1.0},
            {'skill_name': 'Linux', 'category': 'Operating System', 'popularity_score': 88, 'weight': 0.95},
            {'skill_name': 'Agile', 'category': 'Methodology', 'popularity_score': 85, 'weight': 0.8},
            {'skill_name': 'Scrum', 'category': 'Methodology', 'popularity_score': 80, 'weight': 0.8},
        ]
        
        for skill in skills_data:
            skill['_id'] = f"skill_{skill['skill_name']}"
            skill['enabled'] = True
            skill['demand_level'] = 'High' if skill['popularity_score'] > 85 else 'Medium'
            skill['created_at'] = datetime.utcnow()
            skill['updated_at'] = datetime.utcnow()
        
        db['skills_pool'].insert_many(skills_data)
        db['skills_pool'].create_index([('skill_name', 1)])
        db['skills_pool'].create_index([('category', 1)])
        db['skills_pool'].create_index([('popularity_score', -1)])
        print(f"  ✓ {len(skills_data)} skills created\n")
        
        # =======================================
        # 5. MODEL VERSIONS
        # =======================================
        print("Creating 'model_versions' collection...")
        db['model_versions'].delete_many({})
        db['model_versions'].create_index([('version', -1)])
        db['model_versions'].create_index([('status', 1)])
        db['model_versions'].create_index([('created_at', -1)])
        print("  ✓ Model versions collection created\n")
        
        # =======================================
        # 6. RECOMMENDATION CACHE
        # =======================================
        print("Creating 'recommendation_cache' collection...")
        db['recommendation_cache'].delete_many({})
        db['recommendation_cache'].create_index([('student_id', 1)])
        # TTL index that auto-expires documents after 3600 seconds
        db['recommendation_cache'].create_index([('expires_at', 1)], expireAfterSeconds=0)
        print("  ✓ Recommendation cache created\n")
        
        # =======================================
        # 7. METRICS
        # =======================================
        print("Creating 'metrics' collection...")
        db['metrics'].delete_many({})
        db['metrics'].create_index([('timestamp', -1)])
        db['metrics'].create_index([('period', 1)])
        print("  ✓ Metrics collection created\n")
        
        # =======================================
        # 8. AUDIT LOGS
        # =======================================
        print("Creating 'audit_logs' collection...")
        db['audit_logs'].delete_many({})
        db['audit_logs'].create_index([('timestamp', -1)])
        db['audit_logs'].create_index([('user_id', 1)])
        db['audit_logs'].create_index([('action', 1)])
        print("  ✓ Audit logs collection created\n")
        
        # =======================================
        # 9. FEATURE FLAGS
        # =======================================
        print("Creating 'feature_flags' collection...")
        db['feature_flags'].delete_many({})
        db['feature_flags'].create_index([('feature_name', 1)])
        db['feature_flags'].create_index([('enabled', 1)])
        print("  ✓ Feature flags collection created\n")
        
        # =======================================
        # 10. API KEYS
        # =======================================
        print("Creating 'api_keys' collection...")
        db['api_keys'].delete_many({})
        db['api_keys'].create_index([('api_key', 1)])
        db['api_keys'].create_index([('enabled', 1)])
        
        # Create default API key
        default_api_key = {
            '_id': 'key_default',
            'key_name': 'Default Backend Key',
            'api_key': 'sk_test_key_production',
            'scope': ['recommendations:read', 'recommendations:write', 'analytics:read'],
            'rate_limit': {
                'requests_per_minute': 1000,
                'requests_per_hour': 50000,
            },
            'enabled': True,
            'created_at': datetime.utcnow(),
            'owner': 'system',
            'notes': 'Default API key for development',
        }
        
        db['api_keys'].insert_one(default_api_key)
        print("  ✓ API keys collection created\n")
        
        # =======================================
        # 11. COMPANIES & POSITIONS
        # =======================================
        print("Creating 'companies' collection...")
        db['companies'].delete_many({})
        
        companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Tesla', 'Netflix',
                    'Airbnb', 'Uber', 'LinkedIn', 'Adobe', 'Accenture', 'Infosys', 'TCS', 'Wipro']
        
        for company in companies:
            db['companies'].insert_one({
                '_id': f'company_{company}',
                'name': company,
                'enabled': True,
                'created_at': datetime.utcnow(),
            })
        
        print(f"  ✓ {len(companies)} companies created\n")
        
        print("Creating 'positions' collection...")
        db['positions'].delete_many({})
        
        positions = ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager',
                    'Product Manager', 'Data Scientist', 'QA Engineer', 'DevOps Engineer',
                    'Solution Architect', 'Principal Engineer']
        
        for position in positions:
            db['positions'].insert_one({
                '_id': f'position_{position}',
                'title': position,
                'enabled': True,
                'created_at': datetime.utcnow(),
            })
        
        print(f"  ✓ {len(positions)} positions created\n")
        
        # =======================================
        # LOGS & IMPORT EXISTING DATA
        # =======================================
        print("Creating 'logs' collection...")
        db['logs'].delete_many({})
        db['logs'].create_index([('timestamp', -1)])
        print("  ✓ Logs collection created\n")
        
        print("=" * 70)
        print("✓ DATABASE INITIALIZATION COMPLETE")
        print("=" * 70)
        print(f"\n📊 Summary:")
        print(f"  - Collections created: 12")
        print(f"  - Indexes created: 25+")
        print(f"  - Skills seeded: {len(skills_data)}")
        print(f"  - Departments: {len(departments_data)}")
        print(f"  - Companies: {len(companies)}")
        print(f"  - Positions: {len(positions)}")
        print(f"\n🔐 Default API Key: sk_test_key_production")
        print(f"\n📝 Next Steps:")
        print(f"  1. Update .env with your MongoDB URI")
        print(f"  2. Run: python app_production.py")
        print(f"  3. Test: curl http://localhost:5000/health")
        print(f"  4. Add your first student/alumni data to MongoDB")
        print(f"\n")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = initialize_database()
    sys.exit(0 if success else 1)
