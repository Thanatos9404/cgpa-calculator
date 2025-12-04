"""
Core calculation engine for GPA/CGPA computation and grade conversions.
All functions are pure (stateless) for deterministic results.
"""
from typing import List, Dict, Optional, Tuple
from app.models import Course, Semester, GradeMapping, GradeTemplate


# Built-in grading templates
BIT_MESRA_10_POINT = GradeTemplate(
    name="BIT Mesra 10-Point",
    scale=10,
    description="Official BIT Mesra grading system (10-point scale)",
    mappings=[
        GradeMapping(minMarks=91, maxMarks=100, letterGrade="A+/O", gradePoint=10.0),
        GradeMapping(minMarks=81, maxMarks=90, letterGrade="A", gradePoint=9.0),
        GradeMapping(minMarks=71, maxMarks=80, letterGrade="B", gradePoint=8.0),
        GradeMapping(minMarks=61, maxMarks=70, letterGrade="C", gradePoint=7.0),
        GradeMapping(minMarks=51, maxMarks=60, letterGrade="D", gradePoint=6.0),
        GradeMapping(minMarks=41, maxMarks=50, letterGrade="E", gradePoint=5.0),
        GradeMapping(minMarks=0, maxMarks=40, letterGrade="F", gradePoint=0.0),
    ]
)

STANDARD_4_POINT = GradeTemplate(
    name="Standard 4-Point",
    scale=4,
    description="Standard US 4.0 grading scale",
    mappings=[
        GradeMapping(minMarks=93, maxMarks=100, letterGrade="A+", gradePoint=4.0),
        GradeMapping(minMarks=90, maxMarks=92, letterGrade="A", gradePoint=4.0),
        GradeMapping(minMarks=87, maxMarks=89, letterGrade="A-", gradePoint=3.7),
        GradeMapping(minMarks=83, maxMarks=86, letterGrade="B+", gradePoint=3.3),
        GradeMapping(minMarks=80, maxMarks=82, letterGrade="B", gradePoint=3.0),
        GradeMapping(minMarks=77, maxMarks=79, letterGrade="B-", gradePoint=2.7),
        GradeMapping(minMarks=73, maxMarks=76, letterGrade="C+", gradePoint=2.3),
        GradeMapping(minMarks=70, maxMarks=72, letterGrade="C", gradePoint=2.0),
        GradeMapping(minMarks=67, maxMarks=69, letterGrade="C-", gradePoint=1.7),
        GradeMapping(minMarks=63, maxMarks=66, letterGrade="D+", gradePoint=1.3),
        GradeMapping(minMarks=60, maxMarks=62, letterGrade="D", gradePoint=1.0),
        GradeMapping(minMarks=0, maxMarks=59, letterGrade="F", gradePoint=0.0),
    ]
)

# Letter grade direct mappings (when user inputs letter directly)
LETTER_TO_POINTS_10 = {
    "A+/O": 10.0, "A+": 10.0, "O": 10.0,  # All map to 10
    "A": 9.0, 
    "B": 8.0, 
    "C": 7.0, 
    "D": 6.0, 
    "E": 5.0,
    "F": 0.0
}

LETTER_TO_POINTS_4 = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0
}


def get_builtin_templates() -> List[GradeTemplate]:
    """Return all built-in grading templates"""
    return [BIT_MESRA_10_POINT, STANDARD_4_POINT]


def get_template_by_name(name: str) -> Optional[GradeTemplate]:
    """Get template by name"""
    templates = {t.name: t for t in get_builtin_templates()}
    return templates.get(name)


def convert_marks_to_grade(marks: float, template: GradeTemplate) -> str:
    """
    Convert numerical marks (0-100) to letter grade using template.
    
    Args:
        marks: Numerical marks out of 100
        template: Grading template with mappings
    
    Returns:
        Letter grade (e.g., "A", "B+", "O")
    """
    for mapping in template.mappings:
        if mapping.minMarks <= marks <= mapping.maxMarks:
            return mapping.letterGrade
    
    # Fallback: return lowest grade if no mapping found
    return template.mappings[-1].letterGrade


