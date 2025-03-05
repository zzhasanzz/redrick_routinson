import random
import json
from deap import base, creator, tools, algorithms
import numpy as np

# Constants
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
TIME_SLOTS = ["8:00-9:15", "9:15-10:30", "10:30-11:45", "11:45-1:00", "2:30-3:45", "3:45-5:00"]
CLASSROOMS = ["1", "2", "3", "4", "5", "6", "7", "8"]
SECTIONS = ["A", "B"]
FORBIDDEN_DAY_TIME = ("Wednesday", "2:30-3:45")

# Load lab courses from JSON
with open("input_file_lab_summer.json", "r") as file:
    data = json.load(file)

# Extract lab courses
labs = []
for semester in data["semesters"]:
    for section in semester["sections"]:
        for lab in section["labs"]:
            labs.append({
                "semester": semester["semester"],
                "section": section["section"],
                "course": lab["course"],
                "teacher1": lab["teacher1"],
                "teacher2": lab["teacher2"]
            })

# Helper: Generate valid time slots avoiding Wednesday 2:30-3:45
def get_valid_time_index():
    valid_indices = []
    for idx in [0, 2, 4]:  # Valid lab start indices
        time1 = TIME_SLOTS[idx]
        time2 = TIME_SLOTS[idx + 1]
        if not (time1 == FORBIDDEN_DAY_TIME[1] or time2 == FORBIDDEN_DAY_TIME[1]):
            valid_indices.append(idx)
    return random.choice(valid_indices)

# Chromosome: List of tuples (course, semester, section, day, time1, time2, room, teacher1, teacher2)
def create_schedule():
    schedule = []
    for lab in labs:
        while True:
            day = random.choice(DAYS)
            time_index = get_valid_time_index()
            time1 = TIME_SLOTS[time_index]
            time2 = TIME_SLOTS[time_index + 1]
            if not (day == FORBIDDEN_DAY_TIME[0] and (time1 == FORBIDDEN_DAY_TIME[1] or time2 == FORBIDDEN_DAY_TIME[1])):
                break
        room = random.choice(CLASSROOMS)
        schedule.append((lab["course"], lab["semester"], lab["section"], day, time1, time2, room, lab["teacher1"], lab["teacher2"]))
    return schedule

# Fitness Function
def evaluate_schedule(individual):
    collisions = 0
    teacher_schedule = {}
    room_schedule = {}
    section_schedule = {}

    for entry in individual:
        crs, sem, sec, day, time1, time2, room, teacher1, teacher2 = entry

        # Check Wednesday constraint
        if day == FORBIDDEN_DAY_TIME[0] and (time1 == FORBIDDEN_DAY_TIME[1] or time2 == FORBIDDEN_DAY_TIME[1]):
            collisions += 1

        # Check consecutive time slots
        time_idx1 = TIME_SLOTS.index(time1)
        time_idx2 = TIME_SLOTS.index(time2)
        if time_idx2 != time_idx1 + 1:
            collisions += 1

        # Teacher collision
        for teacher in [teacher1, teacher2]:
            teacher_schedule.setdefault(teacher, set())
            if (day, time1) in teacher_schedule[teacher] or (day, time2) in teacher_schedule[teacher]:
                collisions += 1
            teacher_schedule[teacher].update([(day, time1), (day, time2)])

        # Room collision
        room_schedule.setdefault(room, set())
        if (day, time1) in room_schedule[room] or (day, time2) in room_schedule[room]:
            collisions += 1
        room_schedule[room].update([(day, time1), (day, time2)])

        # Section collision
        key = (sem, sec, day)
        section_schedule.setdefault(key, set())
        if (time1, time2) in section_schedule[key]:
            collisions += 1
        section_schedule[key].add((time1, time2))

    return (collisions,)

# Custom Genetic Operators
def cx_uniform(ind1, ind2):
    """Uniform crossover preserving lab structure"""
    for i in range(len(ind1)):
        if random.random() < 0.5:
            ind1[i], ind2[i] = ind2[i], ind1[i]
    return ind1, ind2

def mut_lab_schedule(individual):
    """Mutation with strict time/day validation"""
    idx = random.randint(0, len(individual)-1)
    crs, sem, sec, _, _, _, room, teacher1, teacher2 = individual[idx]
    while True:
        new_day = random.choice(DAYS)
        time_index = get_valid_time_index()
        new_time1 = TIME_SLOTS[time_index]
        new_time2 = TIME_SLOTS[time_index + 1]
        if not (new_day == FORBIDDEN_DAY_TIME[0] and (new_time1 == FORBIDDEN_DAY_TIME[1] or new_time2 == FORBIDDEN_DAY_TIME[1])):
            break
    new_room = random.choice(CLASSROOMS)
    individual[idx] = (crs, sem, sec, new_day, new_time1, new_time2, new_room, teacher1, teacher2)
    return individual,

# Algorithm Setup
creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
creator.create("Individual", list, fitness=creator.FitnessMin)

toolbox = base.Toolbox()
toolbox.register("individual", tools.initIterate, creator.Individual, create_schedule)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)
toolbox.register("evaluate", evaluate_schedule)
toolbox.register("mate", cx_uniform)
toolbox.register("mutate", mut_lab_schedule)
toolbox.register("select", tools.selTournament, tournsize=5)

# Elitism (preserve top 10 individuals)
def elitism(population, elite_size=10):
    elites = tools.selBest(population, k=elite_size)
    return elites

# Run Algorithm
population = toolbox.population(n=500)
NGEN = 100
CXPB = 0.9
MUTPB = 0.4

stats = tools.Statistics(lambda ind: ind.fitness.values)
stats.register("min", np.min)
logbook = tools.Logbook()

for gen in range(NGEN):
    offspring = algorithms.varAnd(population, toolbox, cxpb=CXPB, mutpb=MUTPB)
    elites = elitism(population)
    offspring = elites + offspring
    fits = toolbox.map(toolbox.evaluate, offspring)
    for fit, ind in zip(fits, offspring):
        ind.fitness.values = fit
    population = toolbox.select(offspring, k=len(population))
    record = stats.compile(population)
    logbook.record(gen=gen, **record)
    print(logbook.stream)

# Get best schedule (collision-free)
best = tools.selBest(population, k=1)[0]

# Build the structured output
output = {"semesters": []}

for entry in best:
    crs, sem, sec, day, time1, time2, room, teacher1, teacher2 = entry
    
    # Find or create semester
    semester_entry = next((s for s in output["semesters"] if s["semester"] == sem), None)
    if not semester_entry:
        semester_entry = {"semester": sem, "sections": []}
        output["semesters"].append(semester_entry)
        
    # Find or create section
    section_entry = next((s for s in semester_entry["sections"] if s["section"] == sec), None)
    if not section_entry:
        section_entry = {"section": sec, "labs": []}
        semester_entry["sections"].append(section_entry)
        
    # Add lab entry
    section_entry["labs"].append({
        "course": crs,
        "day": day,
        "time1": time1,
        "time2": time2,
        "room": room,
        "teacher1": teacher1,
        "teacher2": teacher2
    })

# Write to JSON file
with open("optimized_lab_schedule_summer.json", "w") as f:
    json.dump(output, f, indent=2)

print("Optimized lab schedule written to optimized_lab_schedule.json")