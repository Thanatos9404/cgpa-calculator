"""
Unit tests for calculation engine.
Tests edge cases, validation rules, and conversion accuracy.
"""
import pytest
from app.calculation import (
    calculate_gpa,
    calculate_cgpa,
    convert_marks_to_grade,
    convert_grade_to_points,
    convert_scale,
    apply_repeat_policy,
    validate_course_data,
    BIT_MESRA_10_POINT,
    STANDARD_4_POINT,
)
from app.models import Course, Semester, GradeType


class TestGPACalculation:
    """Test GPA calculation logic"""
    
    def test_basic_gpa_calculation(self):
        """Test standard GPA calculation"""
        courses = [
            Course(code="CS101", name="Programming", credits=4.0, 
                   gradeType=GradeType.LETTER, grade="A", gradePoint=8.0),
            Course(code="MA101", name="Math", credits=3.0,
                   gradeType=GradeType.LETTER, grade="B", gradePoint=7.0),
        ]
        
        gpa = calculate_gpa(courses)
        expected = (4.0 * 8.0 + 3.0 * 7.0) / (4.0 + 3.0)  # 7.571...
        assert abs(gpa - expected) < 0.001
    
    def test_zero_credit_courses_excluded(self):
        """Zero credit courses should not affect GPA calculation"""
        courses = [
            Course(code="CS101", name="Programming", credits=4.0,
                   gradeType=GradeType.LETTER, grade="A", gradePoint=8.0),
            Course(code="AUDIT", name="Seminar", credits=0.0,
                   gradeType=GradeType.LETTER, grade="A", gradePoint=10.0),
        ]
        
        gpa = calculate_gpa(courses)
        assert gpa == 8.0  # Only CS101 should count
    
    def test_none_grade_points_excluded(self):
        """Courses with None gradePoint (P/F/I/W) should be excluded"""
        courses = [
            Course(code="CS101", name="Programming", credits=4.0,
                   gradeType=GradeType.LETTER, grade="A", gradePoint=8.0),
            Course(code="PF101", name="Pass/Fail", credits=2.0,
                   gradeType=GradeType.LETTER, grade="P", gradePoint=None),
        ]
        
        gpa = calculate_gpa(courses)
        assert gpa == 8.0  # Only CS101 should count
    
    def test_empty_courses_returns_none(self):
        """Empty course list should return None"""
        assert calculate_gpa([]) is None
    
    def test_all_zero_credits_returns_none(self):
        """All zero-credit courses should return None"""
        courses = [
            Course(code="AUDIT1", name="Seminar", credits=0.0,
                   gradeType=GradeType.LETTER, grade="A", gradePoint=10.0),
        ]
        assert calculate_gpa(courses) is None


class TestCGPACalculation:
    """Test cumulative GPA calculation"""
    
    def test_cgpa_across_semesters(self):
        """CGPA should average across all semesters"""
        sem1 = Semester(
            id="s1",
            name="Semester 1",
            courses=[
                Course(code="CS101", name="Prog", credits=4.0,
                       gradeType=GradeType.LETTER, grade="A", gradePoint=8.0),
            ]
        )
        
        sem2 = Semester(
            id="s2",
            name="Semester 2",
            courses=[
                Course(code="CS102", name="DS", credits=4.0,
                       gradeType=GradeType.LETTER, grade="B", gradePoint=7.0),
            ]
        )
        
        cgpa = calculate_cgpa([sem1, sem2])
        expected = (8.0 + 7.0) / 2
        assert cgpa == expected


class TestRepeatPolicy:
    """Test course repeat policies"""
    
    def test_latest_policy(self):
        """Latest attempt should replace previous"""
        courses = [
            Course(code="CS101", name="Prog V1", credits=4.0,
                   gradeType=GradeType.LETTER, grade="C", gradePoint=6.0),
            Course(code="CS101", name="Prog V2", credits=4.0,
                   gradeType=GradeType.LETTER, grade="A", gradePoint=8.0),
        ]
        
        result = apply_repeat_policy(courses, "latest")
        assert len(result) == 1
        assert result[0].gradePoint == 8.0
        assert result[0].name == "Prog V2"
    
    def test_highest_policy(self):
        """Highest gradePoint should be kept"""
        courses = [
            Course(code="CS101", name="Prog V1", credits=4.0,
                   gradeType=GradeType.LETTER, grade="A", gradePoint=8.0),
            Course(code="CS101", name="Prog V2", credits=4.0,
                   gradeType=GradeType.LETTER, grade="B", gradePoint=7.0),
        ]
        
        result = apply_repeat_policy(courses, "highest")
        assert len(result) == 1
        assert result[0].gradePoint == 8.0
        assert result[0].name == "Prog V1"


