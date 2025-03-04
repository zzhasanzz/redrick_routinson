import json
from collections import defaultdict

def check_schedule_collisions(schedule_json):
    """Check for various types of collisions in the lab schedule."""
    TIME_SLOTS = ["8:00-9:15", "9:15-10:30", "10:30-11:45", 
                "11:45-1:00", "2:30-3:45", "3:45-5:00"]
    
    # Initialize tracking structures
    teacher_schedule = defaultdict(lambda: defaultdict(set))
    room_schedule = defaultdict(lambda: defaultdict(set))
    section_schedule = defaultdict(set)  # Fixed: Directly use set for section_schedule
    collisions = []
    time_slot_errors = []

    # Process each lab in the schedule
    for semester in schedule_json['semesters']:
        sem = semester['semester']
        for section in semester['sections']:
            sec = section['section']
            for lab in section['labs']:
                course = lab['course']
                day = lab['day']
                time1 = lab['time1']
                time2 = lab['time2']
                room = lab['room']
                teachers = [lab['teacher1'], lab['teacher2']]

                # 1. Check time slot validity
                try:
                    idx1 = TIME_SLOTS.index(time1)
                    idx2 = TIME_SLOTS.index(time2)
                    if idx2 != idx1 + 1:
                        time_slot_errors.append({
                            'course': course,
                            'semester': sem,
                            'section': sec,
                            'reason': f'Non-consecutive times: {time1} + {time2}'
                        })
                except ValueError:
                    time_slot_errors.append({
                        'course': course,
                        'semester': sem,
                        'section': sec,
                        'reason': f'Invalid time slots: {time1} + {time2}'
                    })

                # 2. Check teacher collisions
                for teacher in teachers:
                    for ts in [time1, time2]:
                        if ts in teacher_schedule[teacher][day]:
                            collisions.append({
                                'type': 'teacher',
                                'teacher': teacher,
                                'course': course,
                                'semester': sem,
                                'section': sec,
                                'day': day,
                                'time': ts,
                                'reason': f'{teacher} teaching multiple labs at {ts} on {day}'
                            })
                        teacher_schedule[teacher][day].add(ts)

                # 3. Check room collisions
                for ts in [time1, time2]:
                    if ts in room_schedule[room][day]:
                        collisions.append({
                            'type': 'room',
                            'room': room,
                            'course': course,
                            'semester': sem,
                            'section': sec,
                            'day': day,
                            'time': ts,
                            'reason': f'Room {room} double-booked at {ts} on {day}'
                        })
                    room_schedule[room][day].add(ts)

                # 4. Check section collisions
                section_key = (sem, sec, day)
                for ts in [time1, time2]:
                    if ts in section_schedule[section_key]:
                        collisions.append({
                            'type': 'section',
                            'course': course,
                            'semester': sem,
                            'section': sec,
                            'day': day,
                            'time': ts,
                            'reason': f'Section {sec} has overlapping labs at {ts} on {day}'
                        })
                    section_schedule[section_key].add(ts)  # Fixed: Now works because section_schedule is a defaultdict(set)

    return {
        'time_slot_errors': time_slot_errors,
        'collisions': collisions
    }

def print_collisions(results):
    """Print the collision results in readable format."""
    if not results['time_slot_errors'] and not results['collisions']:
        print("No collisions found!")
        return

    print("=== Schedule Issues ===")
    
    if results['time_slot_errors']:
        print("\nInvalid Time Slots:")
        for error in results['time_slot_errors']:
            print(f" - {error['course']} (Sem {error['semester']}, Sec {error['section']}): {error['reason']}")

    if results['collisions']:
        print("\nCollisions Detected:")
        collision_types = {}
        for collision in results['collisions']:
            key = f"{collision['type'].title()} Collision"
            collision_types.setdefault(key, []).append(collision['reason'])

        for col_type, reasons in collision_types.items():
            print(f"\n{col_type}:")
            for reason in set(reasons):  # Deduplicate identical messages
                print(f" - {reason}")

# Example usage:
with open('optimized_lab_schedule.json') as f:
    schedule = json.load(f)

results = check_schedule_collisions(schedule)
print_collisions(results)