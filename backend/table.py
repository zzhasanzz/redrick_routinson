import pandas as pd

# Define the days and time slots
days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
time_slots = ['8:00-9:15', '9:15-10:30', '10:30-11:45', '11:45-1:00', '2:30-3:45', '3:45-5:00']

# Create an empty timetable for each semester
def create_empty_timetable():
    return pd.DataFrame(index=days, columns=time_slots)

# Function to parse the optimal.txt file and return a dictionary of timetables per semester
def parse_optimal_file(filename):
    timetables = {}

    with open(filename, 'r') as file:
        for line in file:
            parts = line.strip().split(';')
            if len(parts) < 6:
                continue

            semester = int(parts[0])
            course = parts[1]
            day = parts[2]
            times = parts[3].split(',')
            room = parts[4]
            teachers = parts[5]

            # If this semester doesn't have a timetable yet, create one
            if semester not in timetables:
                timetables[semester] = create_empty_timetable()

            for time in times:
                timetables[semester].at[day, time] = f"{course} ({room}) - {teachers}"
    return timetables

# Function to save the timetable to a CSV file
def save_timetable_to_csv(timetables):
    for semester, timetable in sorted(timetables.items()):
        filename = f"Semester_{semester}_Routine.csv"
        timetable.to_csv(filename)
        print(f"Saved {filename}")

# Main function to parse the file and save the timetable to CSV
def main():
    filename = 'optimal.txt'  # Path to your optimal.txt file
    timetables = parse_optimal_file(filename)
    save_timetable_to_csv(timetables)

# Run the main function
main()
