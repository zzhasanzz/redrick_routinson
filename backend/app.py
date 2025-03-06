import os
import re
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import csv
import random
import firebase_admin
from firebase_admin import credentials, firestore, auth
import logging
from firebase_admin.exceptions import FirebaseError
import time


app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# Firebase Initialization
cred = credentials.Certificate("./ServiceAccountKey.json")  # Update with your Firebase credentials JSON file
firebase_admin.initialize_app(cred)
db = firestore.client()

    
with open('offered_courses.json', 'r') as file:
    offered_courses = json.load(file)

with open('input_courses_winter.json', 'r') as file:
    input_courses = json.load(file)

with open('faculty_details.json', 'r') as file:
    faculty_details = json.load(file)

@app.route('/api/offered-courses', methods=['GET'])
def get_offered_courses():
    try:
        # Read fresh data on every request
        with open('offered_courses.json', 'r') as file:
            offered_courses = json.load(file)
        return jsonify(offered_courses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/offered-labs', methods=['GET'])
def get_offered_labs():
    try:
        # Read fresh data from offered_labs.json
        with open('offered_labs.json', 'r') as file:
            offered_labs = json.load(file)

        # Create a deep copy of offered_labs to avoid modifying the original
        merged_labs = json.loads(json.dumps(offered_labs))

        # Iterate through each semester in the offered_labs
        for semester_data in merged_labs['semesters']:
            semester = semester_data['semester']

            # Determine which input file to use based on the semester
            if semester in [1, 3, 5, 7]:
                input_file = 'input_file_lab_winter.json'
            elif semester in [2, 4, 6, 8]:
                input_file = 'input_file_lab_summer.json'
            else:
                continue  # Skip invalid semesters

            # Load the corresponding input file
            with open(input_file, 'r') as file:
                input_labs = json.load(file)

            # Find the corresponding semester in the input file
            input_semester_data = next(
                (sem for sem in input_labs['semesters'] if sem['semester'] == semester),
                None
            )

            if not input_semester_data:
                continue  # Skip if semester not found in input file

            # Merge teacher data from input file into the copied offered_labs
            for course in semester_data['courses']:
                course_code = course['course']

                # Find the lab in the input file for Section A and Section B
                for section in input_semester_data['sections']:
                    for lab in section['labs']:
                        if lab['course'] == course_code:
                            # Add teacher data for Section A
                            if section['section'] == 'A':
                                course['sectionA'] = {
                                    'teacher1': lab.get('teacher1', ''),
                                    'teacher2': lab.get('teacher2', ''),
                                }
                            # Add teacher data for Section B
                            elif section['section'] == 'B':
                                course['sectionB'] = {
                                    'teacher1': lab.get('teacher1', ''),
                                    'teacher2': lab.get('teacher2', ''),
                                }
                            break

        return jsonify(merged_labs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@app.route('/api/unassigned-courses/<int:semester>', methods=['GET'])
def get_unassigned_courses(semester):
    with open('offered_courses.json', 'r') as file:
        offered_courses = json.load(file)
    try:
        # Find the semester in offered_courses.json
        semester_data = next((sem for sem in offered_courses['semesters'] if sem['semester'] == semester), None)
        if not semester_data:
            return jsonify({"error": f"Semester {semester} not found"}), 404

        # Filter unassigned courses
        unassigned_courses = [course for course in semester_data['courses'] if not course['assigned']]

        return jsonify(unassigned_courses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/unassigned-labs/<int:semester>', methods=['GET'])
def get_unassigned_labs(semester):
    with open('offered_labs.json', 'r') as file:
        offered_labs = json.load(file)
    try:
        # Find the semester in offered_labs.json
        semester_data = next((sem for sem in offered_labs['semesters'] if sem['semester'] == semester), None)
        if not semester_data:
            return jsonify({"error": f"Semester {semester} not found"}), 404

        # Filter unassigned labs
        unassigned_labs = [lab for lab in semester_data['courses'] if not lab['assigned']]

        return jsonify(unassigned_labs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/api/delete-course', methods=['POST'])
def delete_course():
    try:
        data = request.json

        # Validate required fields
        if not all(key in data for key in ['semester', 'course']):
            return jsonify({"error": "Missing required fields: semester or course"}), 400

        semester = data['semester']
        course_code = data['course']

        # Determine which input file to update based on the semester
        if semester in [1, 3, 5, 7]:
            input_file = 'input_courses_winter.json'
        elif semester in [2, 4, 6, 8]:
            input_file = 'input_courses_summer.json'
        else:
            return jsonify({"error": "Invalid semester provided"}), 400

        # Load fresh data from files
        with open('offered_courses.json', 'r') as f:
            offered_courses = json.load(f)
        
        with open(input_file, 'r') as f:
            input_courses = json.load(f)

        # Check if offered_courses.json has the 'semesters' key
        if 'semesters' not in offered_courses:
            return jsonify({"error": "Invalid structure: 'semesters' key not found in offered_courses.json"}), 500

        # Update offered_courses.json (set assigned to false)
        semester_found = False
        course_found = False

        for sem in offered_courses['semesters']:
            if sem['semester'] == semester:
                semester_found = True
                for course in sem['courses']:
                    if course['course'] == course_code:
                        course_found = True
                        course['assigned'] = False
                        break
                break

        if not semester_found:
            return jsonify({"error": f"Semester {semester} not found"}), 404
        if not course_found:
            return jsonify({"error": f"Course {course_code} not found in semester {semester}"}), 404

        # Check if input_courses has the 'semesters' key
        if 'semesters' not in input_courses:
            return jsonify({"error": f"Invalid structure: 'semesters' key not found in {input_file}"}), 500

        # Update input_courses (remove the course)
        for sem in input_courses['semesters']:
            if sem['semester'] == semester:
                sem['courses'] = [c for c in sem['courses'] if c['course'] != course_code]
                break

        # Save changes to files atomically
        try:
            # Write to temporary files first
            with open('offered_courses.tmp', 'w') as f:
                json.dump(offered_courses, f, indent=2)
            with open(f'{input_file}.tmp', 'w') as f:
                json.dump(input_courses, f, indent=2)

            # Rename temporary files to replace the original files
            os.replace('offered_courses.tmp', 'offered_courses.json')
            os.replace(f'{input_file}.tmp', input_file)
        except Exception as e:
            return jsonify({"error": f"Failed to save changes: {str(e)}"}), 500

        return jsonify({"message": "Course deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/delete-lab', methods=['POST'])
def delete_lab():
    try:
        data = request.json

        # Validate required fields
        if not all(key in data for key in ['semester', 'course']):
            return jsonify({"error": "Missing required fields: semester or course"}), 400

        semester = data['semester']
        course_code = data['course']

        # Determine which input file to update based on the semester
        if semester in [1, 3, 5, 7]:
            input_file = 'input_file_lab_winter.json'
        elif semester in [2, 4, 6, 8]:
            input_file = 'input_file_lab_summer.json'
        else:
            return jsonify({"error": "Invalid semester provided"}), 400

        # Load fresh data from files
        with open('offered_labs.json', 'r') as f:
            offered_labs = json.load(f)
        
        with open(input_file, 'r') as f:
            input_labs = json.load(f)

        # Update offered_labs.json (set assigned to false)
        semester_found = False
        course_found = False

        for sem in offered_labs['semesters']:
            if sem['semester'] == semester:
                semester_found = True
                for course in sem['courses']:
                    if course['course'] == course_code:
                        course_found = True
                        course['assigned'] = False  # Set assigned to false
                        break
                break

        if not semester_found:
            return jsonify({"error": f"Semester {semester} not found"}), 404
        if not course_found:
            return jsonify({"error": f"Course {course_code} not found in semester {semester}"}), 404

        # Update input_labs (remove the lab from all sections)
        semester_found_input = False
        for sem in input_labs['semesters']:
            if sem['semester'] == semester:
                semester_found_input = True
                for sec in sem['sections']:
                    sec['labs'] = [lab for lab in sec['labs'] if lab['course'] != course_code]
                break

        if not semester_found_input:
            return jsonify({"error": f"Semester {semester} not found in {input_file}"}), 404

        # Save changes to files atomically
        try:
            # Write to temporary files first
            with open('offered_labs.tmp', 'w') as f:
                json.dump(offered_labs, f, indent=2)
            with open(f'{input_file}.tmp', 'w') as f:
                json.dump(input_labs, f, indent=2)

            # Rename temporary files to replace the original files
            os.replace('offered_labs.tmp', 'offered_labs.json')
            os.replace(f'{input_file}.tmp', input_file)
        except Exception as e:
            return jsonify({"error": f"Failed to save changes: {str(e)}"}), 500

        return jsonify({"message": "Lab unassigned successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/faculty-ranks', methods=['GET'])
def get_faculty_ranks():
    try:
        with open('faculty_ranks.json', 'r') as file:
            faculty_ranks = json.load(file)
        return jsonify(faculty_ranks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/update-faculty', methods=['POST'])
def update_faculty():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Check for required fields
        required = ['semester', 'course', 'teacher']
        if not all(key in data for key in required):
            return jsonify({
                "error": f"Missing fields. Required: {', '.join(required)}",
                "received": list(data.keys())
            }), 400

        semester = data['semester']
        course_code = data['course']
        new_teacher = data['teacher']

        # Determine which input file to update based on the semester
        if semester in [1, 3, 5, 7]:
            input_file = 'input_courses_winter.json'
        elif semester in [2, 4, 6, 8]:
            input_file = 'input_courses_summer.json'
        else:
            return jsonify({"error": "Invalid semester provided"}), 400

        # Load fresh data from files
        with open('offered_courses.json', 'r') as f:
            offered = json.load(f)
        
        with open(input_file, 'r') as f:
            input_courses = json.load(f)

        # Update offered_courses.json
        updated_offered = False
        for sem in offered['semesters']:
            if sem['semester'] == semester:
                for course in sem['courses']:
                    if course['course'] == course_code:
                        course['teacher'] = new_teacher
                        updated_offered = True
                        break
                if updated_offered:
                    break

        # Update the appropriate input file
        updated_input = False
        for sem in input_courses['semesters']:
            if sem['semester'] == semester:
                for course in sem['courses']:
                    if course['course'] == course_code:
                        course['teacher'] = new_teacher
                        updated_input = True
                        break
                if updated_input:
                    break

        if not updated_offered:
            return jsonify({"error": "Course not found in offered courses"}), 404
        if not updated_input:
            return jsonify({"error": f"Course not found in {input_file}"}), 404

        # Save changes atomically
        try:
            # Write to a temporary file first
            with open('offered_courses.tmp', 'w') as f:
                json.dump(offered, f, indent=2)
            with open(f'{input_file}.tmp', 'w') as f:
                json.dump(input_courses, f, indent=2)

            # Rename the temporary files to replace the original files
            os.replace('offered_courses.tmp', 'offered_courses.json')
            os.replace(f'{input_file}.tmp', input_file)
        except Exception as e:
            return jsonify({"error": f"Failed to save changes: {str(e)}"}), 500

        return jsonify({"message": "Faculty updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/api/update-lab', methods=['POST'])
def update_lab():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Check for required fields
        required = ['semester', 'section', 'course', 'teacher1', 'teacher2']
        if not all(key in data for key in required):
            return jsonify({
                "error": f"Missing fields. Required: {', '.join(required)}",
                "received": list(data.keys())
            }), 400

        semester = data['semester']
        section = data['section']
        course_code = data['course']
        new_teacher1 = data['teacher1']
        new_teacher2 = data['teacher2']

        # Determine which input file to update based on the semester
        if semester in [1, 3, 5, 7]:
            input_file = 'input_file_lab_winter.json'
        elif semester in [2, 4, 6, 8]:
            input_file = 'input_file_lab_summer.json'
        else:
            return jsonify({"error": "Invalid semester provided"}), 400

        # Load fresh data from files
        with open('offered_labs.json', 'r') as f:
            offered = json.load(f)
        
        with open(input_file, 'r') as f:
            input_labs = json.load(f)

        # Update offered_labs.json
        updated_offered = False
        for sem in offered['semesters']:
            if sem['semester'] == semester:
                for course in sem['courses']:
                    if course['course'] == course_code:
                        course['teacher1'] = new_teacher1
                        course['teacher2'] = new_teacher2
                        updated_offered = True
                        break
                if updated_offered:
                    break

        # Update the appropriate input file
        updated_input = False
        for sem in input_labs['semesters']:
            if sem['semester'] == semester:
                for sec in sem['sections']:
                    if sec['section'] == section:
                        for lab in sec['labs']:
                            if lab['course'] == course_code:
                                lab['teacher1'] = new_teacher1
                                lab['teacher2'] = new_teacher2
                                updated_input = True
                                break
                        if updated_input:
                            break
                if updated_input:
                    break

        if not updated_offered:
            return jsonify({"error": "Lab not found in offered labs"}), 404
        if not updated_input:
            return jsonify({"error": f"Lab not found in {input_file}"}), 404

        # Save changes atomically
        try:
            # Write to a temporary file first
            with open('offered_labs.tmp', 'w') as f:
                json.dump(offered, f, indent=2)
            with open(f'{input_file}.tmp', 'w') as f:
                json.dump(input_labs, f, indent=2)

            # Rename the temporary files to replace the original files
            os.replace('offered_labs.tmp', 'offered_labs.json')
            os.replace(f'{input_file}.tmp', input_file)
        except Exception as e:
            return jsonify({"error": f"Failed to save changes: {str(e)}"}), 500

        return jsonify({"message": "Lab teachers updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    



@app.route('/api/add-course', methods=['POST'])
def add_course():
    try:
        data = request.json

        # Validate required fields
        if not all(key in data for key in ['semester', 'course', 'teacher']):
            return jsonify({"error": "Missing required fields: semester, course, or teacher"}), 400

        semester = data['semester']
        course_code = data['course']
        teacher = data['teacher']

        # Determine which input file to update based on the semester
        if semester in [1, 3, 5, 7]:
            input_file = 'input_courses_winter.json'
        elif semester in [2, 4, 6, 8]:
            input_file = 'input_courses_summer.json'
        else:
            return jsonify({"error": "Invalid semester provided"}), 400

        # Load fresh data from files
        with open('offered_courses.json', 'r') as f:
            offered_courses = json.load(f)
        
        with open(input_file, 'r') as f:
            input_courses = json.load(f)

        # Update offered_courses.json (set assigned to true)
        semester_found = False
        course_found = False

        for sem in offered_courses['semesters']:
            if sem['semester'] == semester:
                semester_found = True
                for course in sem['courses']:
                    if course['course'] == course_code:
                        course_found = True
                        course['assigned'] = True
                        course['teacher'] = teacher
                        break
                break

        if not semester_found:
            return jsonify({"error": f"Semester {semester} not found in offered courses"}), 404
        if not course_found:
            return jsonify({"error": f"Course {course_code} not found in semester {semester}"}), 404

        # Add the course to the appropriate input file
        semester_found_input = False
        for sem in input_courses['semesters']:
            if sem['semester'] == semester:
                semester_found_input = True
                # Check if the course already exists
                if any(c['course'] == course_code for c in sem['courses']):
                    return jsonify({"error": f"Course {course_code} already exists in semester {semester}"}), 400
                # Add the course
                sem['courses'].append({"course": course_code, "credit": 3, "teacher": teacher})
                break

        if not semester_found_input:
            return jsonify({"error": f"Semester {semester} not found in {input_file}"}), 404

        # Save changes to files atomically
        try:
            # Write to temporary files first
            with open('offered_courses.tmp', 'w') as f:
                json.dump(offered_courses, f, indent=2)
            with open(f'{input_file}.tmp', 'w') as f:
                json.dump(input_courses, f, indent=2)

            # Rename temporary files to replace the original files
            os.replace('offered_courses.tmp', 'offered_courses.json')
            os.replace(f'{input_file}.tmp', input_file)
        except Exception as e:
            return jsonify({"error": f"Failed to save changes: {str(e)}"}), 500

        return jsonify({"message": "Course added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/add-lab', methods=['POST'])
def add_lab():
    try:
        data = request.json

        # Validate required fields
        required_fields = ['semester', 'course', 'sectionA', 'sectionB']
        if not all(key in data for key in required_fields):
            return jsonify({"error": f"Missing required fields: {', '.join(required_fields)}"}), 400

        semester = data['semester']
        course_code = data['course']
        section_a = data['sectionA']
        section_b = data['sectionB']

        # Validate section data
        if not all(key in section_a for key in ['teacher1', 'teacher2']):
            return jsonify({"error": "Missing teacher1 or teacher2 in Section A"}), 400
        if not all(key in section_b for key in ['teacher1', 'teacher2']):
            return jsonify({"error": "Missing teacher1 or teacher2 in Section B"}), 400

        # Determine which input file to update based on the semester
        if semester in [1, 3, 5, 7]:
            input_file = 'input_file_lab_winter.json'
        elif semester in [2, 4, 6, 8]:
            input_file = 'input_file_lab_summer.json'
        else:
            return jsonify({"error": "Invalid semester provided"}), 400

        # Load fresh data from files
        with open('offered_labs.json', 'r') as f:
            offered_labs = json.load(f)
        
        with open(input_file, 'r') as f:
            input_labs = json.load(f)

        # Update offered_labs.json (set assigned to true)
        semester_found = False
        course_found = False

        for sem in offered_labs['semesters']:
            if sem['semester'] == semester:
                semester_found = True
                for course in sem['courses']:
                    if course['course'] == course_code:
                        course_found = True
                        course['assigned'] = True
                        break
                break

        if not semester_found:
            return jsonify({"error": f"Semester {semester} not found in offered labs"}), 404
        if not course_found:
            return jsonify({"error": f"Course {course_code} not found in semester {semester}"}), 404

        # Add the lab to the appropriate input file for both sections
        semester_found_input = False
        for sem in input_labs['semesters']:
            if sem['semester'] == semester:
                semester_found_input = True
                # Add lab to Section A
                sem['sections'][0]['labs'].append({
                    "course": course_code,
                    "teacher1": section_a['teacher1'],
                    "teacher2": section_a['teacher2']
                })
                # Add lab to Section B
                sem['sections'][1]['labs'].append({
                    "course": course_code,
                    "teacher1": section_b['teacher1'],
                    "teacher2": section_b['teacher2']
                })
                break

        if not semester_found_input:
            return jsonify({"error": f"Semester {semester} not found in {input_file}"}), 404

        # Save changes to files atomically
        try:
            # Write to temporary files first
            with open('offered_labs.tmp', 'w') as f:
                json.dump(offered_labs, f, indent=2)
            with open(f'{input_file}.tmp', 'w') as f:
                json.dump(input_labs, f, indent=2)

            # Rename temporary files to replace the original files
            os.replace('offered_labs.tmp', 'offered_labs.json')
            os.replace(f'{input_file}.tmp', input_file)
        except Exception as e:
            return jsonify({"error": f"Failed to save changes: {str(e)}"}), 500

        return jsonify({"message": "Lab added successfully to both sections"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/update-preferences', methods=['POST'])
def update_preferences():
    data = request.json
    teacher_name = data.get('teacherName')
    preferred_times = data.get('preferredTimes')

    if not teacher_name or not preferred_times:
        return jsonify({'status': 'error', 'message': 'Teacher name and preferred times are required.'}), 400

    try:
        with open('faculty_details.json', 'r') as f:
            faculty_details = json.load(f)

        if teacher_name not in faculty_details:
            return jsonify({'status': 'error', 'message': 'Teacher not found.'}), 404

        # Convert time slots to range format
        formatted_times = []
        for entry in preferred_times:
            # Split time into start and end using regex to handle various formats
            start_time, end_time = re.match(r'(\d+:\d+)-(\d+:\d+)', entry['time']).groups()
            formatted_time = f"{start_time}-{end_time}"
            formatted_times.append({
                'day': entry['day'],
                'time': formatted_time
            })

        faculty_details[teacher_name]['preferred_times'] = formatted_times

        with open('faculty_details.json', 'w') as f:
            json.dump(faculty_details, f, indent=2)

        return jsonify({'status': 'success', 'message': 'Preferences updated successfully.'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

####################################################################################################################################


@app.route("/deleteUser", methods=["DELETE"])
def delete_user():
    try:
        # Log the request data
        data = request.get_json()
        print("Request data:", data)

        user_identifier = data.get("userId")  # This can be UID or email
        if not user_identifier:
            return jsonify({"error": "User ID or email is required"}), 400

        # Log the user identifier
        print("Deleting user with identifier:", user_identifier)

        # Check if the identifier is an email or UID
        if "@" in user_identifier:
            # If it's an email, fetch the user by email to get the UID
            try:
                user = auth.get_user_by_email(user_identifier)
                user_id = user.uid
                print("User found with email:", user_identifier, "UID:", user_id)
            except auth.UserNotFoundError:
                return jsonify({"error": "User not found in Firebase Authentication"}), 404
        else:
            # If it's a UID, use it directly
            user_id = user_identifier

        # Delete the user from Firebase Authentication
        print("Deleting user from Firebase Authentication with UID:", user_id)
        auth.delete_user(user_id)

        # Delete the user document from Firestore
        user_ref = db.collection("users").document(data.get("userId"))
        if not user_ref.get().exists:
            return jsonify({"error": "User document not found in Firestore"}), 404

        print("Deleting user document from Firestore with UserID:", user_id)
        user_ref.delete()

        return jsonify({"message": "User deleted successfully"}), 200

    except FirebaseError as e:
        # Log the error
        print("Firebase Error:", str(e))
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        # Log the error
        print("Error:", str(e))
        return jsonify({"error": "An unexpected error occurred"}), 500


def generate_seat_plan(target_departments, semester):
    """
    Fetches all documents where semester = X and filters them into given department lists.
    
    :param target_departments: List of target department names (e.g., ["CSE", "EEE", "MPE"])
    :param semester: Semester number to filter by (e.g., 1)
    :return: JSON response with sorted seat plans for selected departments
    """
    try:
        seat_plan_collection = db.collection("seat_plan_USERS")

        # Query Firestore for matching documents
        query = seat_plan_collection.where("semester", "==", semester).where("dept", "in", target_departments)
        results = query.stream()

        # Initialize department lists dynamically based on input
        seat_plan_data = {dept: [] for dept in target_departments}

        # Group documents by department
        for doc in results:
            doc_data = doc.to_dict()
            dept = doc_data.get("dept", "")

            if dept in seat_plan_data:
                seat_plan_data[dept].append(doc_data)

        # Sort each department list by "id"
        for dept in seat_plan_data:
            seat_plan_data[dept] = sorted(seat_plan_data[dept], key=lambda x: x.get("id", float('inf')))


        print(f"✅ Successfully retrieved and sorted seat plans for Semester {semester}: {target_departments}")

        return {"status": "success", "seat_plan": seat_plan_data}

    except Exception as e:
        print(f"❌ Error retrieving seat plan: {str(e)}")
        return {"status": "error", "message": str(e)}

# def generate_seating_arrangement(
#     result_sem_1_container_1, result_sem_1_container_2,
#     result_sem_3_container_1, result_sem_3_container_2
# ):
#     """
#     Generates seating arrangements where:
#     - First two seats: result_sem_1_container_1, result_sem_1_container_2
#     - Next two seats: result_sem_2_container_2, result_sem_2_container_1
#     - This pattern continues until no data is left.

#     If a container runs out of data, skip that seat and maintain order.
#     Each room has 60 seats.
#     """

#     try:
#         # List of all rooms (assuming 30 rooms)
#         db = firestore.client()  # Initialize Firestore client

#         # Fetch all room numbers from Firebase and sort them numerically
#         rooms_ref = db.collection("seat_plan_rooms").stream()
#         ROOMS = sorted(
#             [room.to_dict().get("room_no") for room in rooms_ref if "room_no" in room.to_dict()],
#             key=lambda x: int(x) if str(x).isdigit() else x  # Sorting numerically for proper order
#         )

#         if not ROOMS:
#             print("❌ No rooms found in seat_plan_rooms!")
#             return {"status": "error", "message": "No rooms found in database."}
#         SEATS_PER_ROOM = 60  # 60 seats per room

#         # Extract student lists from JSON response
#         queue_1 = sum([result_sem_1_container_1["seat_plan"].get(dept, []) for dept in ["CSE", "MPE", "SWE", "IPE"]], [])
#         queue_2 = sum([result_sem_1_container_2["seat_plan"].get(dept, []) for dept in ["EEE","CEE", "TVE","BTM"]], [])
#         queue_3 = sum([result_sem_3_container_2["seat_plan"].get(dept, []) for dept in ["BTM","CEE", "TVE", "EEE"]], [])
#         queue_4 = sum([result_sem_3_container_1["seat_plan"].get(dept, []) for dept in ["MPE", "SWE", "IPE" ,"CSE"]], [])

#         seating_plan = {}  # Dictionary to store seating arrangements per room

#         # Initialize room structure
#         for room in ROOMS:
#             seating_plan[room] = []

#         room_index = 0  # Track current room
#         seat_no = 1  # Track seat number in each room

#         # Define the order of seating
#         seat_order = [queue_1, queue_2, queue_3, queue_4]  # Rotate in this order

#         # Loop until all queues are exhausted
#         while any(len(queue) > 0 for queue in seat_order):  # Stop when all lists are empty
#             for queue in seat_order:
#                 if queue:  # If queue is not empty
#                     student = queue.pop(0)  # Take first student
#                     seating_plan[ROOMS[room_index]].append({
#                         "room": ROOMS[room_index],
#                         "seat_no": seat_no,
#                         "id": student["id"],
#                         "dept": student["dept"],
#                         "semester": student["semester"],
#                         "role": student.get("role", "student"),
#                         "displayName": student.get("displayName", "")
#                     })
                    
#                 # Move to next seat
#                 seat_no += 1
#                 # If room is full, go to next room
#                 if seat_no > SEATS_PER_ROOM:
#                     seat_no = 1  # Reset seat number
#                     room_index += 1  # Move to next room
#                     if room_index >= len(ROOMS):  # If no more rooms left, stop
#                         break  # Exit the loop

#         print("✅ Seating arrangement generated successfully.")
#         return {"status": "success", "seating_plan": seating_plan}

#     except Exception as e:
#         print(f"❌ Error generating seating arrangement: {str(e)}")
#         return {"status": "error", "message": str(e)}
def generate_seating_arrangement(
    result_sem_1_container_1, result_sem_1_container_2,
    result_sem_3_container_1, result_sem_3_container_2
):
    """
    Generates seating arrangements where:
    - First two seats: result_sem_1_container_1, result_sem_1_container_2
    - Next two seats: result_sem_2_container_2, result_sem_2_container_1
    - This pattern continues until no data is left.

    If a container runs out of data, skip that seat and maintain order.
    Each room has a dynamically assigned number of seats from Firebase.
    """

    try:
        # Initialize Firestore client
        db = firestore.client()

        # Fetch all room numbers and total seats from Firebase
        rooms_ref = db.collection("seat_plan_rooms").stream()
        ROOMS = [
            {
                "room_no": room.to_dict().get("room_no"),
                "total_seats": int(room.to_dict().get("total_seats", 60))  # Default to 60 if not specified
            }
            for room in rooms_ref if "room_no" in room.to_dict()
        ]

        # Sort rooms numerically
        ROOMS.sort(key=lambda x: int(x["room_no"]) if str(x["room_no"]).isdigit() else x["room_no"])

        if not ROOMS:
            print("❌ No rooms found in seat_plan_rooms!")
            return {"status": "error", "message": "No rooms found in database."}

        # Extract student lists from JSON response
        queue_1 = sum([result_sem_1_container_1["seat_plan"].get(dept, []) for dept in ["CSE", "MPE", "SWE", "IPE"]], [])
        queue_2 = sum([result_sem_1_container_2["seat_plan"].get(dept, []) for dept in ["EEE", "CEE", "TVE", "BTM"]], [])
        queue_3 = sum([result_sem_3_container_2["seat_plan"].get(dept, []) for dept in ["BTM", "CEE", "TVE", "EEE"]], [])
        queue_4 = sum([result_sem_3_container_1["seat_plan"].get(dept, []) for dept in ["MPE", "SWE", "IPE", "CSE"]], [])

        seating_plan = {}  # Dictionary to store seating arrangements per room

        # Initialize room structure
        for room in ROOMS:
            seating_plan[room["room_no"]] = []

        room_index = 0  # Track current room
        seat_no = 1  # Track seat number in each room

        # Define the order of seating
        seat_order = [queue_1, queue_2, queue_3, queue_4]  # Rotate in this order

        # Loop until all queues are exhausted
        while any(len(queue) > 0 for queue in seat_order):  # Stop when all lists are empty
            for queue in seat_order:
                if queue:  # If queue is not empty
                    student = queue.pop(0)  # Take first student
                    room_no = ROOMS[room_index]["room_no"]
                    total_seats = ROOMS[room_index]["total_seats"]

                    seating_plan[room_no].append({
                        "room": room_no,
                        "seat_no": seat_no,
                        "id": student["id"],
                        "dept": student["dept"],
                        "semester": student["semester"],
                        "role": student.get("role", "student"),
                        "displayName": student.get("displayName", "")
                    })
                    
                # Move to next seat
                seat_no += 1
                # If room is full, go to next room
                if seat_no > total_seats:
                    seat_no = 1  # Reset seat number
                    room_index += 1  # Move to next room
                    if room_index >= len(ROOMS):  # If no more rooms left, stop
                        break  # Exit the loop

        print("✅ Seating arrangement generated successfully.")
        return {"status": "success", "seating_plan": seating_plan}

    except Exception as e:
        print(f"❌ Error generating seating arrangement: {str(e)}")
        return {"status": "error", "message": str(e)}




# def store_seating_plan_in_firebase(seating_plan, shift):
#     """
#     Stores the generated seating arrangement in Firebase Firestore and updates student records with their room using batch operations.

#     :param seating_plan: Dictionary containing the seating arrangement per room.
#     """
#     try:
#         db = firestore.client()  # Initialize Firestore client
#         seat_plan_collection = f"seat_plan_{shift}"
#         seat_plan_ref = db.collection(seat_plan_collection)  # Firestore Collection
#         users_ref = db.collection("seat_plan_USERS")  # Firestore Collection for users
#         batch = db.batch()

#         for room, seats in seating_plan.items():
#             room_ref = seat_plan_ref.document(str(room))  # Room document

#             for seat in seats:
#                 seat_ref = room_ref.collection("seats").document(str(seat["seat_no"]))
#                 batch.set(seat_ref, seat)  # Add seat data to batch

#                 # Update student's document in seat_plan_USERS collection
#                 student_id = seat["id"]
#                 student_query = users_ref.where("id", "==", student_id).limit(1).stream()

#                 for doc in student_query:
#                     doc_ref = users_ref.document(doc.id)
#                     batch.update(doc_ref, {"room": room})  # Batch update
#                     print(f"✅ Queued update for student {student_id} with room {room} in seat_plan_USERS.")
        
#         batch.commit()  # Commit all batched writes at once
#         print("✅ Seating Plan successfully stored in Firebase Firestore!")
#         return {"status": "success", "message": "Seating plan stored in Firebase and student records updated"}

#     except Exception as e:
#         print(f"❌ Error storing seating plan in Firebase: {str(e)}")
#         return {"status": "error", "message": str(e)}
# from firebase_admin import firestore

def store_seating_plan_in_firebase(seating_plan, shift):
    """
    Stores the generated seating arrangement in Firebase Firestore using efficient batch operations.
    """
    try:
        db = firestore.client()
        seat_plan_collection = f"seat_plan_{shift}"
        users_ref = db.collection("seat_plan_USERS")
        
        # Create multiple batches since a single batch is limited to 500 operations
        MAX_BATCH_SIZE = 450  # Leave some margin below the 500 limit
        batches = []
        current_batch = db.batch()
        operation_count = 0

        # First, collect all student IDs to fetch them in one query
        student_ids = []
        for room_seats in seating_plan.values():
            for seat in room_seats:
                student_ids.append(seat["id"])

        # Fetch all relevant student documents in one query
        student_docs = {}
        for chunk in [student_ids[i:i + 10] for i in range(0, len(student_ids), 10)]:
            query_snapshot = users_ref.where("id", "in", chunk).get()
            for doc in query_snapshot:
                student_docs[doc.to_dict()["id"]] = doc.reference

        # Process seats and create batch operations
        for room_seats in seating_plan.values():
            for seat in room_seats:
                room = str(seat["room"])
                seat_no = str(seat["seat_no"])
                
                # Add seat data
                seat_ref = db.collection(seat_plan_collection).document(room).collection("seats").document(seat_no)
                current_batch.set(seat_ref, seat)
                operation_count += 1

                # Update student's room if found
                if seat["id"] in student_docs:
                    current_batch.update(student_docs[seat["id"]], {"room": room})
                    operation_count += 1

                # Create new batch if current one is near limit
                if operation_count >= MAX_BATCH_SIZE:
                    batches.append(current_batch)
                    current_batch = db.batch()
                    operation_count = 0

        # Add the last batch if it has any operations
        if operation_count > 0:
            batches.append(current_batch)

        # Commit all batches
        for batch in batches:
            batch.commit()

        print(f"✅ Successfully stored seating plan in Firebase using {len(batches)} batches!")
        return {"status": "success", "message": "Seating plan stored in Firebase"}

    except Exception as e:
        print(f"❌ Error storing seating plan in Firebase: {str(e)}")
        return {"status": "error", "message": str(e)}





@app.route('/api/seat-plan-admin-summer', methods=['POST'])
def generate_seat_plan_api():
    """
    Flask API route to generate the seat plan based on four data containers.
    """
    try:
        # Hardcoded example (Replace with actual calls to Firestore)
        result_sem_1_container_1 = generate_seat_plan(["CSE", "MPE", "SWE", "IPE"], 1)
        result_sem_1_container_2 = generate_seat_plan(["EEE","CEE", "TVE","BTM"], 1)

        result_sem_3_container_1 = generate_seat_plan([ "MPE", "SWE", "IPE" ,"CSE"], 3)
        result_sem_3_container_2 = generate_seat_plan(["BTM","CEE", "TVE", "EEE"], 3)

        day_result_sem_5_container_1 = generate_seat_plan(["CSE", "MPE", "SWE", "IPE"], 5)
        day_result_sem_5_container_2 = generate_seat_plan(["EEE","CEE", "TVE","BTM"], 5)

        day_result_sem_7_container_1 = generate_seat_plan([ "MPE", "SWE", "IPE" ,"CSE"], 7)
        day_result_sem_7_container_2 = generate_seat_plan(["BTM","CEE", "TVE", "EEE"], 7)

        # Call the seating function with the retrieved data
        seating_plan = generate_seating_arrangement(
            result_sem_1_container_1, result_sem_1_container_2,
            result_sem_3_container_1, result_sem_3_container_2
        )

        seating_plan_day = generate_seating_arrangement(
            day_result_sem_5_container_1, day_result_sem_5_container_2,
            day_result_sem_7_container_1, day_result_sem_7_container_2
        )
 

         # Store seating plan in Firestore
        firebase_response = store_seating_plan_in_firebase(seating_plan["seating_plan"],"summer_morning")
        firebase_response_day = store_seating_plan_in_firebase(seating_plan_day["seating_plan"],"summer_day")
        # return jsonify(seating_plan)
        # time.sleep(5)
        return jsonify({"status": "success", "message": "Seat plan generated successfully!"}), 200


    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

##################
@app.route('/api/seat-plan-admin-winter', methods=['POST'])
def generate_seat_plan_api_winter():
    """
    Flask API route to generate the seat plan based on four data containers.
    """
    try:
        # Hardcoded example (Replace with actual calls to Firestore)
        result_sem_2_container_1 = generate_seat_plan(["CSE", "MPE", "SWE", "IPE"], 2)
        result_sem_2_container_2 = generate_seat_plan(["EEE","CEE", "TVE","BTM"], 2)

        result_sem_4_container_1 = generate_seat_plan([ "MPE", "SWE", "IPE" ,"CSE"], 4)
        result_sem_4_container_2 = generate_seat_plan(["BTM","CEE", "TVE", "EEE"], 4)

        day_result_sem_6_container_1 = generate_seat_plan(["CSE", "MPE", "SWE", "IPE"], 6)
        day_result_sem_6_container_2 = generate_seat_plan(["EEE","CEE", "TVE","BTM"], 6)

        day_result_sem_8_container_1 = generate_seat_plan([ "MPE", "SWE", "IPE" ,"CSE"], 8)
        day_result_sem_8_container_2 = generate_seat_plan(["BTM","CEE", "TVE", "EEE"], 8)

        # Call the seating function with the retrieved data
        seating_plan = generate_seating_arrangement(
            result_sem_2_container_1, result_sem_2_container_2,
            result_sem_4_container_1, result_sem_4_container_2
        )

        seating_plan_day = generate_seating_arrangement(
            day_result_sem_6_container_1, day_result_sem_6_container_2,
            day_result_sem_8_container_1, day_result_sem_8_container_2
        )
 

        firebase_response = store_seating_plan_in_firebase(seating_plan["seating_plan"],"winter_morning")
        firebase_response_day = store_seating_plan_in_firebase(seating_plan_day["seating_plan"],"winter_day")
        # return jsonify(firebase_response_day)
        return jsonify({"status": "success", "message": "Seat plan generated successfully!"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# Endpoint to generate routine
@app.route('/admin-home/admin-generate-routine', methods=['POST'])
def generate_routine():
    try:
        data = request.get_json()
        season = data.get("season", "winter")  # Default to winter if not specified

        logging.info(f"Generating {season} routine...")

        if season == "summer":
            # Run summer-specific scripts
            subprocess.run(['python', 'scheduler_summer.py'], check=True)
            subprocess.run(['python', 'scheduler_labs_summer.py'], check=True)
            subprocess.run(['python', 'scheduler_enhanced_summer.py'], check=True)
        else:
            # Run winter-specific scripts
            subprocess.run(['python', 'scheduler.py'], check=True)
            subprocess.run(['python', 'scheduler_labs.py'], check=True)
            subprocess.run(['python', 'scheduler_enhanced.py'], check=True)

        # Run common script
        subprocess.run(['python', 'z_stats.py'], check=True)

        logging.info(f"{season.capitalize()} routine generated successfully!")
        return jsonify({"message": f"{season.capitalize()} routine generated successfully!"}), 200

    except subprocess.CalledProcessError as e:
        logging.error(f"Subprocess error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True)

