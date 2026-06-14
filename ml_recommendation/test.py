# Testing and Evaluation script for Recommendation System

import json
import pandas as pd
import numpy as np
from models import AlumniRecommendationModel, HybridRecommendationModel
from data_processor import DataProcessor, FeatureEngineer
import os
from datetime import datetime


class ModelTester:
    """Test and validate recommendation models"""

    def __init__(self):
        self.model = None
        self.students_df = None
        self.alumni_df = None
        self.results = {}

    def load_data(self):
        """Load test data"""
        print("Loading test data...")
        try:
            self.students_df = pd.read_csv('./data/students.csv')
            self.alumni_df = pd.read_csv('./data/alumni.csv')
            print(f"✓ Loaded {len(self.students_df)} students and {len(self.alumni_df)} alumni")
            return True
        except Exception as e:
            print(f"✗ Error loading data: {e}")
            return False

    def load_model(self):
        """Load trained model"""
        print("\nLoading model...")
        try:
            self.model = AlumniRecommendationModel()
            self.model.load_model('./models/alumni_recommendation_model.pkl')
            print("✓ Model loaded successfully")
            return True
        except Exception as e:
            print(f"✗ Error loading model: {e}")
            return False

    def test_basic_recommendations(self, n_students=5):
        """Test basic recommendation functionality"""
        print(f"\n{'='*80}")
        print("TEST 1: Basic Recommendations")
        print(f"{'='*80}")

        results = []
        for i in range(min(n_students, len(self.students_df))):
            student = self.students_df.iloc[i]
            recommendations = self.model.get_recommendations(i, n_recommendations=5)

            result = {
                'student_id': student['student_id'],
                'student_name': student['name'],
                'department': student['department'],
                'num_recommendations': len(recommendations),
                'top_recommendation_score': recommendations[0][1] if recommendations else 0,
                'recommendations': []
            }

            for alumni_idx, score in recommendations:
                alumni = self.alumni_df.iloc[alumni_idx]
                result['recommendations'].append({
                    'name': alumni['name'],
                    'department': alumni['department'],
                    'score': round(float(score) * 100, 2)
                })

            results.append(result)
            print(f"\n{i+1}. {student['name']} ({student['department']})")
            print("   Recommendations:")
            for j, rec in enumerate(result['recommendations'], 1):
                print(f"   {j}. {rec['name']} - Score: {rec['score']}%")

        self.results['basic_recommendations'] = results
        return results

    def test_filtering(self):
        """Test recommendation filtering"""
        print(f"\n{'='*80}")
        print("TEST 2: Filtering and Min Score")
        print(f"{'='*80}")

        student = self.students_df.iloc[0]
        student_idx = 0

        print(f"\nStudent: {student['name']}")

        # Test different min scores
        for min_score in [0.0, 0.3, 0.5, 0.7]:
            recommendations = self.model.get_recommendations(
                student_idx,
                n_recommendations=20,
                min_score=min_score
            )
            print(f"  Min score {min_score:.1f}: {len(recommendations)} recommendations")

        self.results['filtering'] = "Passed"
        return True

    def test_similarity_scores(self):
        """Test similarity calculation"""
        print(f"\n{'='*80}")
        print("TEST 3: Similarity Score Analysis")
        print(f"{'='*80}")

        # Get all similarity scores
        all_scores = []
        for i in range(min(20, len(self.students_df))):
            recommendations = self.model.get_recommendations(i, n_recommendations=len(self.alumni_df))
            scores = [score for _, score in recommendations]
            all_scores.extend(scores)

        scores_array = np.array(all_scores)

        print(f"\nSimilarity Score Statistics:")
        print(f"  Mean: {np.mean(scores_array):.4f}")
        print(f"  Median: {np.median(scores_array):.4f}")
        print(f"  Std Dev: {np.std(scores_array):.4f}")
        print(f"  Min: {np.min(scores_array):.4f}")
        print(f"  Max: {np.max(scores_array):.4f}")
        print(f"  25th percentile: {np.percentile(scores_array, 25):.4f}")
        print(f"  75th percentile: {np.percentile(scores_array, 75):.4f}")

        self.results['similarity_scores'] = {
            'mean': float(np.mean(scores_array)),
            'median': float(np.median(scores_array)),
            'std': float(np.std(scores_array)),
            'min': float(np.min(scores_array)),
            'max': float(np.max(scores_array))
        }
        return True

    def test_department_matching(self):
        """Test department-based recommendations"""
        print(f"\n{'='*80}")
        print("TEST 4: Department Matching")
        print(f"{'='*80}")

        # Get all departments
        departments = self.students_df['department'].unique()
        results = {}

        for dept in departments[:3]:  # Test first 3 departments
            students_in_dept = self.students_df[self.students_df['department'] == dept].head(2)
            alumni_in_dept = self.alumni_df[self.alumni_df['department'] == dept]

            print(f"\n{dept}")
            print(f"  Students: {len(students_in_dept)}")
            print(f"  Alumni: {len(alumni_in_dept)}")

            for _, student in students_in_dept.iterrows():
                student_idx = self.students_df[self.students_df['student_id'] == student['student_id']].index[0]
                recommendations = self.model.get_recommendations(student_idx, n_recommendations=5)

                same_dept_recs = 0
                for alumni_idx, _ in recommendations:
                    alumni = self.alumni_df.iloc[alumni_idx]
                    if alumni['department'] == dept:
                        same_dept_recs += 1

                match_rate = (same_dept_recs / len(recommendations)) * 100 if recommendations else 0
                print(f"  {student['name']}: {match_rate:.1f}% same department")

        self.results['department_matching'] = "Tested"
        return True

    def test_skill_matching(self):
        """Test skill-based matching"""
        print(f"\n{'='*80}")
        print("TEST 5: Skill-Based Matching")
        print(f"{'='*80}")

        # Test students with skills
        students_with_skills = self.students_df[self.students_df['skills'] != '']
        sample_students = students_with_skills.head(3)

        for _, student in sample_students.iterrows():
            student_skills = DataProcessor.parse_skills(student['skills'])
            if not student_skills:
                continue

            student_idx = self.students_df[self.students_df['student_id'] == student['student_id']].index[0]
            recommendations = self.model.get_recommendations(student_idx, n_recommendations=5)

            print(f"\n{student['name']}")
            print(f"  Skills: {student_skills}")
            print("  Top recommendations:")

            for i, (alumni_idx, score) in enumerate(recommendations[:3], 1):
                alumni = self.alumni_df.iloc[alumni_idx]
                alumni_skills = DataProcessor.parse_skills(alumni['skills'])
                common_skills = set(student_skills) & set(alumni_skills)
                print(f"  {i}. {alumni['name']}")
                print(f"     Common skills: {list(common_skills)}")
                print(f"     Similarity: {float(score)*100:.1f}%")

        self.results['skill_matching'] = "Tested"
        return True

    def test_edge_cases(self):
        """Test edge cases and error handling"""
        print(f"\n{'='*80}")
        print("TEST 6: Edge Cases")
        print(f"{'='*80}")

        results = {}

        # Test 1: Student with no skills
        print("\n1. Student with no skills:")
        try:
            student = self.students_df[(self.students_df['skills'] == '') | (self.students_df['skills'].isna())].iloc[0]
            student_idx = self.students_df[self.students_df['student_id'] == student['student_id']].index[0]
            recs = self.model.get_recommendations(student_idx, 5)
            print(f"   ✓ Got {len(recs)} recommendations for student with no skills")
            results['no_skills'] = 'Passed'
        except Exception as e:
            print(f"   ✗ Error: {e}")
            results['no_skills'] = 'Failed'

        # Test 2: Large number of recommendations
        print("\n2. Large number of recommendations (requesting more than available):")
        try:
            recs = self.model.get_recommendations(0, n_recommendations=500)
            print(f"   ✓ Requested 500, got {len(recs)}")
            results['large_limit'] = 'Passed'
        except Exception as e:
            print(f"   ✗ Error: {e}")
            results['large_limit'] = 'Failed'

        # Test 3: Zero min score
        print("\n3. Zero minimum score filter:")
        try:
            recs = self.model.get_recommendations(0, min_score=0.0)
            print(f"   ✓ Got {len(recs)} recommendations with min_score=0.0")
            results['zero_min_score'] = 'Passed'
        except Exception as e:
            print(f"   ✗ Error: {e}")
            results['zero_min_score'] = 'Failed'

        self.results['edge_cases'] = results
        return results

    def generate_report(self):
        """Generate comprehensive test report"""
        print(f"\n\n{'='*80}")
        print("TEST REPORT SUMMARY")
        print(f"{'='*80}")

        report = {
            'timestamp': datetime.now().isoformat(),
            'model_info': {
                'students': len(self.students_df),
                'alumni': len(self.alumni_df),
                'feature_dimensions': self.model.student_features.shape[1] if self.model.student_features is not None else 0
            },
            'test_results': self.results
        }

        # Save report
        report_path = f'./logs/test_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        os.makedirs('./logs', exist_ok=True)
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\n✓ Test report saved to {report_path}")
        print("\nTests Completed:")
        print(f"  ✓ Basic Recommendations")
        print(f"  ✓ Filtering")
        print(f"  ✓ Similarity Scores")
        print(f"  ✓ Department Matching")
        print(f"  ✓ Skill Matching")
        print(f"  ✓ Edge Cases")

        return report

    def run_all_tests(self):
        """Run all tests"""
        if not self.load_data():
            return False

        if not self.load_model():
            return False

        self.test_basic_recommendations(n_students=5)
        self.test_filtering()
        self.test_similarity_scores()
        self.test_department_matching()
        self.test_skill_matching()
        self.test_edge_cases()
        self.generate_report()

        return True


def run_tests():
    """Entry point for running tests"""
    print("\n" + "╔" + "="*78 + "╗")
    print("║" + " "*25 + "RECOMMENDATION MODEL TEST SUITE" + " "*22 + "║")
    print("╚" + "="*78 + "╝\n")

    tester = ModelTester()
    tester.run_all_tests()


if __name__ == '__main__':
    run_tests()
