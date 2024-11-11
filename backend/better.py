import copy
import random

# Days and time slots
days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
time_slots = ['8:00-9:15', '9:15-10:30', '10:30-11:45', '11:45-1:00', '2:30-3:45', '3:45-5:00']

# Initialize the 3D arrays for semester and room slots
semester_timeslots = {sem: {day: {time: False for time in time_slots} for day in days} for sem in [1, 3, 5, 7]}
course_slots = {}
room_numbers = [1, 2, 3, 4, 5, 6, 7, 8, 301, 302, 104, 105, 204, 304]  # Include all used room numbers
room_slots = {room: {day: {time: False for time in time_slots} for day in days} for room in room_numbers}

# Define class structure
class Class:
    def __init__(self, semester, code, day, times, room, teachers):
        self.semester = semester
        self.code = code
        self.day = day
        self.times = times  # List of time slots
        self.room = room
        self.teachers = teachers


def read_lab_assignments_from_file(filename):
    labs = []
    with open(filename, 'r') as file:
        for line in file.readlines():
            parts = line.strip().split(';')
            if len(parts) < 8:  # Ensure the line has all required fields
                continue
            semester = int(parts[0])
            code = parts[1]
            day = parts[2]
            times = [parts[3], parts[4]]  # Two timeslots
            room = int(parts[5])
            teachers = [parts[6], parts[7]]  # Two teachers
            labs.append(Class(semester, code, day, times, room, teachers))
    return labs

# Updated hardcode_labs function to read from the file
def hardcode_labs(scheduled, filename='lab_assignments.txt'):
    lab_assignments = read_lab_assignments_from_file(filename)

    # Mark the assigned time slots as busy
    for lab in lab_assignments:
        for time in lab.times:
            semester_timeslots[lab.semester][lab.day][time] = True
            room_slots[lab.room][lab.day][time] = True
            course_slots[lab.code] = {lab.day: time}
        scheduled.append(lab)


# Read part-time teacher schedule from file and hardcode assignments
def hardcode_part_time_teachers(scheduled, filename='input_pt.txt'):
    with open(filename, 'r') as file:
        for line in file:
            parts = line.strip().split(";")
            if len(parts) != 7:  # Expect 6 parts in the input line
                continue  # Skip malformed lines

            semester = int(parts[0])
            code = parts[1]
            day = parts[3]
            time = parts[4]  # Only one time slot
            room = int(parts[5])
            teachers = [parts[6]]  # Only one teacher for part-time classes

            # Create class instance for part-time teacher
            part_time_class = Class(semester, code, day, [time], room, teachers)

            # Check for collision before scheduling
            if not has_collision(part_time_class):
                # Mark the assigned time slots as busy
                semester_timeslots[part_time_class.semester][part_time_class.day][time] = True
                room_slots[part_time_class.room][part_time_class.day][time] = True
                course_slots[part_time_class.code] = {part_time_class.day: time}
                scheduled.append(part_time_class)  # Add to scheduled classes
            else:
                print(f"Collision detected for part-time class {code} on {day} at {time}.")




# Apply constraints to prevent scheduling on Wednesday from 3:45-5:00
def apply_constraints():
    for sem in semester_timeslots:
        semester_timeslots[sem]["Wednesday"]["2:30-3:45"] = True
        semester_timeslots[sem]["Wednesday"]["3:45-5:00"] = True  # Block the slot for all semesters
    for room in room_slots:
        room_slots[room]["Wednesday"]["2:30-3:45"] = True
        room_slots[room]["Wednesday"]["3:45-5:00"] = True  # Block the slot for all rooms

    

# Check for collisions between classes
def has_collision(new_class):
    # Check for semester, room, or teacher conflicts
    for time in new_class.times:
        # Check if the proposed time slot is in the blocked hours for Wednesday
        if (new_class.day == "Wednesday" and time in ["2:30-3:45"]):
            return True
        if (new_class.day == "Wednesday" and time in ["3:45-5:00"]):
            return True  # Blocked time slot for Wednesday

        # Check semester time slot for collision
        if semester_timeslots[new_class.semester][new_class.day][time]:
            return True  # Semester time slot is busy
        
        # Check room slot for collision
        if room_slots[new_class.room][new_class.day][time]:
            return True  # Room is busy

    return False


