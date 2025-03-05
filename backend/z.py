import json
import random

# Preferred time configuration
days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
time_slots = {
    'default': ['8:00-9:15', '9:15-10:30', '10:30-11:45', '11:45-1:00', '2:30-3:45', '3:45-5:00'],
    'wednesday': ['8:00-9:15', '9:15-10:30', '10:30-11:45', '11:45-1:00']
}

def generate_preferred_times(rank):
    """Generate preferred times based on rank with Wednesday restrictions"""
    if rank in ['Professor', 'Associate Professor', 'Assistant Professor']:
        num_slots = random.randint(16, 24)
    elif rank in ['Part-Time']: 
        num_slots = random.randint(12, 16)
    else:
        num_slots = 28
    
    preferred = set()
    
    while len(preferred) < num_slots:
        day = random.choice(days)
        slots = time_slots['wednesday'] if day == 'Wednesday' else time_slots['default']
        time = random.choice(slots)
        preferred.add((day, time))
    
    return [{'day': d, 'time': t} for d, t in preferred]

# Load faculty ranks from JSON file
with open('faculty_ranks.json', 'r') as f:
    faculty_ranks = json.load(f)

# Load or create base faculty data structure
faculty_data = {}

# Read course schedule from final_schedule.json
with open('final_schedule.json', 'r') as file:
    schedule_data = json.load(file)

# Process the schedule data
for semester in schedule_data['semesters']:
    for section in semester['sections']:
        # Process regular (theory) courses
        for course in section['courses']:
            course_code = course['course']
            for schedule in course['schedule']:
                day = schedule['day']
                time_slot = schedule['time']
                teacher = schedule['teacher']

                course_entry = {
                    "course": course_code,
                    "type": "theory",  # Add type field for theory courses
                    "day": day,
                    "time": time_slot
                }

                if teacher:
                    if teacher not in faculty_data:
                        # Get rank from faculty_ranks data
                        rank = faculty_ranks.get(teacher, [{"rank": "Unknown"}])[0]["rank"]
                        
                        # Create new entry with generated preferences
                        faculty_data[teacher] = {
                            "rank": rank,
                            "preferred_times": generate_preferred_times(rank),
                            "courses": [course_entry]
                        }
                    else:
                        # Add course to existing entry
                        faculty_data[teacher]["courses"].append(course_entry)

        # Process lab courses
        if 'labs' in section:
            for lab in section['labs']:
                course_code = lab['course']
                day = lab['day']
                time1 = lab['time1']
                time2 = lab['time2']
                teachers = lab['teachers']

                # Create two separate entries for the lab (one for each timeslot)
                lab_entry1 = {
                    "course": course_code,
                    "type": "lab",  # Add type field for lab courses
                    "day": day,
                    "time": time1
                }

                lab_entry2 = {
                    "course": course_code,
                    "type": "lab",  # Add type field for lab courses
                    "day": day,
                    "time": time2
                }

                # Assign lab entries to each teacher
                for teacher in teachers:
                    if teacher:
                        if teacher not in faculty_data:
                            # Get rank from faculty_ranks data
                            rank = faculty_ranks.get(teacher, [{"rank": "Unknown"}])[0]["rank"]
                            
                            # Create new entry with generated preferences
                            faculty_data[teacher] = {
                                "rank": rank,
                                "preferred_times": generate_preferred_times(rank),
                                "courses": [lab_entry1, lab_entry2]
                            }
                        else:
                            # Add lab entries to existing entry
                            faculty_data[teacher]["courses"].append(lab_entry1)
                            faculty_data[teacher]["courses"].append(lab_entry2)

# Save combined data
with open('faculty_details.json', 'w') as f:
    json.dump(faculty_data, f, indent=2)

print("Faculty data with preferences and courses saved to faculty_details.json")