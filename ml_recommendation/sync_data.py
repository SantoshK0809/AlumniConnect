"""
MongoDB to CSV Data Sync for ML Recommendation System
Exports student and alumni profiles from MongoDB into CSV format
that the ML model expects for training and inference.
"""

import os
import sys
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'test')
DATA_DIR = os.getenv('DATA_DIR', './data')


def connect_to_mongodb():
    """Connect to MongoDB and return the database."""
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        # Test connection
        client.server_info()
        print(f"[OK] Connected to MongoDB: {DATABASE_NAME}")
        return db
    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        sys.exit(1)


def sync_students(db):
    """Export student profiles to CSV."""
    print("\n--- Syncing Students ---")

    # Get students with populated user data
    students_collection = db['students']
    users_collection = db['users']

    students = list(students_collection.find({'isActive': True}))
    print(f"  Found {len(students)} active students")

    if not students:
        print("  [WARN] No students found. Creating empty CSV.")
        empty_df = pd.DataFrame(columns=[
            'student_id', 'user_id', 'name', 'email', 'department',
            'batch', 'skills', 'projects', 'achievements', 'bio',
            'course', 'currentYear', 'verified', 'isActive'
        ])
        empty_df.to_csv(os.path.join(DATA_DIR, 'students.csv'), index=False)
        return 0

    rows = []
    for student in students:
        # Fetch associated user
        user = users_collection.find_one({'_id': student['user']})
        if not user:
            continue

        rows.append({
            'student_id': str(student['_id']),
            'user_id': str(student['user']),
            'name': user.get('name', ''),
            'email': user.get('email', ''),
            'department': student.get('department', ''),
            'batch': student.get('batch', 0),
            'skills': ','.join(student.get('skills', [])),
            'projects': ','.join(student.get('projects', [])),
            'achievements': ','.join(student.get('achievements', [])),
            'bio': student.get('bio', ''),
            'course': student.get('course', ''),
            'currentYear': student.get('currentYear', ''),
            'verified': student.get('verified', False),
            'isActive': student.get('isActive', True)
        })

    df = pd.DataFrame(rows)
    output_path = os.path.join(DATA_DIR, 'students.csv')
    df.to_csv(output_path, index=False)
    print(f"  [OK] Exported {len(rows)} students to {output_path}")
    return len(rows)


def sync_alumni(db):
    """Export alumni profiles to CSV."""
    print("\n--- Syncing Alumni ---")

    alumni_collection = db['alumnis']
    users_collection = db['users']

    alumni = list(alumni_collection.find({'isActive': True}))
    print(f"  Found {len(alumni)} active alumni")

    if not alumni:
        print("  [WARN] No alumni found. Creating empty CSV.")
        empty_df = pd.DataFrame(columns=[
            'alumni_id', 'user_id', 'name', 'email', 'department',
            'graduationYear', 'currentCompany', 'currentPosition',
            'skills', 'achievements', 'bio', 'linkedin', 'location',
            'verified', 'isActive'
        ])
        empty_df.to_csv(os.path.join(DATA_DIR, 'alumni.csv'), index=False)
        return 0

    rows = []
    for alum in alumni:
        # Fetch associated user
        user = users_collection.find_one({'_id': alum['user']})
        if not user:
            continue

        rows.append({
            'alumni_id': str(alum['_id']),
            'user_id': str(alum['user']),
            'name': user.get('name', ''),
            'email': user.get('email', ''),
            'department': alum.get('department', ''),
            'graduationYear': alum.get('graduationYear', 0),
            'currentCompany': alum.get('currentCompany', ''),
            'currentPosition': alum.get('currentPosition', ''),
            'skills': ','.join(alum.get('skills', [])),
            'achievements': ','.join(alum.get('achievements', [])),
            'bio': alum.get('bio', ''),
            'linkedin': alum.get('linkedin', ''),
            'location': alum.get('location', ''),
            'contact': alum.get('contact', ''),
            'verified': alum.get('verified', False),
            'isActive': alum.get('isActive', True)
        })

    df = pd.DataFrame(rows)
    output_path = os.path.join(DATA_DIR, 'alumni.csv')
    df.to_csv(output_path, index=False)
    print(f"  [OK] Exported {len(rows)} alumni to {output_path}")
    return len(rows)


def main():
    """Run the full data sync pipeline."""
    print("=" * 50)
    print("ML Data Sync: MongoDB -> CSV")
    print("=" * 50)

    # Ensure data directory exists
    os.makedirs(DATA_DIR, exist_ok=True)

    # Connect to MongoDB
    db = connect_to_mongodb()

    # Sync data
    student_count = sync_students(db)
    alumni_count = sync_alumni(db)

    print("\n" + "=" * 50)
    print(f"Sync Complete!")
    print(f"  Students: {student_count}")
    print(f"  Alumni:   {alumni_count}")
    print("=" * 50)

    if student_count == 0 or alumni_count == 0:
        print("\n[WARN] Warning: Some collections are empty.")
        print("  The ML model needs both student and alumni data to train.")
        print("  Please add profiles first, then re-run this sync.")


if __name__ == '__main__':
    main()