def schedule_remaining_classes(classes, scheduled):
    course_days_assigned = {}
    unscheduled_classes = []
    
    # Count scheduled classes per day for balancing
    day_counts = {day: 0 for day in days}

    # Count current scheduled classes for balancing
    for cls in scheduled:
        day_counts[cls.day] += 1

    random.shuffle(classes)  # Randomize the order of classes for better distribution

    for cls in classes:
        if cls.code not in course_days_assigned:
            course_days_assigned[cls.code] = []

        days_assigned = course_days_assigned[cls.code]
        is_scheduled = False

        # Sort days by current class count to prefer less occupied days
        sorted_days = sorted(days, key=lambda d: day_counts[d])

        for day in sorted_days:
            if day in days_assigned:
                continue  # Skip if this course is already scheduled on this day

            for time_slot in time_slots:
                new_class = copy.deepcopy(cls)
                new_class.day = day
                new_class.times = [time_slot]  # Assign only one time slot

                if not has_collision(new_class):
                    # Assign the slot and mark it busy
                    semester_timeslots[new_class.semester][new_class.day][time_slot] = True
                    room_slots[new_class.room][new_class.day][time_slot] = True
                    scheduled.append(new_class)
                    course_slots[cls.code] = {day: time_slot}
                    days_assigned.append(day)  # Mark this day as assigned for this course
                    day_counts[day] += 1  # Increment the count for this day
                    is_scheduled = True
                    break  # Class scheduled, move on to the next one
            if is_scheduled:
                break

        if not is_scheduled:
            unscheduled_classes.append(cls)  # Add the class to unscheduled list if it couldn't be scheduled

    return unscheduled_classes


# Function to display unscheduled classes
def display_unscheduled_classes(unscheduled_classes):
    if not unscheduled_classes:
        print("All classes have been successfully scheduled!")
    else:
        print("The following classes could not be scheduled:")
        for cls in unscheduled_classes:
            print(f"Semester: {cls.semester}, Class: {cls.code}, Room: {cls.room}, Teachers: {' + '.join(cls.teachers)}")

# Sorting function to order classes by semester, day, and time
def sort_classes_key(class_info):
    # Dictionary to sort days
    semester_order = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4}
    time_start = class_info.times[0].split('-')[0]
    return (class_info.semester, semester_order[class_info.day], time_start)

# Function to read the schedule from a file
def read_schedule_from_file(filename):
    with open(filename, 'r') as file:
        file_content = file.read()
    return parse_schedule(file_content)

# Parse the schedule
def parse_schedule(file_content):
    classes = []
    for line in file_content.splitlines():
        if not line.strip():
            continue
        parts = line.split("; ")
        if len(parts) < 6:
            continue
        semester = int(parts[0])
        code = parts[1]
        day = parts[2]
        times = [parts[3]]
        room = int(parts[4])
        teachers = parts[5].split("+")
        classes.append(Class(semester, code, day, times, room, teachers))
    return classes

# Write the optimized schedule to a file
def write_schedule_to_file(filename, scheduled_classes):
    with open(filename, 'w') as file:
        for cls in scheduled_classes:
            line = f"{cls.semester};{cls.code};{cls.day};{','.join(cls.times)};{cls.room};{' + '.join(cls.teachers)}\n"
            file.write(line)

# Main function to run the scheduling process
def main():
    scheduled_classes = []
    hardcode_part_time_teachers(scheduled_classes, 'input_pt.txt')
    hardcode_labs(scheduled_classes, 'lab_assignments.txt')  # Hardcode lab assignments
    remaining_classes = read_schedule_from_file('routine.txt')
    unscheduled_classes = schedule_remaining_classes(remaining_classes, scheduled_classes)

    # Sort the final schedule
    scheduled_classes.sort(key=sort_classes_key)

    # Write the optimized schedule to 'optimal.txt'
    write_schedule_to_file('optimal.txt', scheduled_classes)

    # Check and display unscheduled classes
    display_unscheduled_classes(unscheduled_classes)

# Run the scheduling process
main()