def convert_grade_to_points(
    grade: str, 
    scale: int,
    template: Optional[GradeTemplate] = None
) -> float:
    """
    Convert letter grade to grade points.
    
    Args:
        grade: Letter grade (A+, A, B+, O, E, etc.)
        scale: Grading scale (4 or 10)
        template: Optional custom template, uses default if not provided
    
    Returns:
        Grade point value
    """
    grade = grade.upper().strip()
    
    # Use template if provided
    if template:
        for mapping in template.mappings:
            if mapping.letterGrade.upper() == grade:
                return mapping.gradePoint
    
    # Fall back to standard mappings
    if scale == 10:
        return LETTER_TO_POINTS_10.get(grade, 0.0)
    else:  # scale == 4
        return LETTER_TO_POINTS_4.get(grade, 0.0)


def convert_marks_to_points(
    marks: float,
    template: GradeTemplate
) -> Tuple[str, float]:
    """
    Convert marks directly to grade points via letter grade.
    
    Returns:
        Tuple of (letter_grade, grade_point)
    """
    letter = convert_marks_to_grade(marks, template)
    points = convert_grade_to_points(letter, template.scale, template)
    return letter, points


def calculate_gpa(courses: List[Course]) -> Optional[float]:
    """
    Calculate GPA for a list of courses.
    Formula: sum(gradePoint × credits) / sum(credits)
    
    Rules:
    - Zero-credit courses are ignored (not in denominator)
    - Courses with None gradePoint are skipped (P/F/I/W)
    - Returns None if no valid courses
    
    Args:
        courses: List of Course objects
    
    Returns:
        GPA value or None if cannot calculate
    """
    total_points = 0.0
    total_credits = 0.0
    
    for course in courses:
        # Skip if no grade point assigned (P/F/I/W/Audit)
        if course.gradePoint is None:
            continue
        
        # Skip zero-credit courses (but they're still displayed)
        if course.credits == 0:
            continue
        
        total_points += course.gradePoint * course.credits
        total_credits += course.credits
    
    # Return None if no valid courses
    if total_credits == 0:
        return None
    
    return total_points / total_credits


def calculate_cgpa(semesters: List[Semester]) -> Optional[float]:
    """
    Calculate cumulative GPA across all semesters.
    Treats all courses from all semesters as one pool.
    
    Args:
        semesters: List of Semester objects
    
    Returns:
        CGPA value or None if cannot calculate
    """
    all_courses = []
    for semester in semesters:
        all_courses.extend(semester.courses)
    
    return calculate_gpa(all_courses)


def apply_repeat_policy(
    courses: List[Course],
    policy: str = "latest"
) -> List[Course]:
    """
    Apply repeat policy for duplicate course codes.
    
    Args:
        courses: List of courses (may contain duplicates)
        policy: "latest" (default), "highest", or "average"
    
    Returns:
        Filtered list of courses with policy applied
    """
    if policy == "latest":
        # Keep last occurrence of each course code
        seen = {}
        for course in courses:
            seen[course.code] = course
        return list(seen.values())
    
    elif policy == "highest":
        # Keep highest gradePoint for each course code
        seen = {}
        for course in courses:
            if course.code not in seen:
                seen[course.code] = course
            else:
                # Compare grade points (handle None)
                current_gp = seen[course.code].gradePoint or 0
                new_gp = course.gradePoint or 0
                if new_gp > current_gp:
                    seen[course.code] = course
        return list(seen.values())
    
    elif policy == "average":
        # Average gradePoints for duplicate codes
        from collections import defaultdict
        groups = defaultdict(list)
        for course in courses:
            groups[course.code].append(course)
        
        result = []
        for code, course_list in groups.items():
            if len(course_list) == 1:
                result.append(course_list[0])
            else:
                # Average the grade points
                valid_gps = [c.gradePoint for c in course_list if c.gradePoint is not None]
                if valid_gps:
                    avg_gp = sum(valid_gps) / len(valid_gps)
                    # Use first course as template, update gradePoint
                    merged = course_list[0].copy(deep=True)
                    merged.gradePoint = avg_gp
                    result.append(merged)
                else:
                    result.append(course_list[0])
        
        return result
    
    return courses


