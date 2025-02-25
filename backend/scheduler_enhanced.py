import json
import csv
import random
import copy
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from collections import defaultdict
import time

cred = credentials.Certificate('./ServiceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Constants
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
ROOMS = ["1" , "2" ,"3" , "4" ,"5" , "6" , "301", "302", "304", "204", "104", "105"]
TIME_SLOTS = ["8:00-9:15", "9:15-10:30", "10:30-11:45", "11:45-1:00", "2:30-3:45", "3:45-5:00"]
CLASSROOMS = ["1", "2", "3", "4", "5", "6", "7", "8", "301", "302", "304", "203", "204", "508", "509", "510"]
SECTIONS = ["A", "B"]

def write_routine_to_firestore(scheduled_classes):
    time_mapping = {
        "8:00-9:15": 1,
        "9:15-10:30": 2,
        "10:30-11:45": 3,
        "11:45-1:00": 4,
        "2:30-3:45": 5,
        "3:45-5:00": 6
    }
    day_mapping = {
        "Monday": 0,
        "Tuesday": 1,
        "Wednesday": 2,
        "Thursday": 3,
        "Friday": 4,
        "Saturday": 5,
        "Sunday": 6
    }
    # Create a set of semester-section combinations
    semestersBySections = set()
    for cls in scheduled_classes:
        combination = f"{cls.semester}{cls.section}"  # This will create strings like "1A", "1B", "3A", etc.
        semestersBySections.add(combination)
        # print(semestersBySections)
    
    # Now you can iterate through the combinations
    for semester_section in semestersBySections:
        semester = semester_section[0]  # Gets the first character (the semester number)
        section = semester_section[1]  # Gets the second character (the section letter)
        semester_section_ref = db.collection(f'semester_{cls.semester}_{cls.section}')
        delete_collection(semester_section_ref)
    
    delete_collection(db.collection('time_slots'))
    delete_collection(db.collection('teachers'))

    # Prepare data structures for batch processing
    semester_data = defaultdict(list)
    timeslot_data = defaultdict(list)
    teacher_data = defaultdict(lambda: defaultdict(dict))
    
    # First pass: organize all data
    for cls in scheduled_classes:
        time_1 = cls.times[0] if len(cls.times) > 0 else ""
        time_2 = cls.times[1] if len(cls.times) > 1 else ""
        teacher_1 = cls.teachers[0] if len(cls.teachers) > 0 else ""
        teacher_2 = cls.teachers[1] if len(cls.teachers) > 1 else ""

        day_index = day_mapping.get(cls.day, -1)
        time_index = time_mapping.get(time_1, 0)
        time_slot_1 = day_index * len(time_mapping) + time_index if day_index >= 0 else ""
        course_type = "lab" if time_2 else "theory"

        # Prepare semester data
        semester_key = f'semester_{cls.semester}_{cls.section}'
        doc_data = {
            'perm_course_code': cls.code,
            'perm_course_type': course_type,
            'perm_room': cls.room,
            'perm_teacher_1': teacher_1,
            'perm_teacher_2': teacher_2,
            'perm_day': cls.day,
            'perm_time_1': time_1,
            'perm_time_2': time_2,
            'class_cancelled': 0,
            'rescheduled': 0,
            'temp_course_code': '',
            'temp_course_type': '',
            'temp_room': '',
            'temp_section': '',
            'temp_teacher_1': '',
            'temp_teacher_2': '',
            'temp_day': '',
            'temp_time_1': '',
            'temp_time_2': ''
        }
        semester_data[semester_key].append((str(time_slot_1), doc_data))
        if time_2:
            time_slot_2 = time_slot_1 + 1
            semester_data[semester_key].append((str(time_slot_2), doc_data))

        # Prepare timeslot data
        time_slot_doc = {
            'perm_course_code': cls.code,
            'course_type': course_type,
            'perm_teacher_1': teacher_1,
            'perm_teacher_2': teacher_2,
            'class_cancelled': 0,
            'rescheduled': 0,
            'temp_course_code': '',
            'temp_section': '',
            'temp_teacher_1': '',
            'temp_teacher_2': '',
            'section': cls.section,
        }
        timeslot_data[str(time_slot_1)].append((str(cls.room), time_slot_doc))
        if time_2:
            timeslot_data[str(time_slot_2)].append((str(cls.room), time_slot_doc))

        # Prepare teacher data
        for teacher in [teacher_1, teacher_2]:
            if teacher:
                class_code_with_section = f"{cls.code}_{cls.section}"
                if class_code_with_section not in teacher_data[teacher]:
                    teacher_data[teacher][class_code_with_section] = {
                        'assigned_time_slots': [],
                        'assigned_room': [],
                        'course_type': course_type,
                        'class_cancelled_status': [],
                        'rescheduled_status': [],
                        'assigned_temp_time_slots': [],
                        'assigned_temp_room': []
                    }
                
                teacher_data[teacher][class_code_with_section]['assigned_time_slots'].append(time_slot_1)
                teacher_data[teacher][class_code_with_section]['assigned_room'].append(cls.room)
                teacher_data[teacher][class_code_with_section]['class_cancelled_status'].append(0)
                teacher_data[teacher][class_code_with_section]['rescheduled_status'].append(0)

    # Clear existing data
    delete_collections(['time_slots', 'teachers'])
    for semester_key in semester_data.keys():
        delete_collection(db.collection(semester_key))

    # Batch write with efficient chunking
    def chunked_batch_write(data_dict, collection_path, is_nested=False):
        batch = db.batch()
        count = 0
        batch_limit = 450  # Firestore batch limit is 500, using 450 for safety

        for key, items in data_dict.items():
            if is_nested:
                # Handle nested collections (like timeslots)
                subcoll_ref = db.collection(collection_path).document(key).collection('rooms')
                for doc_id, doc_data in items:
                    batch.set(subcoll_ref.document(doc_id), doc_data)
            else:
                # Handle flat collections
                coll_ref = db.collection(collection_path or key)
                for doc_id, doc_data in items:
                    batch.set(coll_ref.document(doc_id), doc_data)
            
            count += len(items)
            if count >= batch_limit:
                batch.commit()
                batch = db.batch()
                count = 0
                time.sleep(0.5)  # Small delay between batches
        
        if count > 0:
            batch.commit()

    # Execute batch writes in parallel (if possible)
    chunked_batch_write(semester_data, None)
    chunked_batch_write(timeslot_data, 'time_slots', True)
    
    # Write teacher data
    batch = db.batch()
    count = 0
    for teacher, courses in teacher_data.items():
        for course_code, data in courses.items():
            ref = db.collection('teachers').document(teacher).collection('courses').document(course_code)
            batch.set(ref, data)
            count += 1
            if count >= 450:
                batch.commit()
                batch = db.batch()
                count = 0
                time.sleep(0.5)
    
    if count > 0:
        batch.commit()

def delete_collections(collection_names):
    """Delete multiple collections efficiently"""
    for name in collection_names:
        delete_collection(db.collection(name))

def delete_collection(collection_ref, batch_size=500):
    """More efficient collection deletion"""
    docs = collection_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        # Handle subcollections first
        for subcoll in doc.reference.collections():
            delete_collection(subcoll, batch_size)
        
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        return delete_collection(collection_ref, batch_size)

# Initialize semester timeslots with sections and days
semester_timeslots = {
    sem: {sec: {day: {time: False for time in TIME_SLOTS} for day in DAYS} for sec in SECTIONS}
    for sem in [1, 3, 5, 7]
}
course_slots = {}
room_slots = {room: {day: {time: False for time in TIME_SLOTS} for day in DAYS} for room in CLASSROOMS}
teacher_slots = {}

# Define class structure
class Class:
    def __init__(self, semester, section, code, day, times, room, teachers):
        self.semester = semester
        self.section = section
        self.code = code
        self.day = day
        self.times = times
        self.room = room
        self.teachers = teachers


# Load JSON data
def load_json(filename):
    with open(filename, "r") as file:
        return json.load(file)

# Load faculty details
def load_faculty_details(filename="faculty_details.json"):
    with open(filename, "r") as file:
        return json.load(file)


# In the hardcode_labs function:
def hardcode_labs(scheduled, filename="input_file_lab.json"):
    labs_data = load_json(filename)
    for semester in labs_data["semesters"]:
        for section in semester["sections"]:
            for lab in section["labs"]:
                # Create Class instance for lab
                lab_class = Class(
                    semester=semester["semester"],
                    section=section["section"],
                    code=lab["course"],
                    day=lab["day"],
                    times=[lab["time1"], lab["time2"]],
                    room=lab["room"],  # Ensure room is a string
                    teachers=[lab["teacher1"], lab["teacher2"]]
                )
                # Initialize teachers in teacher_slots if not already present
                for teacher in lab_class.teachers:
                    if teacher not in teacher_slots:
                        teacher_slots[teacher] = {day: {time: False for time in TIME_SLOTS} for day in DAYS}
                # Mark slots as occupied
                for time in lab_class.times:
                    semester_timeslots[lab_class.semester][lab_class.section][lab_class.day][time] = True
                    room_slots[lab_class.room][lab_class.day][time] = True
                    for teacher in lab_class.teachers:
                        teacher_slots[teacher][lab_class.day][time] = True
                scheduled.append(lab_class)


# In the hardcode_part_time_teachers function:
def hardcode_part_time_teachers(scheduled, filename="input_file_part_time.json"):
    part_time_data = load_json(filename)
    for semester in part_time_data["semesters"]:
        for section in semester["sections"]:
            for course in section["courses"]:
                for schedule in course["schedule"]:
                    # Create Class instance for part-time class
                    pt_class = Class(
                        semester=semester["semester"],
                        section=section["section"],
                        code=course["course"],
                        day=schedule["day"],
                        times=[schedule["time"]],
                        room=schedule["room"],  # Ensure room is a string
                        teachers=[schedule["teacher"]]
                    )
                    # Initialize teacher in teacher_slots if not already present
                    for teacher in pt_class.teachers:
                        if teacher not in teacher_slots:
                            teacher_slots[teacher] = {day: {time: False for time in TIME_SLOTS} for day in DAYS}
                    # Mark slots as occupied
                    for time in pt_class.times:
                        semester_timeslots[pt_class.semester][pt_class.section][pt_class.day][time] = True
                        room_slots[pt_class.room][pt_class.day][time] = True
                        for teacher in pt_class.teachers:
                            teacher_slots[teacher][pt_class.day][time] = True
                    scheduled.append(pt_class)


# Check for collisions
def has_collision(new_class):
    for time in new_class.times:
        # Block Wednesday afternoon
        if new_class.day == "Wednesday" and time in ["2:30-3:45", "3:45-5:00"]:
            return True
        # Check semester, section, room, and teacher collisions
        if (semester_timeslots[new_class.semester][new_class.section][new_class.day][time] or
            room_slots[new_class.room][new_class.day][time]):
            return True
        for teacher in new_class.teachers:
            if teacher_slots[teacher][new_class.day][time]:
                return True
    return False


# Schedule remaining classes

def is_priority_teacher(teacher, faculty_details):
    rank = faculty_details.get(teacher, {}).get("rank", "")
    return rank in ["Professor", "Assistant Professor"]

# Schedule remaining classes with faculty preferences
def schedule_remaining_classes(classes, scheduled, faculty_details):
    unscheduled_classes = []
    course_days_assigned = defaultdict(list)
    section_counts = {sec: 0 for sec in SECTIONS}
    course_section_counts = {sec: defaultdict(int) for sec in SECTIONS}  # Track class counts per course per section
    day_counts = {day: {sec: 0 for sec in SECTIONS} for day in DAYS}

    # Count current scheduled classes
    for cls in scheduled:
        day_counts[cls.day][cls.section] += 1
        section_counts[cls.section] += 1
        course_section_counts[cls.section][cls.code] += 1

    random.shuffle(classes)  # Randomize for better distribution

    for cls in classes:
        if cls.code not in course_days_assigned:
            course_days_assigned[cls.code] = []

        days_assigned = course_days_assigned[cls.code]
        is_scheduled = False

        # Get the current class counts for this course in each section
        section_class_counts = {
            sec: course_section_counts[sec].get(cls.code, 0)
            for sec in SECTIONS
        }

        # Prioritize the section with fewer classes for this course
        sections_sorted = sorted(
            SECTIONS,
            key=lambda s: section_class_counts[s]
        )

        for section in sections_sorted:
            # Ensure the difference in class counts between sections is not more than 1
            if abs(section_class_counts[section] - section_class_counts[SECTIONS[0]]) > 1:
                continue  # Skip this section to maintain balance

            # Get preferred times for priority teachers
            preferred_times = []
            for teacher in cls.teachers:
                if is_priority_teacher(teacher, faculty_details):
                    preferred_times.extend(faculty_details[teacher].get("preferred_times", []))

            # Sort days by least filled
            days_sorted = sorted(DAYS, key=lambda d: sum(day_counts[d].values()))

            for day in days_sorted:
                if day in days_assigned:
                    continue

                # Try preferred times first
                for pref in preferred_times:
                    if pref["day"] != day:
                        continue
                    time_slot = pref["time"]
                    random.shuffle(CLASSROOMS)
                    for room in CLASSROOMS:
                        new_class = copy.deepcopy(cls)
                        new_class.section = section
                        new_class.day = day
                        new_class.times = [time_slot]
                        new_class.room = room

                        # Initialize teachers in teacher_slots if not already present
                        for teacher in new_class.teachers:
                            if teacher not in teacher_slots:
                                teacher_slots[teacher] = {day: {time: False for time in TIME_SLOTS} for day in DAYS}

                        if not has_collision(new_class):
                            # Mark slots as occupied
                            semester_timeslots[new_class.semester][new_class.section][new_class.day][time_slot] = True
                            room_slots[new_class.room][new_class.day][time_slot] = True
                            for teacher in new_class.teachers:
                                teacher_slots[teacher][new_class.day][time_slot] = True
                            scheduled.append(new_class)
                            days_assigned.append(day)
                            day_counts[day][section] += 1
                            section_counts[section] += 1
                            course_section_counts[section][cls.code] += 1
                            is_scheduled = True
                            break
                    if is_scheduled:
                        break
                if is_scheduled:
                    break

                # If no preferred time works, try all time slots
                if not is_scheduled:
                    for time_slot in TIME_SLOTS:
                        random.shuffle(CLASSROOMS)
                        for room in CLASSROOMS:
                            new_class = copy.deepcopy(cls)
                            new_class.section = section
                            new_class.day = day
                            new_class.times = [time_slot]
                            new_class.room = room

                            # Initialize teachers in teacher_slots if not already present
                            for teacher in new_class.teachers:
                                if teacher not in teacher_slots:
                                    teacher_slots[teacher] = {day: {time: False for time in TIME_SLOTS} for day in DAYS}

                            if not has_collision(new_class):
                                # Mark slots as occupied
                                semester_timeslots[new_class.semester][new_class.section][new_class.day][time_slot] = True
                                room_slots[new_class.room][new_class.day][time_slot] = True
                                for teacher in new_class.teachers:
                                    teacher_slots[teacher][new_class.day][time_slot] = True
                                scheduled.append(new_class)
                                days_assigned.append(day)
                                day_counts[day][section] += 1
                                section_counts[section] += 1
                                course_section_counts[section][cls.code] += 1
                                is_scheduled = True
                                break
                        if is_scheduled:
                            break
                    if is_scheduled:
                        break
            if is_scheduled:
                break

        if not is_scheduled:
            unscheduled_classes.append(cls)

    return unscheduled_classes


# Write schedule to JSON
def write_schedule_to_json(scheduled, filename="final_schedule.json"):
    output = {"semesters": []}
    for cls in scheduled:
        semester = next((s for s in output["semesters"] if s["semester"] == cls.semester), None)
        if not semester:
            semester = {"semester": cls.semester, "sections": []}
            output["semesters"].append(semester)
        
        section = next((s for s in semester["sections"] if s["section"] == cls.section), None)
        if not section:
            section = {"section": cls.section, "courses": [], "labs": []}
            semester["sections"].append(section)
        
        # Handle labs (two time slots and two teachers)
        if len(cls.times) == 2:  # Lab courses have two time slots
            section["labs"].append({
                "course": cls.code,
                "day": cls.day,
                "time1": cls.times[0],
                "time2": cls.times[1],
                "room": cls.room,
                "teachers": cls.teachers
            })
        else:  # Regular courses
            course = next((c for c in section["courses"] if c["course"] == cls.code), None)
            if not course:
                course = {"course": cls.code, "schedule": []}
                section["courses"].append(course)
            
            course["schedule"].append({
                "day": cls.day,
                "time": cls.times[0],
                "room": cls.room,
                "teacher": cls.teachers[0]
            })
    
    with open(filename, "w") as file:
        json.dump(output, file, indent=2)

def write_schedule_to_csv(scheduled, filename="final_schedule.csv"):
    # Organize data by semester, section, day, and time slot
    schedule_data = {}
    for cls in scheduled:
        if cls.semester not in schedule_data:
            schedule_data[cls.semester] = {}
        if cls.section not in schedule_data[cls.semester]:
            schedule_data[cls.semester][cls.section] = {}
        if cls.day not in schedule_data[cls.semester][cls.section]:
            schedule_data[cls.semester][cls.section][cls.day] = {time: "" for time in TIME_SLOTS}
        
        for time in cls.times:
            # Format the class information
            class_info = f"{cls.code} ({cls.room}) - {' + '.join(cls.teachers)}"
            schedule_data[cls.semester][cls.section][cls.day][time] = class_info

    # Write to CSV
    with open(filename, "w", newline="") as file:
        writer = csv.writer(file)
        
        for semester, sections in schedule_data.items():
            for section, days in sections.items():
                # Write header
                writer.writerow([f"Semester {semester}, Section {section}"])
                writer.writerow([""] + TIME_SLOTS)
                
                # Write rows for each day
                for day in DAYS:
                    row = [day]
                    for time_slot in TIME_SLOTS:
                        row.append(days.get(day, {}).get(time_slot, ""))
                    writer.writerow(row)
                
                # Add a blank row between sections
                writer.writerow([])

# Main function
def main():
    scheduled = []
    
    # Hardcode labs and part-time classes
    hardcode_labs(scheduled)
    hardcode_part_time_teachers(scheduled)
    
    # Load regular classes from JSON
    regular_data = load_json("first_schedule.json")
    regular_classes = []
    for semester in regular_data["semesters"]:
        for section in semester["sections"]:
            for course in section["courses"]:
                for schedule in course["schedule"]:
                    regular_classes.append(Class(
                        semester=semester["semester"],
                        section=section["section"],
                        code=course["course"],
                        day=schedule["day"],
                        times=[schedule["time"]],
                        room=schedule["room"],
                        teachers=[schedule["teacher"]]
                    ))
    
    # Load faculty details
    faculty_details = load_faculty_details()
    
    # Schedule remaining classes with faculty preferences
    unscheduled = schedule_remaining_classes(regular_classes, scheduled, faculty_details)
    
    # Write final schedule to JSON
    write_schedule_to_json(scheduled)
    
    # Write final schedule to CSV
    write_schedule_to_csv(scheduled)
    
    write_routine_to_firestore(scheduled)
    
    print(f"Scheduled {len(scheduled)} classes.")
    if unscheduled:
        print(f"Could not schedule {len(unscheduled)} classes.")

# Run the program
if __name__ == "__main__":
    main()