class TestGradeConversion:
    """Test grade conversion functions"""
    
    def test_marks_to_grade_bit_mesra(self):
        """Test marks to letter conversion for BIT Mesra"""
        assert convert_marks_to_grade(95, BIT_MESRA_10_POINT) == "O"
        assert convert_marks_to_grade(85, BIT_MESRA_10_POINT) == "E"
        assert convert_marks_to_grade(75, BIT_MESRA_10_POINT) == "A"
        assert convert_marks_to_grade(65, BIT_MESRA_10_POINT) == "B"
        assert convert_marks_to_grade(35, BIT_MESRA_10_POINT) == "F"
    
    def test_grade_to_points(self):
        """Test letter grade to points conversion"""
        assert convert_grade_to_points("O", 10, BIT_MESRA_10_POINT) == 10.0
        assert convert_grade_to_points("A", 10, BIT_MESRA_10_POINT) == 8.0
        assert convert_grade_to_points("F", 10, BIT_MESRA_10_POINT) == 0.0
    
    def test_4_point_grade_conversion(self):
        """Test 4-point scale conversions"""
        assert convert_grade_to_points("A+", 4, STANDARD_4_POINT) == 4.0
        assert convert_grade_to_points("B", 4, STANDARD_4_POINT) == 3.0
        assert convert_grade_to_points("C", 4, STANDARD_4_POINT) == 2.0


class TestScaleConversion:
    """Test GPA scale conversion (4 ↔ 10)"""
    
    def test_linear_10_to_4(self):
        """Test linear conversion from 10-point to 4-point"""
        result, formula = convert_scale(10.0, 10, 4, "linear")
        assert result == 4.0
        
        result, formula = convert_scale(5.0, 10, 4, "linear")
        assert result == 2.0
    
    def test_linear_4_to_10(self):
        """Test linear conversion from 4-point to 10-point"""
        result, formula = convert_scale(4.0, 4, 10, "linear")
        assert result == 10.0
        
        result, formula = convert_scale(2.0, 4, 10, "linear")
        assert result == 5.0
    
    def test_official_mapping(self):
        """Test BIT Mesra official mapping"""
        result, formula = convert_scale(9.5, 10, 4, "official")
        assert result == 4.0
        
        result, formula = convert_scale(8.5, 10, 4, "official")
        assert result == 3.7
        
        result, formula = convert_scale(7.5, 10, 4, "official")
        assert result == 3.3
    
    def test_same_scale_returns_value(self):
        """Same scale should return original value"""
        result, formula = convert_scale(8.5, 10, 10, "linear")
        assert result == 8.5


class TestValidation:
    """Test course validation"""
    
    def test_negative_credits_warning(self):
        """Negative credits should generate warning"""
        course = Course(
            code="CS101", name="Prog", credits=-1.0,
            gradeType=GradeType.LETTER, grade="A", gradePoint=8.0
        )
        warnings = validate_course_data(course, 10)
        assert any("Negative credits" in w for w in warnings)
    
    def test_zero_credits_warning(self):
        """Zero credits should generate informational warning"""
        course = Course(
            code="CS101", name="Prog", credits=0.0,
            gradeType=GradeType.LETTER, grade="A", gradePoint=8.0
        )
        warnings = validate_course_data(course, 10)
        assert any("Zero credits" in w for w in warnings)
    
    def test_marks_out_of_range(self):
        """Marks outside 0-100 should warn"""
        course = Course(
            code="CS101", name="Prog", credits=4.0,
            gradeType=GradeType.MARKS, marks=150, gradePoint=8.0
        )
        warnings = validate_course_data(course, 10)
        assert any("out of range" in w for w in warnings)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
