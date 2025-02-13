import os
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


@app.route('/api/delete', methods=['DELETE'])
def delete_course():
    data = request.json
    semester = data.get('semester')
    name = data.get('name')
    teacher = data.get('teacher')

    try:
        # Handle Full-Time courses
        if os.path.exists('input.txt'):
            with open('input.txt', 'r') as f:
                lines = f.readlines()
            with open('input.txt', 'w') as f:
                for line in lines:
                    if not line.startswith(f"{semester};{name};") or teacher not in line:
                        f.write(line)

        # Handle Part-Time courses
        if os.path.exists('input_pt.txt'):
            with open('input_pt.txt', 'r') as f:
                lines = f.readlines()
            with open('input_pt.txt', 'w') as f:
                for line in lines:
                    if not line.startswith(f"{semester};{name};") or teacher not in line:
                        f.write(line)

        return jsonify({'status': 'success', 'message': 'Course deleted successfully.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f"Error deleting course: {str(e)}"}), 500

@app.route('/api/update', methods=['PUT'])
def update_course():
    data = request.json  # Get the updated data from the frontend

    try:
        oldCourse= ""
        newTeacher= ""
        semester = data['semester']
        course = data['name']
        new_teacher = data['teacher']
        teacher_type = data['teacherType']

        if teacher_type == 'Full-Time':
            # Update in input.txt
            updated_lines = []
            found = False

            with open('input.txt', 'r') as f:
                for line in f:
                    parts = line.strip().split(';')
                    if len(parts) == 4:  # Ensure correct format
                        line_semester, line_course, credit, teacher = parts
                        if line_semester.strip() == semester.strip() and line_course.strip() == course.strip():
                            oldCourse = line_course
                            newTeacher =new_teacher
                            updated_lines.append(f"{line_semester};{line_course};{credit};{new_teacher}\n")
                            found = True
                        else:
                            updated_lines.append(line)
                    else:
                        updated_lines.append(line)

            if not found:
                return jsonify({'status': 'error', 'message': 'Course not found in input.txt'}), 404

            # Write back to input.txt
            with open('input.txt', 'w') as f:
                f.writelines(updated_lines)

        elif teacher_type == 'Part-Time':
            # Update in input_pt.txt
            updated_lines = []
            found = False

            with open('input_pt.txt', 'r') as f:
                for line in f:
                    parts = line.strip().split(';')
                    if len(parts) == 7:  # Ensure correct format
                        line_semester, line_course, credit, day, time, room, teacher = parts
                        if line_semester.strip() == semester.strip() and line_course.strip() == course.strip():
                            oldCourse = line_course
                            newTeacher =new_teacher
                            updated_lines.append(f"{line_semester};{line_course};{credit};{day};{time};{room};{new_teacher}\n")
                            found = True
                        else:
                            updated_lines.append(line)
                    else:
                        updated_lines.append(line)

            if not found:
                return jsonify({'status': 'error', 'message': 'Course not found in input_pt.txt'}), 404

            # Write back to input_pt.txt
            with open('input_pt.txt', 'w') as f:
                f.writelines(updated_lines)


                # Open and process the optimal.txt file
        with open("optimal.txt", 'r') as file:
            lines = file.readlines()

        updated = False  # Flag to check if any update was made
        updated_lines = []  # List to store updated lines

        for line in lines:
            # Strip newline characters and split by semicolon
            parts = line.strip().split(';')

            # Ensure the line has at least the expected number of parts
            if len(parts) >= 6:
                line_semester = parts[0].strip()  # Trim whitespace
                line_course = parts[1].strip()  # Trim whitespace
                day = parts[2].strip()  # Trim whitespace
                time = parts[3].strip()  # Trim whitespace
                room = parts[4].strip()  # Trim whitespace
                teachers = parts[5].strip()  # Trim whitespace

                # Check if this line matches the course and semester being updated
                if line_semester == semester.strip() and line_course.lower() == oldCourse.strip().lower():
                    # Update the teacher(s)
                    original_teachers = teachers
                    updated_teachers = newTeacher.strip()  # Trim and set the new teacher
                    updated_line = f"{line_semester};{line_course};{day};{time};{room};{updated_teachers}"
                    updated_lines.append(updated_line)
                    updated = True
                    print(f"Updated optimal.txt: {line_course}, {original_teachers} -> {updated_teachers}")
                else:
                    # Keep the line unchanged
                    updated_lines.append(line.strip())
            else:
                # Keep malformed or incomplete lines unchanged
                updated_lines.append(line.strip())

        if not updated:
            print(f"No entries found for course '{oldCourse.strip()}' in optimal.txt. No updates made.")
            return jsonify({'status': 'error', 'message': f"No entries found for course '{oldCourse.strip()}' in optimal.txt."}), 404

        # Write the updated lines back to optimal.txt
        with open("optimal.txt", 'w') as file:
            file.write('\n'.join(updated_lines) + '\n')  # Add a newline at the end

        print("Update completed successfully in optimal.txt.")

        
        subprocess.run(['python', 'table.py'], check=True)


        return jsonify({'status': 'success', 'message': 'Teacher updated successfully.'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500





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
        queue_1 = sum([result_sem_1_container_1["seat_plan"].get(dept, []) for dept in ["CSE", "MPE", "CEE"]], [])
        queue_2 = sum([result_sem_1_container_2["seat_plan"].get(dept, []) for dept in ["EEE","SWE", "IPE", "TVE"]], [])
        queue_3 = sum([result_sem_3_container_2["seat_plan"].get(dept, []) for dept in ["IPE", "TVE", "EEE","SWE"]], [])
        queue_4 = sum([result_sem_3_container_1["seat_plan"].get(dept, []) for dept in ["MPE", "CEE" ,"CSE"]], [])

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

# def store_seating_plan_in_firebase(seating_plan):
#     """
#     Stores the generated seating arrangement in Firebase Firestore.

#     :param seating_plan: Dictionary containing the seating arrangement per room.
#     """
#     try:
#         seat_plan_ref = db.collection("seat_plan")  # Firestore Collection

#         for room, seats in seating_plan.items():
#             room_ref = seat_plan_ref.document(str(room))  # Room document

#             for seat in seats:
#                 seat_ref = room_ref.collection("seats").document(str(seat["seat_no"]))  # Seat document
#                 seat_ref.set(seat)  # Write seat data

#         print("✅ Seating Plan successfully stored in Firebase Firestore!")
#         return {"status": "success", "message": "Seating plan stored in Firebase"}

#     except Exception as e:
#         print(f"❌ Error storing seating plan in Firebase: {str(e)}")
#         return {"status": "error", "message": str(e)}
def store_seating_plan_in_firebase(seating_plan):
    """
    Stores the generated seating arrangement in Firebase Firestore and updates student records with their room.

    :param seating_plan: Dictionary containing the seating arrangement per room.
    """
    try:
        seat_plan_ref = db.collection("seat_plan")  # Firestore Collection
        users_ref = db.collection("seat_plan_USERS")  # Firestore Collection for users

        for room, seats in seating_plan.items():
            room_ref = seat_plan_ref.document(str(room))  # Room document

            for seat in seats:
                seat_ref = room_ref.collection("seats").document(str(seat["seat_no"]))  # Seat document
                seat_ref.set(seat)  # Write seat data

                # Update student's document in seat_plan_USERS collection
                student_id = seat["id"]
                student_query = users_ref.where("id", "==", student_id).limit(1).stream()

                for doc in student_query:
                    doc_ref = users_ref.document(doc.id)
                    doc_ref.update({"room": room})
                    print(f"✅ Updated student {student_id} with room {room} in seat_plan_USERS.")

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
        result_sem_1_container_1 = generate_seat_plan(["CSE", "MPE", "CEE"], 1)
        result_sem_1_container_2 = generate_seat_plan(["EEE","SWE", "IPE", "TVE"], 1)

        result_sem_3_container_1 = generate_seat_plan([ "MPE", "CEE" ,"CSE"], 3)
        result_sem_3_container_2 = generate_seat_plan(["IPE", "TVE", "EEE","SWE"], 3)

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
        subprocess.run(['python', 'new.py'], check=True)
        subprocess.run(['python', 'better.py'], check=True)
        subprocess.run(['python', 'table.py'], check=True)

        # Return success response
        return jsonify({"message": "Routine generated successfully!"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
