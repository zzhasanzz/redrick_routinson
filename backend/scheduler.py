import random
import json
from deap import base, creator, tools, algorithms
import numpy as np

# Constants
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
TIME_SLOTS = ["8:00-9:15", "9:15-10:30", "10:30-11:45", "11:45-1:00", "2:30-3:45", "3:45-5:00"]
CLASSROOMS = ["103", "104", "105", "204", "205", "301", "302", "304", "508", "509", "510"]
SECTIONS = ["A", "B"]

# Load courses from JSON
with open("input_courses_winter.json", "r") as file:
    data = json.load(file)

# Extract courses and define required classes per course-section
courses = []
required_classes = {}
for semester in data["semesters"]:
    for course in semester["courses"]:
        key = (course["course"], semester["semester"])
        required_classes[key] = {
            "A": 2 if course["credit"] >= 2 else 1,
            "B": 2 if course["credit"] >= 2 else 1
        }
        courses.append({
            "semester": semester["semester"],
            "course": course["course"],
            "credit": course["credit"],
            "teacher": course["teacher"]
        })

# Chromosome: List of tuples (course, semester, section, day, time, room, teacher)
def create_schedule():
    schedule = []
    for course in courses:
        sem = course["semester"]
        crs = course["course"]
        teacher = course["teacher"]
        for section in SECTIONS:
            num_classes = required_classes[(crs, sem)][section]
            for _ in range(num_classes):
                day = random.choice(DAYS)
                time = random.choice(TIME_SLOTS)
                room = random.choice(CLASSROOMS)
                schedule.append((crs, sem, section, day, time, room, teacher))
    return schedule

# Fitness Function
def evaluate_schedule(individual):
    collisions = 0
    teacher_schedule = {}
    room_schedule = {}
    section_schedule = {}
    class_counts = {}

    # Initialize class counts
    for entry in individual:
        crs, sem, sec, _, _, _, _ = entry
        key = (crs, sem, sec)
        class_counts[key] = class_counts.get(key, 0) + 1

    # Penalize missing/extra classes
    for (crs, sem, sec), count in class_counts.items():
        required = required_classes[(crs, sem)][sec]
        if count != required:
            collisions += abs(count - required) * 10  # Heavy penalty

    # Check collisions
    for entry in individual:
        crs, sem, sec, day, time, room, teacher = entry

        # Wednesday constraint
        if day == "Wednesday" and time in ["2:30-3:45", "3:45-5:00"]:
            collisions += 1

        # Teacher collision
        if teacher not in teacher_schedule:
            teacher_schedule[teacher] = set()
        if (day, time) in teacher_schedule[teacher]:
            collisions += 1
        teacher_schedule[teacher].add((day, time))

        # Room collision
        if room not in room_schedule:
            room_schedule[room] = set()
        if (day, time) in room_schedule[room]:
            collisions += 1
        room_schedule[room].add((day, time))

        # Section collision
        key = (sem, sec, day, time)
        if key not in section_schedule:
            section_schedule[key] = set()
        if crs in section_schedule[key]:
            collisions += 1
        section_schedule[key].add(crs)

    return (collisions,)

# Custom Genetic Operators
def cx_course_section(ind1, ind2):
    """Crossover that preserves course-section structure"""
    for i in range(len(ind1)):
        if random.random() < 0.5:
            ind1[i], ind2[i] = ind2[i], ind1[i]
    return ind1, ind2

def mut_course_section(individual):
    """Mutation that only alters time/day/room for a class"""
    idx = random.randint(0, len(individual)-1)
    crs, sem, sec, _, _, _, teacher = individual[idx]
    new_day = random.choice(DAYS)
    new_time = random.choice(TIME_SLOTS)
    new_room = random.choice(CLASSROOMS)
    individual[idx] = (crs, sem, sec, new_day, new_time, new_room, teacher)
    return individual,

# Algorithm Setup
creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
creator.create("Individual", list, fitness=creator.FitnessMin)

toolbox = base.Toolbox()
toolbox.register("individual", tools.initIterate, creator.Individual, create_schedule)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)
toolbox.register("evaluate", evaluate_schedule)
toolbox.register("mate", cx_course_section)
toolbox.register("mutate", mut_course_section)
toolbox.register("select", tools.selTournament, tournsize=3)

# Run Algorithm
population = toolbox.population(n=200)
NGEN = 100
CXPB = 0.7
MUTPB = 0.3

stats = tools.Statistics(lambda ind: ind.fitness.values)
stats.register("min", np.min)
logbook = tools.Logbook()

for gen in range(NGEN):
    offspring = algorithms.varAnd(population, toolbox, cxpb=CXPB, mutpb=MUTPB)
    fits = toolbox.map(toolbox.evaluate, offspring)
    for fit, ind in zip(fits, offspring):
        ind.fitness.values = fit
    population = toolbox.select(offspring, k=len(population))
    record = stats.compile(population)
    logbook.record(gen=gen, **record)
    print(logbook.stream)

# Get best schedule
best = tools.selBest(population, k=1)[0]

# Build the structured output
output = {"semesters": []}

# Create a dictionary to map (course, semester) to credit
credit_lookup = {(course["course"], course["semester"]): course["credit"] for course in courses}

for entry in best:
    crs, sem, sec, day, time, room, teacher = entry
    credit = credit_lookup[(crs, sem)]
    
    # Find or create semester
    semester_entry = next((s for s in output["semesters"] if s["semester"] == sem), None)
    if not semester_entry:
        semester_entry = {"semester": sem, "sections": []}
        output["semesters"].append(semester_entry)
        
    # Find or create section
    section_entry = next((s for s in semester_entry["sections"] if s["section"] == sec), None)
    if not section_entry:
        section_entry = {"section": sec, "courses": []}
        semester_entry["sections"].append(section_entry)
        
    # Find or create course
    course_entry = next((c for c in section_entry["courses"] if c["course"] == crs), None)
    if not course_entry:
        course_entry = {"course": crs, "credit": credit, "schedule": []}
        section_entry["courses"].append(course_entry)
        
    # Add schedule entry
    course_entry["schedule"].append({
        "day": day,
        "time": time,
        "room": room,
        "teacher": teacher
    })

# Write to JSON file
with open("first_schedule.json", "w") as f:
    json.dump(output, f, indent=2)

print("Schedule written to first_schedule.json")