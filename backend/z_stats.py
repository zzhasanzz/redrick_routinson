import json

def analyze_scheduler(file_path):
    with open(file_path, 'r') as f:
        faculty_data = json.load(f)
    
    total_stats = {
        'total_courses': 0,
        'theory_courses': 0,
        'lab_courses': 0,
        'theory_full_matches': 0,
        'lab_full_matches': 0,
        'lab_partial_matches': 0,
        'no_matches': 0,
        'theory_success_rate': 0.0,
        'lab_full_match_percent': 0.0,
        'lab_partial_match_percent': 0.0,
        'faculty_details': {}
    }

    for faculty, data in faculty_data.items():
        faculty_stats = {
            'total_courses': 0,
            'theory': {
                'total': 0,
                'full_matches': 0,
                'match_percent': 0.0,
                'issues': []
            },
            'labs': {
                'total': 0,
                'full_matches': 0,
                'partial_matches': 0,
                'full_match_percent': 0.0,
                'partial_match_percent': 0.0,
                'issues': []
            }
        }

        for course in data['courses']:
            course_type = course['type']
            course_day = course['day']
            course_time = course['time']

            # Increment total courses
            total_stats['total_courses'] += 1
            faculty_stats['total_courses'] += 1

            # Check if the course matches preferred times
            match = any(
                pref['day'] == course_day and pref['time'] == course_time
                for pref in data['preferred_times']
            )

            # Handle theory and lab courses separately
            if course_type == 'theory':
                faculty_stats['theory']['total'] += 1
                total_stats['theory_courses'] += 1

                if match:
                    faculty_stats['theory']['full_matches'] += 1
                    total_stats['theory_full_matches'] += 1
                else:
                    total_stats['no_matches'] += 1
                    faculty_stats['theory']['issues'].append({
                        'course': course['course'],
                        'day': course_day,
                        'time': course_time,
                        'type': 'theory_no_match'
                    })

            elif course_type == 'lab':
                faculty_stats['labs']['total'] += 1
                total_stats['lab_courses'] += 1

                if match:
                    faculty_stats['labs']['full_matches'] += 1
                    total_stats['lab_full_matches'] += 1
                else:
                    # Check for partial matches (only one timeslot matches)
                    partial_match = any(
                        pref['day'] == course_day
                        for pref in data['preferred_times']
                    )
                    if partial_match:
                        faculty_stats['labs']['partial_matches'] += 1
                        total_stats['lab_partial_matches'] += 1
                        faculty_stats['labs']['issues'].append({
                            'course': course['course'],
                            'day': course_day,
                            'time': course_time,
                            'type': 'lab_partial_match'
                        })
                    else:
                        total_stats['no_matches'] += 1
                        faculty_stats['labs']['issues'].append({
                            'course': course['course'],
                            'day': course_day,
                            'time': course_time,
                            'type': 'lab_no_match'
                        })

        # Calculate percentages for faculty
        if faculty_stats['theory']['total'] > 0:
            faculty_stats['theory']['match_percent'] = round(
                (faculty_stats['theory']['full_matches'] / faculty_stats['theory']['total']) * 100, 1
            )

        if faculty_stats['labs']['total'] > 0:
            faculty_stats['labs']['full_match_percent'] = round(
                (faculty_stats['labs']['full_matches'] / faculty_stats['labs']['total']) * 100, 1
            )
            faculty_stats['labs']['partial_match_percent'] = round(
                (faculty_stats['labs']['partial_matches'] / faculty_stats['labs']['total']) * 100, 1
            )

        total_stats['faculty_details'][faculty] = faculty_stats

    # Calculate overall percentages
    if total_stats['theory_courses'] > 0:
        total_stats['theory_success_rate'] = round(
            (total_stats['theory_full_matches'] / total_stats['theory_courses']) * 100, 1
        )

    if total_stats['lab_courses'] > 0:
        total_stats['lab_full_match_percent'] = round(
            (total_stats['lab_full_matches'] / total_stats['lab_courses']) * 100, 1
        )
        total_stats['lab_partial_match_percent'] = round(
            (total_stats['lab_partial_matches'] / total_stats['lab_courses']) * 100, 1
        )

    return total_stats

def print_analysis(stats):
    print(f"\n{' Schedule Match Analysis ':=^60}")
    print(f"Total Courses: {stats['total_courses']}")
    print(f"Theory Courses: {stats['theory_courses']}")
    print(f"Lab Courses: {stats['lab_courses']}")
    print(f"\nTheory Full Matches: {stats['theory_full_matches']} ({stats['theory_success_rate']}%)")
    print(f"Lab Full Matches: {stats['lab_full_matches']} ({stats['lab_full_match_percent']}%)")
    print(f"Lab Partial Matches: {stats['lab_partial_matches']} ({stats['lab_partial_match_percent']}%)")
    print(f"Complete Misses: {stats['no_matches']}")
    
    print(f"\n{' Faculty-wise Performance ':=^60}")
    for faculty, details in stats['faculty_details'].items():
        print(f"\n{faculty}:")
        print(f"  Theory Courses: {details['theory']['total']}")
        print(f"  Theory Match Rate: {details['theory']['match_percent']}%")
        if details['theory']['issues']:
            print("  Theory Issues:")
            for issue in details['theory']['issues']:
                print(f"   - {issue['course']} on {issue['day']} at {issue['time']}")

        print(f"  Lab Courses: {details['labs']['total']}")
        print(f"  Lab Full Match Rate: {details['labs']['full_match_percent']}%")
        print(f"  Lab Partial Match Rate: {details['labs']['partial_match_percent']}%")
        if details['labs']['issues']:
            print("  Lab Issues:")
            for issue in details['labs']['issues']:
                print(f"   - {issue['course']} on {issue['day']} at {issue['time']} ({issue['type']})")

# Run analysis
stats = analyze_scheduler('faculty_details.json')
print_analysis(stats)

# Save full report
with open('scheduler_analysis.json', 'w') as f:
    json.dump(stats, f, indent=2)

print("\nFull analysis saved to scheduler_analysis.json")