import os
import re
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import csv
import random
import firebase_admin
from firebase_admin import credentials, firestore



app = Flask(__name__)
CORS(app)

# Firebase Initialization
cred = credentials.Certificate("./ServiceAccountKey.json")  # Update with your Firebase credentials JSON file
firebase_admin.initialize_app(cred)
db = firestore.client()

    
with open('offered_courses.json', 'r') as file:
    offered_courses = json.load(file)

with open('input_courses.json', 'r') as file:
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
    
@app.route('/api/update-faculty', methods=['POST'])
def update_faculty():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        required = ['semester', 'course', 'teacher']
        if not all(key in data for key in required):
            return jsonify({
                "error": f"Missing fields. Required: {', '.join(required)}",
                "received": list(data.keys())
            }), 400

        semester = data['semester']
        course_code = data['course']
        new_teacher = data['teacher']

        # Load fresh data from files
        with open('offered_courses.json', 'r') as f:
            offered = json.load(f)
        with open('input_courses.json', 'r') as f:
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

        # Update input_courses.json
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
            return jsonify({"error": "Course not found in input courses"}), 404

        # Save changes
        with open('offered_courses.json', 'w') as f:
            json.dump(offered, f, indent=2)
        with open('input_courses.json', 'w') as f:
            json.dump(input_courses, f, indent=2)

        return jsonify({"message": "Faculty updated successfully"}), 200

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
    Each room has 60 seats.
    """

    try:
        # List of all rooms (assuming 30 rooms)
        ROOMS = list(range(1, 31))  # Rooms are numbered 1-30
        SEATS_PER_ROOM = 60  # 60 seats per room

        # Extract student lists from JSON response
        queue_1 = sum([result_sem_1_container_1["seat_plan"].get(dept, []) for dept in ["CSE", "MPE", "SWE", "IPE"]], [])
        queue_2 = sum([result_sem_1_container_2["seat_plan"].get(dept, []) for dept in ["EEE","CEE", "TVE"]], [])
        queue_3 = sum([result_sem_3_container_2["seat_plan"].get(dept, []) for dept in ["CEE", "TVE", "EEE"]], [])
        queue_4 = sum([result_sem_3_container_1["seat_plan"].get(dept, []) for dept in ["MPE", "SWE", "IPE" ,"CSE"]], [])

        seating_plan = {}  # Dictionary to store seating arrangements per room

        # Initialize room structure
        for room in ROOMS:
            seating_plan[room] = []

        room_index = 0  # Track current room
        seat_no = 1  # Track seat number in each room

        # Define the order of seating
        seat_order = [queue_1, queue_2, queue_3, queue_4]  # Rotate in this order

        # Loop until all queues are exhausted
        while any(len(queue) > 0 for queue in seat_order):  # Stop when all lists are empty
            for queue in seat_order:
                if queue:  # If queue is not empty
                    student = queue.pop(0)  # Take first student
                    seating_plan[ROOMS[room_index]].append({
                        "room": ROOMS[room_index],
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
                if seat_no > SEATS_PER_ROOM:
                    seat_no = 1  # Reset seat number
                    room_index += 1  # Move to next room
                    if room_index >= len(ROOMS):  # If no more rooms left, stop
                        break  # Exit the loop

        print("✅ Seating arrangement generated successfully.")
        return {"status": "success", "seating_plan": seating_plan}

    except Exception as e:
        print(f"❌ Error generating seating arrangement: {str(e)}")
        return {"status": "error", "message": str(e)}




def store_seating_plan_in_firebase(seating_plan):
    """
    Stores the generated seating arrangement in Firebase Firestore and updates student records with their room using batch operations.

    :param seating_plan: Dictionary containing the seating arrangement per room.
    """
    try:
        db = firestore.client()  # Initialize Firestore client
        seat_plan_ref = db.collection("seat_plan")  # Firestore Collection
        users_ref = db.collection("seat_plan_USERS")  # Firestore Collection for users
        batch = db.batch()

        for room, seats in seating_plan.items():
            room_ref = seat_plan_ref.document(str(room))  # Room document

            for seat in seats:
                seat_ref = room_ref.collection("seats").document(str(seat["seat_no"]))
                batch.set(seat_ref, seat)  # Add seat data to batch

                # Update student's document in seat_plan_USERS collection
                student_id = seat["id"]
                student_query = users_ref.where("id", "==", student_id).limit(1).stream()

                for doc in student_query:
                    doc_ref = users_ref.document(doc.id)
                    batch.update(doc_ref, {"room": room})  # Batch update
                    print(f"✅ Queued update for student {student_id} with room {room} in seat_plan_USERS.")
        
        batch.commit()  # Commit all batched writes at once
        print("✅ Seating Plan successfully stored in Firebase Firestore!")
        return {"status": "success", "message": "Seating plan stored in Firebase and student records updated"}

    except Exception as e:
        print(f"❌ Error storing seating plan in Firebase: {str(e)}")
        return {"status": "error", "message": str(e)}





@app.route('/api/seat-plan', methods=['POST'])
def generate_seat_plan_api():
    """
    Flask API route to generate the seat plan based on four data containers.
    """
    try:
        # Hardcoded example (Replace with actual calls to Firestore)
        result_sem_1_container_1 = generate_seat_plan(["CSE", "MPE", "SWE", "IPE"], 1)
        result_sem_1_container_2 = generate_seat_plan(["EEE","CEE", "TVE"], 1)

        result_sem_3_container_1 = generate_seat_plan([ "MPE", "SWE", "IPE" ,"CSE"], 3)
        result_sem_3_container_2 = generate_seat_plan(["CEE", "TVE", "EEE"], 3)

        # Call the seating function with the retrieved data
        seating_plan = generate_seating_arrangement(
            result_sem_1_container_1, result_sem_1_container_2,
            result_sem_3_container_1, result_sem_3_container_2
        )

         # Store seating plan in Firestore
        firebase_response = store_seating_plan_in_firebase(seating_plan["seating_plan"])

        return jsonify(firebase_response)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


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

if __name__ == "__main__":
    app.run(debug=True)
