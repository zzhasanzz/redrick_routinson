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

    if data['teacherType'] == 'Full-Time':
        # Append to input.txt
        try:
            with open('input.txt', 'a') as f:
                f.write(f"{data['semester']};{data['name']};{data['credit']};{data['teacher']}\n")
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    elif data['teacherType'] == 'Part-Time':
        # Append to input_pt.txt for both timeslots
        try:
            with open('input_pt.txt', 'a') as f:
                f.write(f"{data['semester']};{data['name']};{data['day1']};{data['time1']};{data['room']};{data['teacher']}\n")
                f.write(f"{data['semester']};{data['name']};{data['day2']};{data['time2']};{data['room']};{data['teacher']}\n")
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

    return jsonify({'status': 'success', 'message': 'Course data saved successfully.'})

@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = []

    # Read from input.txt
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

    # Read from input_pt.txt
    try:
        if not os.path.exists('input_pt.txt'):
            raise FileNotFoundError('input_pt.txt not found.')

        with open('input_pt.txt', 'r') as f:
            for line in f:
                parts = line.strip().split(';')
                if len(parts) != 6:  # Ensure there are exactly 6 parts
                    continue  # Skip malformed lines
                semester, name, day, time, room, teacher = parts
                courses.append({
                    'semester': semester,
                    'name': name,
                    'day': day,
                    'time': time,
                    'room': room,
                    'teacher': teacher,
                    'teacherType': 'Part-Time'  # Mark as part-time
                })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f"Error reading input_pt.txt: {str(e)}"}), 500

    return jsonify({'status': 'success', 'courses': courses})


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
