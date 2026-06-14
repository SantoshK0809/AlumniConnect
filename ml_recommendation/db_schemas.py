# Database Schemas for Production Recommendation System
# All configuration is stored dynamically in MongoDB

from pymongo import ASCENDING, DESCENDING
from datetime import datetime

class DatabaseSchemas:
    """
    Database schema definitions for production-ready ML recommendation system.
    All static configuration moved to MongoDB for runtime management.
    """

    @staticmethod
    def get_all_schemas():
        """Returns all schema definitions"""
        return {
            'recommendation_config': DatabaseSchemas.recommendation_config_schema(),
            'scoring_weights': DatabaseSchemas.scoring_weights_schema(),
            'department_mappings': DatabaseSchemas.department_mappings_schema(),
            'skills_pool': DatabaseSchemas.skills_pool_schema(),
            'model_versions': DatabaseSchemas.model_versions_schema(),
            'recommendation_cache': DatabaseSchemas.recommendation_cache_schema(),
            'metrics': DatabaseSchemas.metrics_schema(),
            'audit_logs': DatabaseSchemas.audit_logs_schema(),
            'feature_flags': DatabaseSchemas.feature_flags_schema(),
            'api_keys': DatabaseSchemas.api_keys_schema(),
        }

    @staticmethod
    def recommendation_config_schema():
        """
        Main configuration document - ONE DOCUMENT IN THIS COLLECTION
        Stores all runtime configuration parameters
        """
        return {
            'description': 'Global configuration for recommendation system',
            'example': {
                '_id': 'global_config',
                'system': {
                    'model_type': 'hybrid',  # 'content' or 'hybrid'
                    'batch_size': 32,
                    'cache_enabled': True,
                    'cache_ttl': 3600,  # seconds
                    'log_level': 'INFO',
                    'debug_mode': False,
                },
                'api': {
                    'default_limit': 10,
                    'max_limit': 50,
                    'min_similarity_score': 0.0,
                    'timeout': 30,
                    'retry_attempts': 3,
                },
                'data_quality': {
                    'min_profile_completeness': 0.5,  # 50%
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
                'updated_at': datetime.utcnow(),
                'updated_by': 'admin',
            },
            'indexes': [
                {'key': [('_id', ASCENDING)], 'name': 'id_index', 'unique': True}
            ]
        }

    @staticmethod
    def scoring_weights_schema():
        """
        Dynamic scoring weights for recommendations
        Can be created per department or globally
        """
        return {
            'description': 'Scoring weights for recommendation algorithms',
            'example': {
                '_id': 'weights_global',  # or 'weights_CSE' for dept-specific
                'scope': 'global',  # 'global' or department name
                'weights': {
                    'department': 0.35,      # 35% - Same department matching
                    'skills': 0.25,          # 25% - Skill similarity
                    'experience': 0.20,      # 20% - Experience level relevance
                    'achievements': 0.10,    # 10% - Achievements/projects
                    'activity': 0.10,        # 10% - Profile activity status
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
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'updated_by': 'admin',
                'version': 1,
                'notes': 'Initial production weights based on testing',
            },
            'indexes': [
                {'key': [('scope', ASCENDING)], 'name': 'scope_index'},
                {'key': [('updated_at', DESCENDING)], 'name': 'recency_index'},
            ]
        }

    @staticmethod
    def department_mappings_schema():
        """
        Dynamic department relationships for similarity calculation
        Determines which departments are related
        """
        return {
            'description': 'Department relationships and groupings',
            'example': {
                '_id': 'dept_Computer Science and Engineering',
                'department': 'Computer Science and Engineering',
                'related_departments': [
                    'Information Technology',
                    'Artificial Intelligence and Data Science'
                ],
                'similarity_score': 0.8,  # Base similarity to related depts
                'aliases': ['CSE', 'CS', 'Computer Science'],
                'priority': 1,  # Lower = higher priority
                'enabled': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'updated_by': 'admin',
            },
            'indexes': [
                {'key': [('department', ASCENDING)], 'name': 'dept_index', 'unique': True},
                {'key': [('priority', ASCENDING)], 'name': 'priority_index'},
            ]
        }

    @staticmethod
    def skills_pool_schema():
        """
        Dynamic skills pool for alumni/student matching
        Can be updated without retraining model
        """
        return {
            'description': 'Master list of skills for matching',
            'example': {
                '_id': 'skill_Python',
                'skill_name': 'Python',
                'category': 'Programming Language',
                'subcategories': ['Backend', 'Data Science', 'Automation'],
                'popularity_score': 95,  # 0-100, based on usage
                'enabled': True,
                'weight': 1.0,  # Relative importance
                'related_skills': ['Java', 'JavaScript', 'C++'],
                'min_proficiency': 1,
                'max_proficiency': 5,
                'demand_level': 'High',  # High, Medium, Low
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'usage_count': 1250,
            },
            'indexes': [
                {'key': [('skill_name', ASCENDING)], 'name': 'skill_index', 'unique': True},
                {'key': [('category', ASCENDING)], 'name': 'category_index'},
                {'key': [('popularity_score', DESCENDING)], 'name': 'popularity_index'},
            ]
        }

    @staticmethod
    def model_versions_schema():
        """
        Track all trained model versions for versioning and rollback
        """
        return {
            'description': 'Model versioning and management',
            'example': {
                '_id': 'model_v1_hybrid_2024_04_15',
                'version': 1,
                'model_type': 'hybrid',
                'algorithm': 'hybrid_svd',
                'file_path': './models/alumni_recommendation_model_v1.pkl',
                'status': 'active',  # 'training', 'active', 'archived', 'failed'
                'metrics': {
                    'students_trained': 150,
                    'alumni_trained': 200,
                    'average_similarity': 0.65,
                    'max_similarity': 1.0,
                    'min_similarity': 0.2,
                    'training_accuracy': 0.78,  # % of recommendations rated good
                    'inference_time_ms': 45,
                },
                'training_config': {
                    'data_size': 'medium',
                    'test_split': 0.2,
                    'random_seed': 42,
                },
                'performance': {
                    'avg_response_time_ms': 47,
                    'p95_response_time_ms': 120,
                    'p99_response_time_ms': 250,
                    'error_rate': 0.002,
                },
                'created_at': datetime.utcnow(),
                'trained_at': datetime.utcnow(),
                'trained_by': 'system',
                'activated_at': datetime.utcnow(),
                'notes': 'Production model trained on full dataset',
            },
            'indexes': [
                {'key': [('version', DESCENDING)], 'name': 'version_index'},
                {'key': [('status', ASCENDING)], 'name': 'status_index'},
                {'key': [('created_at', DESCENDING)], 'name': 'recency_index'},
            ]
        }

    @staticmethod
    def recommendation_cache_schema():
        """
        Cache for frequent recommendations to reduce inference time
        Auto-expires after TTL
        """
        return {
            'description': 'Cached recommendations for performance',
            'example': {
                '_id': 'cache_student_12345',
                'student_id': 'student_12345',
                'recommendations': [
                    {
                        'alumni_id': 'alumni_67890',
                        'name': 'John Doe',
                        'score': 85.5,
                        'reason': 'Same department + matching skills',
                    }
                ],
                'query_hash': 'hash_of_query_params',
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow(),  # TTL index on this field
                'hit_count': 5,
                'ttl_seconds': 3600,
            },
            'indexes': [
                {'key': [('student_id', ASCENDING)], 'name': 'student_index'},
                {'key': [('expires_at', ASCENDING)], 'name': 'ttl_index', 'expireAfterSeconds': 0},
            ]
        }

    @staticmethod
    def metrics_schema():
        """
        Real-time metrics tracking for monitoring system health
        """
        return {
            'description': 'System metrics and health indicators',
            'example': {
                '_id': 'metrics_2024_04_15_10_30',
                'timestamp': datetime.utcnow(),
                'period': 'hourly',  # 'realtime', 'hourly', 'daily'
                'recommendation_requests': {
                    'total': 1250,
                    'successful': 1245,
                    'failed': 5,
                    'avg_response_time_ms': 47,
                    'p95_response_time_ms': 120,
                },
                'cache': {
                    'hits': 800,
                    'misses': 450,
                    'hit_rate': 0.64,  # 64%
                    'size_mb': 25,
                },
                'model': {
                    'active_version': 1,
                    'last_training': datetime.utcnow(),
                    'inference_calls': 1245,
                    'avg_inference_time_ms': 8,
                },
                'system': {
                    'cpu_usage_percent': 35,
                    'memory_usage_mb': 512,
                    'uptime_hours': 240,
                    'errors': 2,
                    'warnings': 0,
                },
                'data': {
                    'total_students': 5000,
                    'total_alumni': 8000,
                    'avg_profile_completeness': 0.72,
                },
            },
            'indexes': [
                {'key': [('timestamp', DESCENDING)], 'name': 'timestamp_index'},
                {'key': [('period', ASCENDING)], 'name': 'period_index'},
            ]
        }

    @staticmethod
    def audit_logs_schema():
        """
        Audit trail for all configuration changes and system events
        """
        return {
            'description': 'Audit logs for compliance and debugging',
            'example': {
                '_id': 'audit_2024_04_15_10_45_12345',
                'timestamp': datetime.utcnow(),
                'action': 'UPDATE_WEIGHTS',  # UPDATE_WEIGHTS, UPDATE_CONFIG, TRAIN_MODEL, etc.
                'user_id': 'admin_123',
                'username': 'admin@example.com',
                'resource': 'scoring_weights',
                'resource_id': 'weights_global',
                'changes': {
                    'old_value': {'department': 0.30},
                    'new_value': {'department': 0.35},
                },
                'reason': 'Improved department matching performance',
                'ip_address': '192.168.1.1',
                'status': 'success',  # 'success', 'failure'
                'status_message': 'Weights updated successfully',
            },
            'indexes': [
                {'key': [('timestamp', DESCENDING)], 'name': 'timestamp_index'},
                {'key': [('user_id', ASCENDING)], 'name': 'user_index'},
                {'key': [('action', ASCENDING)], 'name': 'action_index'},
            ]
        }

    @staticmethod
    def feature_flags_schema():
        """
        Feature flags for A/B testing and gradual rollouts
        """
        return {
            'description': 'Feature flags for experimentation',
            'example': {
                '_id': 'flag_new_algorithm',
                'feature_name': 'new_algorithm',
                'description': 'Test new recommendation algorithm',
                'enabled': False,  # Global toggle
                'rollout_percentage': 10,  # 10% of users
                'targeting': {
                    'user_ids': ['user_123', 'user_456'],  # Specific users
                    'departments': ['CSE'],  # Specific departments
                    'regions': ['Bangalore'],  # Geographic targeting
                },
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'updated_by': 'admin',
                'start_date': datetime.utcnow(),
                'end_date': None,
            },
            'indexes': [
                {'key': [('feature_name', ASCENDING)], 'name': 'feature_index', 'unique': True},
                {'key': [('enabled', ASCENDING)], 'name': 'enabled_index'},
            ]
        }

    @staticmethod
    def api_keys_schema():
        """
        API key management for backend integration
        """
        return {
            'description': 'API keys for authentication',
            'example': {
                '_id': 'key_backend_production',
                'key_name': 'Backend Production',
                'api_key': 'sk_live_1234567890abcdef',  # Hashed
                'secret_key': 'sk_secret_1234567890',  # Hashed
                'scope': ['recommendations:read', 'analytics:read', 'admin:write'],
                'rate_limit': {
                    'requests_per_minute': 1000,
                    'requests_per_hour': 50000,
                },
                'enabled': True,
                'created_at': datetime.utcnow(),
                'last_used': datetime.utcnow(),
                'owner': 'Backend Team',
                'notes': 'For production backend integration',
            },
            'indexes': [
                {'key': [('api_key', ASCENDING)], 'name': 'key_index', 'unique': True},
                {'key': [('enabled', ASCENDING)], 'name': 'enabled_index'},
            ]
        }

    @staticmethod
    def create_all_indexes(db):
        """
        Create all indexes for production database
        
        Args:
            db: MongoDB database instance
        """
        schemas = DatabaseSchemas.get_all_schemas()
        for collection_name, schema in schemas.items():
            if 'indexes' in schema:
                collection = db[collection_name]
                for index in schema['indexes']:
                    try:
                        collection.create_index(
                            index['key'],
                            name=index.get('name'),
                            unique=index.get('unique', False),
                            expireAfterSeconds=index.get('expireAfterSeconds')
                        )
                        print(f"✓ Created index {index.get('name')} on {collection_name}")
                    except Exception as e:
                        print(f"⚠ Index creation failed: {e}")

    @staticmethod
    def seed_initial_data(db):
        """
        Seeds database with initial configuration
        
        Args:
            db: MongoDB database instance
        """
        # Seed recommendation config
        db['recommendation_config'].update_one(
            {'_id': 'global_config'},
            {'$set': DatabaseSchemas.recommendation_config_schema()['example']},
            upsert=True
        )

        # Seed scoring weights
        db['scoring_weights'].update_one(
            {'_id': 'weights_global'},
            {'$set': DatabaseSchemas.scoring_weights_schema()['example']},
            upsert=True
        )

        # Seed departments
        departments = [
            'Computer Science and Engineering',
            'Information Technology',
            'Artificial Intelligence and Data Science',
            'Electronics and Telecommunication',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Civil Engineering'
        ]
        
        for dept in departments:
            db['department_mappings'].update_one(
                {'_id': f'dept_{dept}', 'department': dept},
                {'$set': {
                    'related_departments': [],
                    'aliases': [],
                    'priority': 1,
                    'enabled': True,
                    'created_at': datetime.utcnow(),
                }},
                upsert=True
            )

        print("✓ Initial data seeded successfully")
