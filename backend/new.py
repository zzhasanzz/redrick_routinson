import random
from dataclasses import dataclass
from typing import List, Tuple, Dict
from concurrent.futures import ThreadPoolExecutor

# Define constants for days and time slots
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
TIME_SLOTS = [
    "8:00-9:15", "9:15-10:30", "10:30-11:45", "11:45-1:00",
    "2:30-3:45", "3:45-5:00"
]
CLASSROOMS = ["301", "302", "304", "204", "104", "105"]
SEMESTERS = [1, 3, 5, 7]

# Semester-specific excluded time slots
EXCLUDED_TIME_SLOTS = {
    1: [3, 4, 9, 10, 15, 16],
    3: [5, 6, 13, 14, 27, 28],
    5: [5, 6, 7, 8, 9, 10, 11, 12, 23, 24, 29, 30],
    7: [5, 6, 19, 20, 25, 26]
}

# Course information as data classes
@dataclass
class Course:
    name: str
    credits: int

@dataclass
class ScheduleEntry:
    semester: int
    course: str
    day: str
    time: str
    room: str
    teacher: str  # Added teacher information

# Define courses for each semester
COURSES = {
    1: [("Hum4145", 2), ("Math4141", 3), ("Phy4141", 3), ("CSE4105", 3), ("CSE4107", 3), ("Hum4147", 3), ("HUM4142", 1)],
    3: [("Math4341", 3), ("EEE4383", 3), ("CSE4301", 3), ("CSE4303", 3), ("CSE4305", 3), ("CSE4307", 3)],
    5: [("CSE4501", 3), ("CSE4503", 3), ("CSE4511", 3), ("CSE4513", 3), ("Math4541", 3), ("CSE4539", 3)],
    7: [("Hum4743", 2), ("Math4741", 3), ("CSE4703", 3), ("CSE4709", 3), ("CSE4739", 3), ("CSE4733", 3)],
}

# Teachers for each course
COURSE_TEACHERS = {
    "Hum4145": ["BS"], "Math4141": ["MUA"], "Phy4141": ["FAK"], "CSE4105": ["KH"], "CSE4107": ["MM"], "Hum4147": ["MMH"], "HUM4142": ["AH"],
    "Math4341": ["MKS"], "EEE4383": ["SHR"], "CSE4301": ["FH"], "CSE4303": ["SA"], "CSE4305": ["MHA"], "CSE4307": ["ARMK"],
    "CSE4501": ["MRK"], "CSE4503": ["OR"], "CSE4511": ["SH"], "CSE4513": ["SAH"], "Math4541": ["AKA"], "CSE4539": ["MIA"],
    "Hum4743": ["ZR"], "Math4741": ["MMA"], "CSE4703": ["AZM"], "CSE4709": ["MAMR"], "CSE4739": ["NY"], "CSE4733": ["MBH"],
}

# GA parameters
POPULATION_SIZE = 20
GENERATIONS = 500
MUTATION_RATE = 0.1

def is_valid_slot(semester, course, day, time_slot, room, scheduled_slots, teacher_slots, semester_days):
    """Check if a slot is valid for scheduling considering all constraints."""
    key = (semester, day, time_slot, room)
    teacher = COURSE_TEACHERS[course][0]
    teacher_key = (teacher, day, time_slot)
    
    # Constraint: Exclude semester-specific time slots
    if time_slot in [TIME_SLOTS[i] for i in EXCLUDED_TIME_SLOTS[semester] if i < len(TIME_SLOTS)]:
        return False

    # Constraint: No room or teacher collision at the same time
    if key in scheduled_slots or teacher_key in teacher_slots:
        return False

    # Constraint: Cannot have overlapping classes in the same semester
    if course in semester_days[semester][day]:
        return False

    return True

def create_individual():
    """Create a random individual (schedule) while respecting all constraints."""
    individual = []
    scheduled_slots = {}
    teacher_slots = {}
    semester_days = {semester: {day: [] for day in DAYS} for semester in SEMESTERS}

    for semester in SEMESTERS:
        # Schedule theory classes
        for course in COURSES[semester]:
            credits = course[1]
            sessions_needed = 2 if credits > 1 else 1  # Number of sessions per week based on credits

            for _ in range(sessions_needed):
                while True:
                    day = random.choice(DAYS)
                    time = random.choice(TIME_SLOTS)
                    room = random.choice(CLASSROOMS)
                    teacher = COURSE_TEACHERS[course[0]][0]  # Get teacher for the course

                    # Check slot validity
                    if is_valid_slot(semester, course[0], day, time, room, scheduled_slots, teacher_slots, semester_days):
                        individual.append(ScheduleEntry(semester, course[0], day, time, room, teacher))  # Include teacher
                        scheduled_slots[(semester, day, time, room)] = True
                        teacher_slots[(teacher, day, time)] = True
                        semester_days[semester][day].append(course[0])
                        break

    return individual

