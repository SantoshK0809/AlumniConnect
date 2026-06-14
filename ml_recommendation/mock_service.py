# Mock Recommendation Service for Development
# Uses sample data and mock recommendations without requiring a trained model

import random
from datetime import datetime
from typing import List, Dict, Tuple

class MockRecommendationService:
    """
    Mock recommendation service for development and testing
    Returns realistic-looking recommendations without requiring a trained model
    """

    def __init__(self):
        self.companies = [
            'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta',
            'Tesla', 'Netflix', 'Airbnb', 'Uber', 'LinkedIn',
            'Adobe', 'Accenture', 'Infosys', 'TCS', 'Wipro'
        ]
        
        self.positions = [
            'Software Engineer', 'Senior Engineer', 'Tech Lead',
            'Engineering Manager', 'Product Manager', 'Data Scientist',
            'QA Engineer', 'DevOps Engineer', 'Solution Architect'
        ]
        
        self.skills_pool = [
            'Python', 'Java', 'JavaScript', 'React', 'Node.js',
            'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
            'Machine Learning', 'Data Analysis', 'REST APIs', 'GraphQL',
            'TypeScript', 'Vue.js', 'Angular', 'Firebase', 'Git'
        ]
        
        self.departments = [
            'Computer Science and Engineering',
            'Information Technology',
            'Artificial Intelligence and Data Science',
            'Electronics and Telecommunication',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Civil Engineering'
        ]

    def generate_mock_alumni(self, student_dept: str, count: int = 10) -> List[Dict]:
        """
        Generate mock alumni recommendations based on student department
        
        Args:
            student_dept: Student's department
            count: Number of recommendations to generate
            
        Returns:
            List of mock alumni profiles with scores
        """
        recommendations = []
        
        # Generate realistic scores biased towards same department
        for i in range(count):
            alumni_dept = random.choice(self.departments)
            
            # Same department gets higher base score
            if alumni_dept == student_dept:
                base_score = random.uniform(0.75, 0.95)
            else:
                base_score = random.uniform(0.45, 0.75)
            
            # Add some randomness
            final_score = base_score + random.uniform(-0.05, 0.05)
            final_score = max(0.0, min(1.0, final_score))  # Clamp between 0-1
            
            skills = random.sample(self.skills_pool, random.randint(3, 7))
            achievements = [
                f"Achievement {j+1}" for j in range(random.randint(1, 4))
            ]
            
            alumni = {
                'alumni_id': f'MOCK_ALM_{i+1:05d}',
                'user_id': f'MOCK_USER_{i+1:05d}',
                'name': f'Alumni Profile {i+1}',
                'email': f'alumni{i+1}@mockcompany.com',
                'department': alumni_dept,
                'graduationYear': random.randint(2015, 2022),
                'currentCompany': random.choice(self.companies),
                'currentPosition': random.choice(self.positions),
                'skills': skills,
                'achievements': achievements,
                'bio': f'Experienced professional with expertise in {", ".join(skills[:2])}',
                'location': random.choice(['San Francisco', 'New York', 'Bangalore', 'London', 'Remote']),
                'linkedin': f'linkedin.com/in/alumni{i+1}',
                'verified': True,
                'isActive': True,
                'recommendationScore': round(final_score * 100, 2)
            }
            recommendations.append(alumni)
        
        # Sort by score descending
        recommendations.sort(key=lambda x: x['recommendationScore'], reverse=True)
        return recommendations

    def get_mock_recommendations(self, student_id: str, student_dept: str, 
                               limit: int = 10, min_score: float = 0) -> Dict:
        """
        Get mock recommendations for a student
        
        Args:
            student_id: Student ID
            student_dept: Student's department
            limit: Number of recommendations
            min_score: Minimum score threshold (0-100)
            
        Returns:
            Response dict matching real API format
        """
        recommendations = self.generate_mock_alumni(student_dept, limit * 2)
        
        # Filter by min score
        filtered = [
            rec for rec in recommendations 
            if rec['recommendationScore'] >= min_score
        ][:limit]
        
        return {
            'success': True,
            'count': len(filtered),
            'recommendations': filtered,
            'mode': 'mock',
            'note': 'Using mock data for development. Train with real data for production.'
        }

    def get_mock_analytics(self, student_id: str) -> Dict:
        """Get mock analytics"""
        scores = [random.randint(40, 95) for _ in range(10)]
        
        return {
            'success': True,
            'analytics': {
                'totalRecommendations': 50,
                'averageScore': sum(scores) // len(scores),
                'maxScore': max(scores),
                'minScore': min(scores),
                'departmentBreakdown': {
                    'Computer Science and Engineering': 15,
                    'Information Technology': 12,
                    'Artificial Intelligence and Data Science': 10,
                    'Electronics and Telecommunication': 8,
                    'Other': 5
                },
                'mode': 'mock'
            }
        }

    def get_mock_detail(self, alumni_id: str, student_dept: str) -> Dict:
        """Get mock detailed recommendation"""
        base_score = random.uniform(60, 95)
        
        return {
            'success': True,
            'detail': {
                'alumni': {
                    'alumni_id': alumni_id,
                    'name': f'Mock Alumni - {alumni_id}',
                    'department': random.choice(self.departments),
                    'currentCompany': random.choice(self.companies),
                    'currentPosition': random.choice(self.positions),
                },
                'scores': {
                    'overall': round(base_score, 2),
                    'department': round(random.uniform(20, 35), 2),
                    'skills': round(random.uniform(15, 25), 2),
                    'experience': round(random.uniform(10, 20), 2)
                },
                'reasoning': {
                    'department_match': 'Same' if random.choice([True, False]) else 'Related',
                    'years_difference': random.randint(1, 8),
                    'matching_skills': random.randint(2, 6)
                },
                'mode': 'mock'
            }
        }


# Global mock service instance
mock_service = MockRecommendationService()


def get_mock_service():
    """Get mock recommendation service"""
    return mock_service
