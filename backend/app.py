import os
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS

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