def fitness(individual, fitness_cache):
    """Evaluate the fitness of the schedule considering all constraints, using caching."""
    individual_key = tuple((entry.semester, entry.course, entry.day, entry.time, entry.room) for entry in individual)
    
    if individual_key in fitness_cache:
        return fitness_cache[individual_key]

    conflicts = 0
    scheduled_slots = {}
    teacher_slots = {}
    semester_days = {semester: {day: [] for day in DAYS} for semester in SEMESTERS}

    for entry in individual:
        semester, course_or_lab, day, time, room, teacher = entry.semester, entry.course, entry.day, entry.time, entry.room, entry.teacher
        
        # Handle theory classes
        key = (semester, day, time, room)
        teacher_key = (teacher, day, time)

        if key in scheduled_slots or teacher_key in teacher_slots:
            conflicts += 1

        scheduled_slots[key] = True
        teacher_slots[teacher_key] = True
        semester_days[semester][day].append(course_or_lab)

    # Penalty function for conflicts
    penalty = conflicts ** 2  # Example quadratic penalty for conflicts
    
    fitness_value = conflicts + penalty
    fitness_cache[individual_key] = fitness_value  # Cache the result
    return fitness_value

def weighted_selection(population, fitness_cache):
    """Select parents using weighted probability based on fitness."""
    fitness_scores = []
    
    for ind in population:
        # Create a unique key for the individual based on its content
        individual_key = tuple((entry.semester, entry.course, entry.day, entry.time, entry.room) for entry in ind)
        
        # Check if fitness has already been computed
        if individual_key in fitness_cache:
            score = fitness_cache[individual_key]
        else:
            score = 1 / (1 + fitness(ind, fitness_cache))  # Compute fitness
            fitness_cache[individual_key] = score  # Cache the fitness score
        fitness_scores.append(score)
        
    total_fitness = sum(fitness_scores)
    selection_probs = [score / total_fitness for score in fitness_scores]
    selected = random.choices(population, weights=selection_probs, k=1)
    return selected[0]

def crossover(parent1, parent2):
    """Perform crossover between two parents to produce a child."""    
    child = parent1[:len(parent1)//2] + parent2[len(parent2)//2:]  # Simple one-point crossover
    return child

def mutate(individual, mutation_rate):
    """Randomly mutate an individual's schedule."""
    for index in range(len(individual)):
        if random.random() < mutation_rate:
            original = individual[index]
            # Reassign random day, time, and room
            new_day = random.choice(DAYS)
            new_time = random.choice(TIME_SLOTS)
            new_room = random.choice(CLASSROOMS)
            individual[index] = ScheduleEntry(original.semester, original.course, new_day, new_time, new_room, original.teacher)

def genetic_algorithm():
    """Run the genetic algorithm to optimize the schedule."""
    population = [create_individual() for _ in range(POPULATION_SIZE)]
    fitness_cache = {}
    
    for generation in range(GENERATIONS):
        new_population = []

        for _ in range(POPULATION_SIZE):
            parent1 = weighted_selection(population, fitness_cache)
            parent2 = weighted_selection(population, fitness_cache)
            child = crossover(parent1, parent2)
            mutate(child, MUTATION_RATE)
            new_population.append(child)

        population = new_population

    # Find the best individual from the final population
    best_individual = min(population, key=lambda ind: fitness(ind, fitness_cache))
    return best_individual

def write_schedule_to_file(schedule, filename="routine.txt"):
    """Write the final schedule to a text file."""
    with open(filename, "w") as file:
        for entry in schedule:
            file.write(f"{entry.semester}; {entry.course}; {entry.day}; {entry.time}; {entry.room}; {entry.teacher}\n")
    print(f"Schedule written to {filename}")


if __name__ == "__main__":
    final_schedule = genetic_algorithm()
    write_schedule_to_file(final_schedule)  # Write the schedule to a file

