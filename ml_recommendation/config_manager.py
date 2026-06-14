# Dynamic Configuration Manager
# Loads all configuration from MongoDB at runtime

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from pymongo import MongoClient
from functools import lru_cache

logger = logging.getLogger(__name__)

class ConfigurationManager:
    """
    Loads configuration from MongoDB at runtime.
    All settings are dynamic and can be updated without code changes.
    Implements caching with TTL for performance.
    """

    def __init__(self, mongodb_uri: str, database_name: str, cache_ttl: int = 300):
        """
        Initialize configuration manager
        
        Args:
            mongodb_uri: MongoDB connection string
            database_name: Database name
            cache_ttl: Cache time-to-live in seconds (default 5 minutes)
        """
        self.mongodb_uri = mongodb_uri
        self.database_name = database_name
        self.cache_ttl = cache_ttl
        self.client = None
        self.db = None
        self._cache = {}
        self._cache_timestamps = {}
        
    def connect(self):
        """Establish MongoDB connection"""
        try:
            self.client = MongoClient(self.mongodb_uri, serverSelectionTimeoutMS=5000)
            self.db = self.client[self.database_name]
            # Test connection
            self.db.command('ping')
            logger.info("✓ Connected to MongoDB configuration database")
            return True
        except Exception as e:
            logger.error(f"✗ Failed to connect to MongoDB: {e}")
            return False

    def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("✓ Disconnected from MongoDB")

    def _is_cache_valid(self, key: str) -> bool:
        """Check if cached value is still valid"""
        if key not in self._cache_timestamps:
            return False
        
        elapsed = (datetime.utcnow() - self._cache_timestamps[key]).total_seconds()
        return elapsed < self.cache_ttl

    def _get_cached(self, key: str) -> Optional[Any]:
        """Get value from cache if valid"""
        if self._is_cache_valid(key):
            return self._cache[key]
        return None

    def _set_cache(self, key: str, value: Any):
        """Set value in cache"""
        self._cache[key] = value
        self._cache_timestamps[key] = datetime.utcnow()

    def clear_cache(self):
        """Clear all cached values"""
        self._cache = {}
        self._cache_timestamps = {}
        logger.info("✓ Configuration cache cleared")

    # =========================
    # MAIN CONFIGURATION
    # =========================

    def get_global_config(self, force_refresh: bool = False) -> Dict[str, Any]:
        """Get global system configuration"""
        cache_key = 'global_config'
        
        if not force_refresh:
            cached = self._get_cached(cache_key)
            if cached:
                return cached

        config = self.db['recommendation_config'].find_one({'_id': 'global_config'})
        if not config:
            logger.warning("⚠ Global config not found, using defaults")
            config = self._get_default_global_config()
        
        # Remove MongoDB ID from response
        config.pop('_id', None)
        self._set_cache(cache_key, config)
        return config

    def update_global_config(self, updates: Dict[str, Any], user_id: str, reason: str = "") -> bool:
        """
        Update global configuration
        
        Args:
            updates: Dictionary of updates to apply
            user_id: User ID making the change
            reason: Reason for change (audit trail)
        
        Returns:
            True if successful
        """
        try:
            old_config = self.db['recommendation_config'].find_one({'_id': 'global_config'})
            
            self.db['recommendation_config'].update_one(
                {'_id': 'global_config'},
                {'$set': {'updated_at': datetime.utcnow(), 'updated_by': user_id, **updates}},
                upsert=True
            )
            
            # Log audit trail
            self._log_audit(
                action='UPDATE_CONFIG',
                user_id=user_id,
                resource='recommendation_config',
                resource_id='global_config',
                changes={'old_value': old_config, 'new_value': updates},
                reason=reason
            )
            
            self.clear_cache()  # Invalidate cache
            logger.info(f"✓ Global config updated by {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to update global config: {e}")
            return False

    # =========================
    # SCORING WEIGHTS
    # =========================

    def get_scoring_weights(self, department: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Get scoring weights for a department or global weights
        
        Args:
            department: Department name (None for global)
            force_refresh: Force refresh from database
        
        Returns:
            Scoring weights dictionary
        """
        scope = department or 'global'
        cache_key = f'weights_{scope}'
        
        if not force_refresh:
            cached = self._get_cached(cache_key)
            if cached:
                return cached

        weights = self.db['scoring_weights'].find_one({'_id': f'weights_{scope}'})
        
        if not weights:
            # Fall back to global if department-specific not found
            if department:
                logger.info(f"⚠ Weights for {department} not found, using global")
                return self.get_scoring_weights(None, force_refresh)
            
            weights = self._get_default_scoring_weights()
        
        weights.pop('_id', None)
        self._set_cache(cache_key, weights)
        return weights

    def set_scoring_weights(self, weights: Dict[str, float], department: Optional[str] = None, 
                           user_id: str = None, reason: str = "") -> bool:
        """
        Update scoring weights
        
        Args:
            weights: Dictionary of weights to apply
            department: Department-specific weights (None for global)
            user_id: User making the change
            reason: Audit reason
        
        Returns:
            True if successful
        """
        try:
            scope = department or 'global'
            doc_id = f'weights_{scope}'
            
            old_config = self.db['scoring_weights'].find_one({'_id': doc_id})
            
            self.db['scoring_weights'].update_one(
                {'_id': doc_id},
                {'$set': {
                    'weights': weights,
                    'updated_at': datetime.utcnow(),
                    'updated_by': user_id,
                    'version': (old_config.get('version', 0) if old_config else 0) + 1
                }},
                upsert=True
            )
            
            self._log_audit(
                action='UPDATE_WEIGHTS',
                user_id=user_id,
                resource='scoring_weights',
                resource_id=doc_id,
                changes={'old_value': old_config, 'new_value': weights},
                reason=reason
            )
            
            self.clear_cache()
            logger.info(f"✓ Scoring weights updated for {scope}")
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to update scoring weights: {e}")
            return False

    # =========================
    # DEPARTMENT MAPPINGS
    # =========================

    def get_departments(self, enabled_only: bool = True) -> List[Dict[str, Any]]:
        """Get all departments"""
        cache_key = f'departments_{enabled_only}'
        cached = self._get_cached(cache_key)
        if cached:
            return cached

        query = {'enabled': True} if enabled_only else {}
        departments = list(self.db['department_mappings'].find(query))
        
        for dept in departments:
            dept.pop('_id', None)
        
        self._set_cache(cache_key, departments)
        return departments

    def get_related_departments(self, department: str) -> List[str]:
        """Get related departments for a given department"""
        dept_doc = self.db['department_mappings'].find_one({'department': department})
        if dept_doc:
            return dept_doc.get('related_departments', [])
        return []

    def add_department_relationship(self, dept1: str, dept2: str, similarity: float = 0.8,
                                   user_id: str = None) -> bool:
        """Add relationship between departments"""
        try:
            # Update dept1
            self.db['department_mappings'].update_one(
                {'department': dept1},
                {
                    '$addToSet': {'related_departments': dept2},
                    '$set': {'similarity_score': similarity, 'updated_at': datetime.utcnow()}
                },
                upsert=True
            )
            
            # Update dept2 (make it bidirectional)
            self.db['department_mappings'].update_one(
                {'department': dept2},
                {
                    '$addToSet': {'related_departments': dept1},
                    '$set': {'similarity_score': similarity, 'updated_at': datetime.utcnow()}
                },
                upsert=True
            )
            
            self.clear_cache()
            logger.info(f"✓ Added relationship between {dept1} and {dept2}")
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to add department relationship: {e}")
            return False

    # =========================
    # SKILLS POOL
    # =========================

    def get_skills(self, enabled_only: bool = True, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all skills or skills by category"""
        cache_key = f'skills_{enabled_only}_{category}'
        cached = self._get_cached(cache_key)
        if cached:
            return cached

        query = {}
        if enabled_only:
            query['enabled'] = True
        if category:
            query['category'] = category

        skills = list(self.db['skills_pool'].find(query).sort('popularity_score', -1))
        
        for skill in skills:
            skill.pop('_id', None)
        
        self._set_cache(cache_key, skills)
        return skills

    def add_skill(self, skill_name: str, category: str, subcategories: List[str] = None,
                 weight: float = 1.0, user_id: str = None) -> bool:
        """Add a new skill to pool"""
        try:
            self.db['skills_pool'].update_one(
                {'skill_name': skill_name},
                {
                    '$set': {
                        'category': category,
                        'subcategories': subcategories or [],
                        'weight': weight,
                        'enabled': True,
                        'updated_at': datetime.utcnow(),
                        'updated_by': user_id
                    }
                },
                upsert=True
            )
            
            self.clear_cache()
            logger.info(f"✓ Skill '{skill_name}' added")
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to add skill: {e}")
            return False

    def get_skill_by_name(self, skill_name: str) -> Optional[Dict[str, Any]]:
        """Get specific skill details"""
        skill = self.db['skills_pool'].find_one({'skill_name': skill_name})
        if skill:
            skill.pop('_id', None)
        return skill

    # =========================
    # MODEL VERSIONS
    # =========================

    def get_active_model(self) -> Optional[Dict[str, Any]]:
        """Get currently active model version"""
        cache_key = 'active_model'
        cached = self._get_cached(cache_key)
        if cached:
            return cached

        model = self.db['model_versions'].find_one({'status': 'active'})
        if model:
            model.pop('_id', None)
            self._set_cache(cache_key, model)
        return model

    def get_model_versions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get list of model versions"""
        versions = list(self.db['model_versions'].find().sort('created_at', -1).limit(limit))
        for v in versions:
            v.pop('_id', None)
        return versions

    def register_model_version(self, version: int, model_type: str, file_path: str,
                              metrics: Dict[str, Any], user_id: str = None) -> bool:
        """Register a new trained model version"""
        try:
            model_id = f'model_v{version}_{model_type}_{datetime.utcnow().strftime("%Y_%m_%d")}'
            
            self.db['model_versions'].insert_one({
                '_id': model_id,
                'version': version,
                'model_type': model_type,
                'file_path': file_path,
                'status': 'inactive',  # Must be activated manually
                'metrics': metrics,
                'created_at': datetime.utcnow(),
                'trained_by': user_id or 'system',
            })
            
            self._log_audit(
                action='REGISTER_MODEL',
                user_id=user_id,
                resource='model_versions',
                resource_id=model_id,
                changes={'new_value': {'version': version, 'model_type': model_type}},
                reason='New model version registered'
            )
            
            self.clear_cache()
            logger.info(f"✓ Model version {version} registered")
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to register model: {e}")
            return False

    def activate_model_version(self, version: int, user_id: str = None) -> bool:
        """Activate a specific model version"""
        try:
            # Deactivate current active model
            current_active = self.db['model_versions'].find_one({'status': 'active'})
            if current_active:
                self.db['model_versions'].update_one(
                    {'status': 'active'},
                    {'$set': {'status': 'archived'}}
                )
            
            # Activate new version
            result = self.db['model_versions'].update_one(
                {'version': version},
                {'$set': {
                    'status': 'active',
                    'activated_at': datetime.utcnow(),
                    'activated_by': user_id
                }}
            )
            
            self._log_audit(
                action='ACTIVATE_MODEL',
                user_id=user_id,
                resource='model_versions',
                resource_id=f'v{version}',
                changes={'status': 'active'},
                reason='Model version activated'
            )
            
            self.clear_cache()
            logger.info(f"✓ Model version {version} activated")
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"✗ Failed to activate model: {e}")
            return False

    # =========================
    # AUDIT LOGGING
    # =========================

    def _log_audit(self, action: str, user_id: Optional[str], resource: str,
                   resource_id: str, changes: Dict[str, Any] = None, reason: str = ""):
        """Log audit trail"""
        try:
            self.db['audit_logs'].insert_one({
                'timestamp': datetime.utcnow(),
                'action': action,
                'user_id': user_id or 'system',
                'resource': resource,
                'resource_id': resource_id,
                'changes': changes or {},
                'reason': reason,
                'status': 'success',
            })
        except Exception as e:
            logger.error(f"⚠ Failed to log audit trail: {e}")

    def get_audit_logs(self, action: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get audit logs"""
        query = {}
        if action:
            query['action'] = action
        
        logs = list(self.db['audit_logs'].find(query).sort('timestamp', -1).limit(limit))
        for log in logs:
            log.pop('_id', None)
        return logs

    # =========================
    # METRICS
    # =========================

    def record_metrics(self, metrics: Dict[str, Any]) -> bool:
        """Record system metrics"""
        try:
            self.db['metrics'].insert_one({
                'timestamp': datetime.utcnow(),
                **metrics
            })
            return True
        except Exception as e:
            logger.error(f"⚠ Failed to record metrics: {e}")
            return False

    def get_latest_metrics(self) -> Optional[Dict[str, Any]]:
        """Get latest recorded metrics"""
        metrics = self.db['metrics'].find_one({}, sort=[('timestamp', -1)])
        if metrics:
            metrics.pop('_id', None)
        return metrics

    # =========================
    # DEFAULTS
    # =========================

    @staticmethod
    def _get_default_global_config() -> Dict[str, Any]:
        """Get default global configuration"""
        return {
            'system': {
                'model_type': 'hybrid',
                'batch_size': 32,
                'cache_enabled': True,
                'cache_ttl': 3600,
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
                'min_profile_completeness': 0.5,
                'require_verified': False,
                'require_active': True,
            }
        }

    @staticmethod
    def _get_default_scoring_weights() -> Dict[str, Any]:
        """Get default scoring weights"""
        return {
            'weights': {
                'department': 0.35,
                'skills': 0.25,
                'experience': 0.20,
                'achievements': 0.10,
                'activity': 0.10,
            },
            'scope': 'global'
        }
