import os
import subprocess
from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

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
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