def convert_scale(
    value: float,
    from_scale: int,
    to_scale: int,
    method: str = "linear"
) -> Tuple[float, str]:
    """
    Convert GPA/CGPA between 4-point and 10-point scales.
    
    Args:
        value: GPA value to convert
        from_scale: Source scale (4 or 10)
        to_scale: Target scale (4 or 10)
        method: "linear" or "official" (BIT Mesra mapping)
    
    Returns:
        Tuple of (converted_value, formula)
    """
    if from_scale == to_scale:
        return value, "Same scale - no conversion needed"
    
    if method == "official":
        # BIT Mesra official mapping (approximate)
        if from_scale == 10 and to_scale == 4:
            # 10 → 4: Use official conversion table
            if value >= 9.5:
                return 4.0, "Official mapping: 9.5-10.0 → 4.0"
            elif value >= 8.5:
                return 3.7, "Official mapping: 8.5-9.4 → 3.7"
            elif value >= 7.5:
                return 3.3, "Official mapping: 7.5-8.4 → 3.3"
            elif value >= 6.5:
                return 3.0, "Official mapping: 6.5-7.4 → 3.0"
            elif value >= 5.5:
                return 2.7, "Official mapping: 5.5-6.4 → 2.7"
            elif value >= 5.0:
                return 2.0, "Official mapping: 5.0-5.4 → 2.0"
            else:
                return value * 0.4, f"Official mapping: Below 5.0 → {value} × 0.4"
        
        elif from_scale == 4 and to_scale == 10:
            # 4 → 10: Reverse mapping
            if value >= 3.7:
                return 9.0, "Official mapping: 3.7-4.0 → 9.0"
            elif value >= 3.3:
                return 8.0, "Official mapping: 3.3-3.6 → 8.0"
            elif value >= 3.0:
                return 7.0, "Official mapping: 3.0-3.2 → 7.0"
            elif value >= 2.7:
                return 6.0, "Official mapping: 2.7-2.9 → 6.0"
            elif value >= 2.0:
                return 5.5, "Official mapping: 2.0-2.6 → 5.5"
            else:
                return value * 2.5, f"Official mapping: Below 2.0 → {value} × 2.5"
    
    # Linear conversion (default)
    if from_scale == 10 and to_scale == 4:
        converted = (value / 10.0) * 4.0
        return converted, f"Linear: ({value} / 10) × 4"
    else:  # 4 to 10
        converted = (value / 4.0) * 10.0
        return converted, f"Linear: ({value} / 4) × 10"


def validate_course_data(course: Course, scale: int) -> List[str]:
    """
    Validate course data and return list of warnings.
    
    Returns:
        List of warning messages (empty if valid)
    """
    warnings = []
    
    if course.credits < 0:
        warnings.append(f"Course {course.code}: Negative credits not allowed")
    
    if course.credits == 0:
        warnings.append(f"Course {course.code}: Zero credits - will not affect GPA")
    
    if course.gradeType.value == "marks":
        if course.marks is None:
            warnings.append(f"Course {course.code}: Marks not provided")
        elif course.marks < 0 or course.marks > 100:
            warnings.append(f"Course {course.code}: Marks out of range (0-100)")
    
    if course.gradeType.value == "letter":
        if not course.grade:
            warnings.append(f"Course {course.code}: Letter grade not provided")
    
    return warnings


def round_for_display(value: Optional[float], decimals: int = 2) -> Optional[float]:
    """Round value for display (keeps internal precision)"""
    if value is None:
        return None
    return round(value, decimals)
