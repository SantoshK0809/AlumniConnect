# Sample Data Generator for Testing
# Creates sample student and alumni data for testing the recommendation system

import pandas as pd
import numpy as np
import random
from datetime import datetime
import os

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

# Department list
DEPARTMENTS = [
    'Computer Science and Engineering',
    'Information Technology',
    'Artificial Intelligence and Data Science',
    'Electronics and Telecommunication',
    'Electrical Engineering',
    'Instrumentation Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering'
]

# Skills list
TECHNICAL_SKILLS = [
    'Python', 'Java', 'JavaScript', 'C++', 'C#',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI',
    'Git', 'CI/CD', 'Linux', 'Windows', 'DevOps'
]

# Companies list
COMPANIES = [
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta',
    'Tesla', 'Netflix', 'Airbnb', 'Uber', 'LinkedIn',
    'Adobe', 'Salesforce', 'Oracle', 'IBM', 'Intel',
    'Accenture', 'Infosys', 'TCS', 'Wipro', 'HCL',
    'Startups', 'Self-employed', 'Freelance', 'Entrepreneur'
]

# Achievement examples
ACHIEVEMENTS = [
    'Led team of 10 engineers',
    'Developed AI product used by 100k users',
    'Patents filed in ML',
    'Published research papers',
    'Built mobile app with 1M downloads',
    'Mentored 5+ junior developers',
    'Speaker at tech conferences',
    'Open source contributor',
    'Hackathon winner',
    'Promoted to management'
]


def generate_students_data(n_students=100):
    """Generate sample student data"""
    students = []
    
    for i in range(n_students):
        skills = random.sample(TECHNICAL_SKILLS, random.randint(2, 8))
        projects = [f"Project{j+1}" for j in range(random.randint(1, 5))]
        achievements = random.sample(ACHIEVEMENTS, random.randint(0, 3))
        
        student = {
            'student_id': f"STU{str(i+1).zfill(5)}",
            'user_id': f"USER{str(i+1).zfill(5)}",
            'name': f"Student {i+1}",
            'email': f"student{i+1}@university.edu",
            'department': random.choice(DEPARTMENTS),
            'batch': random.randint(2021, 2024),
            'currentYear': random.choice(['1st', '2nd', '3rd', '4th']),
            'skills': ','.join(skills),
            'projects': ','.join(projects),
            'achievements': ','.join(achievements),
            'bio': f"Passionate student interested in {', '.join(skills[:2])}",
            'verified': random.choice([True, False]),
            'isActive': True
        }
        students.append(student)
    
    return pd.DataFrame(students)


def generate_alumni_data(n_alumni=150):
    """Generate sample alumni data"""
    alumni = []
    
    for i in range(n_alumni):
        graduation_year = random.randint(2015, 2023)
        skills = random.sample(TECHNICAL_SKILLS, random.randint(3, 10))
        achievements = random.sample(ACHIEVEMENTS, random.randint(1, 5))
        contributions = [f"Contrib{j+1}" for j in range(random.randint(0, 3))]
        
        alumnus = {
            'alumni_id': f"ALM{str(i+1).zfill(5)}",
            'user_id': f"USER{str(i+100001).zfill(5)}",
            'name': f"Alumni {i+1}",
            'email': f"alumni{i+1}@company.com",
            'department': random.choice(DEPARTMENTS),
            'graduationYear': graduation_year,
            'currentCompany': random.choice(COMPANIES),
            'currentPosition': random.choice(['Software Engineer', 'Senior Engineer', 'Tech Lead', 'Manager', 'Founder']),
            'skills': ','.join(skills),
            'achievements': ','.join(achievements),
            'contributions': ','.join(contributions),
            'bio': f"Experienced professional with {datetime.now().year - graduation_year} years of experience",
            'location': random.choice(['San Francisco', 'New York', 'London', 'Bangalore', 'Singapore', 'Remote']),
            'linkedin': f"linkedin.com/in/alumni{i+1}",
            'verified': random.choice([True, True, True, False]),  # Bias towards verified
            'isActive': random.choice([True, True, False])  # Bias towards active
        }
        alumni.append(alumnus)
    
    return pd.DataFrame(alumni)


def generate_interactions_data(n_students=100, n_alumni=150, interaction_density=0.1):
    """Generate sample interaction data"""
    interactions = []
    
    # Generate message interactions
    n_interactions = int(n_students * n_alumni * interaction_density)
    
    for _ in range(n_interactions):
        student_idx = random.randint(0, n_students - 1)
        alumni_idx = random.randint(0, n_alumni - 1)
        
        interaction = {
            'student_id': f"USER{str(student_idx+1).zfill(5)}",
            'alumni_id': f"USER{str(alumni_idx+100001).zfill(5)}",
            'interaction_type': random.choice(['message', 'view', 'connection']),
            'weight': random.uniform(0.5, 1.0),
            'timestamp': datetime.now().isoformat()
        }
        interactions.append(interaction)
    
    return pd.DataFrame(interactions)


def generate_all_sample_data(n_students=100, n_alumni=150, output_dir='./data'):
    """Generate all sample data and save to CSV files"""
    
    print("Generating sample data...")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate datasets
    print(f"  Generating {n_students} student profiles...")
    students_df = generate_students_data(n_students)
    
    print(f"  Generating {n_alumni} alumni profiles...")
    alumni_df = generate_alumni_data(n_alumni)
    
    print("  Generating interaction data...")
    interactions_df = generate_interactions_data(n_students, n_alumni, interaction_density=0.05)
    
    # Save to CSV
    students_path = os.path.join(output_dir, 'students.csv')
    alumni_path = os.path.join(output_dir, 'alumni.csv')
    interactions_path = os.path.join(output_dir, 'interactions.csv')
    
    print(f"  Saving to {output_dir}/...")
    students_df.to_csv(students_path, index=False)
    alumni_df.to_csv(alumni_path, index=False)
    interactions_df.to_csv(interactions_path, index=False)
    
    print("\n✓ Sample data generated successfully!")
    print(f"  - {students_path} ({len(students_df)} records)")
    print(f"  - {alumni_path} ({len(alumni_df)} records)")
    print(f"  - {interactions_path} ({len(interactions_df)} records)")
    
    # Print summary statistics
    print("\nData Summary:")
    print(f"  Students: {len(students_df)}")
    print(f"    Departments: {students_df['department'].nunique()}")
    print(f"    Batches: {students_df['batch'].unique()}")
    print(f"  Alumni: {len(alumni_df)}")
    print(f"    Departments: {alumni_df['department'].nunique()}")
    print(f"    Graduation years: {alumni_df['graduationYear'].min()} - {alumni_df['graduationYear'].max()}")
    print(f"  Interactions: {len(interactions_df)}")
    
    return students_df, alumni_df, interactions_df


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate sample data for recommendation system')
    parser.add_argument('--students', type=int, default=100, help='Number of students to generate')
    parser.add_argument('--alumni', type=int, default=150, help='Number of alumni to generate')
    parser.add_argument('--output-dir', default='./data', help='Output directory for CSV files')
    
    args = parser.parse_args()
    
    generate_all_sample_data(
        n_students=args.students,
        n_alumni=args.alumni,
        output_dir=args.output_dir
    )
