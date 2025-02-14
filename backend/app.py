import os
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
app = Flask(__name__)
CORS(app)

# Endpoint to save course data
@app.route('/api/save', methods=['POST'])
def save_course():
    data = request.json  # Get JSON data from the request

    try:
        if data['teacherType'] == 'Full-Time':
            # Append to input.txt
            with open('input.txt', 'a') as f:
                f.write(f"{data['semester']};{data['name']};{data['credit']};{data['teacher']}\n")

        elif data['teacherType'] == 'Part-Time':
            # Append to input_pt.txt for both timeslots
            with open('input_pt.txt', 'a') as f:
                f.write(f"{data['semester']};{data['name']};{data['credit']};{data['day1']};{data['time1']};{data['room']};{data['teacher']}\n")
                f.write(f"{data['semester']};{data['name']};{data['credit']};{data['day2']};{data['time2']};{data['room']};{data['teacher']}\n")

        return jsonify({'status': 'success', 'message': 'Course data saved successfully.'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    

    
with open('offered_courses.json', 'r') as file:
    offered_courses = json.load(file)

with open('input_courses.json', 'r') as file:
    input_courses = json.load(file)

with open('faculty_details.json', 'r') as file:
    input_courses = json.load(file)

@app.route('/api/offered-courses', methods=['GET'])
def get_offered_courses():
    try:
        # Return the entire JSON data
        return jsonify(offered_courses)
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

        # Check if input_courses.json has the 'semesters' key
        if 'semesters' not in input_courses:
            return jsonify({"error": "Invalid structure: 'semesters' key not found in input_courses.json"}), 500

        # Update input_courses.json (remove the course)
        for sem in input_courses['semesters']:
            if sem['semester'] == semester:
                sem['courses'] = [c for c in sem['courses'] if c['course'] != course_code]
                break

        # Save changes to files
        with open('offered_courses.json', 'w') as file:
            json.dump(offered_courses, file, indent=2)

        with open('input_courses.json', 'w') as file:
            json.dump(input_courses, file, indent=2)

        return jsonify({"message": "Course deleted successfully"}), 200
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
    
@app.route('/api/unassigned-courses/<int:semester>', methods=['GET'])
def get_unassigned_courses(semester):
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

        # Update offered_courses.json (set assigned to true)
        for sem in offered_courses['semesters']:
            if sem['semester'] == semester:
                for course in sem['courses']:
                    if course['course'] == course_code:
                        course['assigned'] = True
                        course['teacher'] = teacher
                        break
                break

        # Add the course to input_courses.json
        for sem in input_courses['semesters']:
            if sem['semester'] == semester:
                sem['courses'].append({"course": course_code, "credit": 3, "teacher": teacher})
                break

        # Save changes to files
        with open('offered_courses.json', 'w') as file:
            json.dump(offered_courses, file, indent=2)

        with open('input_courses.json', 'w') as file:
            json.dump(input_courses, file, indent=2)

        return jsonify({"message": "Course added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/update-faculty', methods=['POST'])
def update_faculty():
    try:
        data = request.json
        semester = data['semester']
        course_code = data['course']
        new_faculty = data['faculty']

        # Update faculty name in offered_courses.json
        for sem in offered_courses['semesters']:
            if sem['semester'] == semester:
                for course in sem['courses']:
                    if course['course'] == course_code:
                        course['teacher'] = new_faculty
                        break

        # Save changes to file
        with open('offered_courses.json', 'w') as file:
            json.dump(offered_courses, file, indent=2)

        return jsonify({"message": "Faculty updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = []

    # Read from input.txt (Full-Time courses)
    try:
        if not os.path.exists('input.txt'):
            raise FileNotFoundError('input.txt not found.')
        
        with open('input.txt', 'r') as f:
            for line in f:
                parts = line.strip().split(';')
                if len(parts) != 4:  # Ensure there are exactly 4 parts
                    continue  # Skip malformed lines
                semester, name, credit, teacher = parts
                courses.append({
                    'semester': semester,
                    'name': name,
                    'credit': credit,
                    'teacher': teacher,
                    'teacherType': 'Full-Time'  # Assuming full-time for this file
                })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f"Error reading input.txt: {str(e)}"}), 500

    # Read from input_pt.txt (Part-Time courses)
    try:
        if not os.path.exists('input_pt.txt'):
            raise FileNotFoundError('input_pt.txt not found.')

        with open('input_pt.txt', 'r') as f:
            for line in f:
                parts = line.strip().split(';')
                if len(parts) != 7:  # Ensure there are exactly 7 parts
                    continue  # Skip malformed lines
                semester, name, credit, day, time, room, teacher = parts
                courses.append({
                    'semester': semester,
                    'name': name,
                    'credit': credit,  # Add credit information
                    'teacher': teacher,
                    'teacherType': 'Part-Time',  # Mark as part-time
                    # Optional: Remove the following fields if you don't need them
                    'day': day,
                    'time': time,
                    'room': room
                })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f"Error reading input_pt.txt: {str(e)}"}), 500

    return jsonify({'status': 'success', 'courses': courses})


# Endpoint to generate routine
@app.route('/admin-home/admin-dashboard', methods=['POST'])
def generate_routine():
    try:
        # Execute the Python scripts sequentially
        subprocess.run(['python', 'scheduler.py'], check=True)
        subprocess.run(['python', 'scheduler_enhanced.py'], check=True)
        subprocess.run(['python', 'z_stats.py'], check=True)

        # Return success response
        return jsonify({"message": "Routine generated successfully!"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

@app.route('/api/update-preferences', methods=['POST'])
def update_preferences():
    data = request.json  # Get JSON data from the request
    teacher_name = data.get('teacherName')
    preferred_times = data.get('preferredTimes')

    if not teacher_name or not preferred_times:
        return jsonify({'status': 'error', 'message': 'Teacher name and preferred times are required.'}), 400

    try:
        # Load faculty_details.json
        with open('faculty_details.json', 'r') as f:
            faculty_details = json.load(f)

        # Check if the teacher exists in the JSON file
        if teacher_name not in faculty_details:
            return jsonify({'status': 'error', 'message': 'Teacher not found.'}), 404

        # Update the teacher's preferred times
        faculty_details[teacher_name]['preferred_times'] = preferred_times

        # Save the updated data back to the file
        with open('faculty_details.json', 'w') as f:
            json.dump(faculty_details, f, indent=2)

        return jsonify({'status': 'success', 'message': 'Preferences updated successfully.'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    

if __name__ == "__main__":
    app.run(debug=True)
