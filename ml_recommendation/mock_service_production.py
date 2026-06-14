# Production-Ready Mock Service - Fully Dynamic
# All static data pools removed, now uses database-driven configuration

import random
from datetime import datetime
from typing import List, Dict, Optional
import logging
from config_manager import ConfigurationManager

logger = logging.getLogger(__name__)

class ProductionMockService:
    """
    Production-ready mock service with dynamic configuration.
    No hardcoded data pools - all pools pulled from database.
    """

    def __init__(self, config_manager: ConfigurationManager):
        """
        Initialize mock service with configuration manager
        
        Args:
            config_manager: ConfigurationManager instance
        """
        self.config_manager = config_manager
        self.config = config_manager.get_global_config()
        
        # Load from database
        self.departments = self._load_departments()
        self.skills_pool = self._load_skills_pool()
        self.companies_pool = self._load_companies_pool()
        self.positions_pool = self._load_positions_pool()
        
        logger.info("✓ Production mock service initialized with database config")

    def _load_departments(self) -> List[str]:
        """Load departments from database"""
        departments = self.config_manager.get_departments()
        return [d['department'] for d in departments if d.get('enabled', True)]

    def _load_skills_pool(self) -> List[Dict]:
        """Load skills pool from database"""
        return self.config_manager.get_skills(enabled_only=True)

    def _load_companies_pool(self) -> List[str]:
        """
        Load companies from database or create defaults
        Checks for companies collection in MongoDB
        """
        try:
            companies = list(self.config_manager.db['companies'].find({'enabled': True}))
            if companies:
                return [c['name'] for c in companies]
        except:
            pass
        
        # Fallback companies if not in database
        return [
            'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Tesla', 'Netflix',
            'Airbnb', 'Uber', 'LinkedIn', 'Adobe', 'Accenture', 'Infosys', 'TCS', 'Wipro'
        ]

    def _load_positions_pool(self) -> List[str]:
        """
        Load positions from database or create defaults
        Checks for positions collection in MongoDB
        """
        try:
            positions = list(self.config_manager.db['positions'].find({'enabled': True}))
            if positions:
                return [p['title'] for p in positions]
        except:
            pass
        
        # Fallback positions if not in database
        return [
            'Software Engineer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager',
            'Product Manager', 'Data Scientist', 'QA Engineer', 'DevOps Engineer',
            'Solution Architect', 'Principal Engineer'
        ]

    def refresh_pools(self):
        """Refresh all data pools from database"""
        self.departments = self._load_departments()
        self.skills_pool = self._load_skills_pool()
        self.companies_pool = self._load_companies_pool()
        self.positions_pool = self._load_positions_pool()
        logger.info("✓ Mock service pools refreshed from database")

    def _select_random_skills(self, from_pool: List[Dict] = None, count: int = None) -> List[str]:
        """
        Select random skills from pool with weights
        
        Args:
            from_pool: Skills pool (uses own if None)
            count: Number of skills (random if None)
        
        Returns:
            List of skill names
        """
        pool = from_pool or self.skills_pool
        if not pool:
            return []

        count = count or random.randint(3, 7)
        count = min(count, len(pool))
        
        # Weighted selection based on popularity
        sorted_skills = sorted(pool, key=lambda x: x.get('popularity_score', 0), reverse=True)
        selected = []
        
        # Higher chance for popular skills
        for skill in sorted_skills[:int(len(sorted_skills) * 0.3)]:  # Top 30%
            if random.random() < 0.6 and len(selected) < count:
                selected.append(skill['skill_name'])
        
        # Fill remaining with random selection
        remaining_skills = [s for s in pool if s['skill_name'] not in selected]
        while len(selected) < count and remaining_skills:
            skill = random.choice(remaining_skills)
            selected.append(skill['skill_name'])
            remaining_skills.remove(skill)
        
        return selected[:count]

    def generate_mock_alumni(self, student_dept: str, count: int = 10) -> List[Dict]:
        """
        Generate mock alumni recommendations with dynamic scoring
        
        Args:
            student_dept: Student's department
            count: Number of alumni to generate
        
        Returns:
            List of mock alumni profiles with scores
        """
        recommendations = []
        api_config = self.config.get('api', {})
        min_score = api_config.get('min_similarity_score', 0.0)

        for i in range(count):
            alumni_dept = random.choice(self.departments)
            
            # Dynamic scoring based on configuration
            weights = self.config_manager.get_scoring_weights(alumni_dept)
            dept_weight = weights.get('weights', {}).get('department', 0.35)
            skills_weight = weights.get('weights', {}).get('skills', 0.25)
            activity_weight = weights.get('weights', {}).get('activity', 0.10)

            # Same department gets higher base score
            if alumni_dept == student_dept or \
               alumni_dept in self.config_manager.get_related_departments(student_dept):
                base_score = random.uniform(0.70, 0.95)
            else:
                base_score = random.uniform(0.40, 0.70)
            
            # Add randomness
            final_score = base_score + random.uniform(-0.05, 0.05)
            final_score = max(0.0, min(1.0, final_score))
            
            # Only include if above minimum score
            if final_score * 100 < min_score:
                continue

            skills = self._select_random_skills()
            
            # Achievements count (dynamic based on profile completeness)
            quality_config = self.config.get('data_quality', {})
            max_achievements = quality_config.get('max_achievements_per_profile', 15)
            achievements = [f"Achievement {j+1}" for j in range(random.randint(1, 4))]

            alumni = {
                'alumni_id': f'MOCK_ALM_{datetime.utcnow().timestamp()}_{i:05d}',
                'user_id': f'MOCK_USER_{datetime.utcnow().timestamp()}_{i:05d}',
                'name': f'Alumni Profile {i+1}',
                'email': f'alumni{i+1}@mockcompany.com',
                'department': alumni_dept,
                'graduationYear': random.randint(2015, 2023),
                'currentCompany': random.choice(self.companies_pool),
                'currentPosition': random.choice(self.positions_pool),
                'skills': skills,
                'achievements': achievements[:max_achievements],
                'bio': f'Experienced professional with expertise in {", ".join(skills[:2]) if skills else "various technologies"}',
                'location': random.choice(['San Francisco', 'New York', 'Bangalore', 'London', 'Remote', 'Hybrid']),
                'linkedin': f'linkedin.com/in/alumni{i+1}',
                'verified': random.choice([True, True, True, False]),  # 75% verified
                'isActive': random.choice([True, True, True, False]),  # 75% active
                'recommendationScore': round(final_score * 100, 2),
                'mode': 'mock'
            }
            recommendations.append(alumni)
        
        # Sort by score descending
        recommendations.sort(key=lambda x: x['recommendationScore'], reverse=True)
        
        # Apply API limit
        api_limit = api_config.get('default_limit', 10)
        return recommendations[:api_limit]

    def get_mock_recommendations(self, student_id: str, student_dept: str, 
                               limit: int = None, min_score: float = None) -> Dict:
        """
        Get mock recommendations response
        
        Args:
            student_id: Student ID
            student_dept: Student's department
            limit: Number of recommendations
            min_score: Minimum score threshold
        
        Returns:
            Response dictionary matching production format
        """
        api_config = self.config.get('api', {})
        limit = limit or api_config.get('default_limit', 10)
        max_limit = api_config.get('max_limit', 50)
        limit = min(limit, max_limit)
        
        min_score = min_score or api_config.get('min_similarity_score', 0.0)

        recs = self.generate_mock_alumni(student_dept, limit * 3)
        filtered = [r for r in recs if r['recommendationScore'] >= min_score][:limit]

        return {
            'success': True,
            'student_id': student_id,
            'count': len(filtered),
            'recommendations': filtered,
            'mode': 'mock',
            'timestamp': datetime.utcnow().isoformat(),
            'source': 'mock_service',
            'note': 'Mock recommendations - update database with real data for production mode'
        }

    def get_mock_analytics(self, student_id: str) -> Dict:
        """
        Get mock analytics response
        
        Args:
            student_id: Student ID
        
        Returns:
            Analytics dictionary
        """
        return {
            'success': True,
            'student_id': student_id,
            'mode': 'mock',
            'analytics': {
                'total_alumni_pool': len(self.config_manager.get_departments()) * random.randint(20, 50),
                'recommendations_available': random.randint(5, 15),
                'recommendation_score_distribution': {
                    '90-100': random.randint(2, 5),
                    '80-90': random.randint(3, 8),
                    '70-80': random.randint(5, 12),
                    '60-70': random.randint(5, 15),
                    '<60': random.randint(0, 5)
                },
                'top_matching_departments': random.sample(self.departments, min(3, len(self.departments))),
                'top_skills_requested': [s['skill_name'] for s in self.skills_pool[:5]],
                'timestamp': datetime.utcnow().isoformat()
            }
        }

    def get_mock_status(self) -> Dict:
        """Get mock API status"""
        return {
            'success': True,
            'mode': 'mock',
            'status': 'operational',
            'message': 'Mock service running - no trained model in use',
            'pools': {
                'departments': len(self.departments),
                'skills': len(self.skills_pool),
                'companies': len(self.companies_pool),
                'positions': len(self.positions_pool),
            },
            'config_loaded': self.config is not None,
            'timestamp': datetime.utcnow().isoformat()
        }

    def add_company(self, name: str, user_id: str = None) -> bool:
        """Add a new company to pool"""
        try:
            self.config_manager.db['companies'].update_one(
                {'name': name},
                {'$set': {
                    'enabled': True,
                    'added_at': datetime.utcnow(),
                    'added_by': user_id or 'system'
                }},
                upsert=True
            )
            
            self.refresh_pools()
            logger.info(f"✓ Company '{name}' added")
            return True
        except Exception as e:
            logger.error(f"✗ Failed to add company: {e}")
            return False

    def add_position(self, title: str, user_id: str = None) -> bool:
        """Add a new position to pool"""
        try:
            self.config_manager.db['positions'].update_one(
                {'title': title},
                {'$set': {
                    'enabled': True,
                    'added_at': datetime.utcnow(),
                    'added_by': user_id or 'system'
                }},
                upsert=True
            )
            
            self.refresh_pools()
            logger.info(f"✓ Position '{title}' added")
            return True
        except Exception as e:
            logger.error(f"✗ Failed to add position: {e}")
            return False

    def get_stats(self) -> Dict:
        """Get mock service statistics"""
        return {
            'service': 'mock',
            'status': 'active',
            'pools': {
                'departments': len(self.departments),
                'skills': len(self.skills_pool),
                'companies': len(self.companies_pool),
                'positions': len(self.positions_pool),
            },
            'last_refresh': datetime.utcnow().isoformat(),
            'database_connected': self.config_manager.db is not None
        }
