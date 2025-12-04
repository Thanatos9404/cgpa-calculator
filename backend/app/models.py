"""
Pydantic models for request/response validation and data schemas.
"""
from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field, validator
from enum import Enum


class GradeType(str, Enum):
    """Grade input type"""
    LETTER = "letter"
    MARKS = "marks"


class Course(BaseModel):
    """Individual course data"""
    code: str = Field(..., min_length=1, description="Course code")
    name: str = Field(..., min_length=1, description="Course name")
    credits: float = Field(..., ge=0, description="Course credits (must be >= 0)")
    gradeType: GradeType = Field(..., description="Whether input is letter grade or marks")
    grade: Optional[str] = Field(None, description="Letter grade (A+, A, B+, etc.)")
    marks: Optional[float] = Field(None, ge=0, le=100, description="Marks out of 100")
    gradePoint: Optional[float] = Field(None, description="Calculated grade point")
    
    @validator('credits')
    def validate_credits(cls, v):
        if v < 0:
            raise ValueError("Credits cannot be negative")
        return v
    
    @validator('gradePoint')
    def validate_grade_point(cls, v):
        if v is not None and v < 0:
            raise ValueError("Grade point cannot be negative")
        return v


class Semester(BaseModel):
    """Semester data with courses"""
    id: str = Field(..., description="Unique semester ID")
    name: str = Field(..., min_length=1, description="Semester name")
    courses: List[Course] = Field(default_factory=list, description="List of courses")
    gpa: Optional[float] = Field(None, description="Calculated semester GPA")
    order: int = Field(0, description="Display order")


class GradeMapping(BaseModel):
    """Grade mapping from marks to letter grade to points"""
    minMarks: float = Field(..., ge=0, le=100)
    maxMarks: float = Field(..., ge=0, le=100)
    letterGrade: str
    gradePoint: float = Field(..., ge=0)


class GradeTemplate(BaseModel):
    """Complete grading template"""
    name: str
    scale: Literal[4, 10]
    mappings: List[GradeMapping]
    description: Optional[str] = None


class SessionMetadata(BaseModel):
    """Session metadata"""
    scale: Literal[4, 10] = Field(10, description="Grading scale (4 or 10)")
    roundTo: int = Field(2, description="Decimal places for display")
    repeatPolicy: Literal["latest", "highest", "average"] = Field("latest")
    customTemplate: Optional[str] = Field(None, description="Custom template name")


class Session(BaseModel):
    """Complete user session data"""
    semesters: List[Semester] = Field(default_factory=list)
    metadata: SessionMetadata = Field(default_factory=SessionMetadata)
    customMappings: Optional[List[GradeMapping]] = Field(None)
    cgpa: Optional[float] = Field(None, description="Calculated cumulative GPA")


class ConversionRequest(BaseModel):
    """Request to convert between grading scales"""
    value: float = Field(..., gt=0, description="GPA/CGPA value to convert")
    fromScale: Literal[4, 10]
    toScale: Literal[4, 10]
    method: Literal["official", "linear"] = Field("linear", description="Conversion method")


class ConversionResponse(BaseModel):
    """Response from scale conversion"""
    originalValue: float
    convertedValue: float
    fromScale: int
    toScale: int
    method: str
    formula: Optional[str] = None


class PDFRequest(BaseModel):
    """Request to generate PDF transcript"""
    session: Session
    includeCharts: bool = Field(True, description="Include charts in PDF")
    chartImages: Optional[Dict[str, str]] = Field(None, description="Base64 encoded chart images")


class TemplateListResponse(BaseModel):
    """List of available grading templates"""
    templates: List[GradeTemplate]


class ParseTranscriptRequest(BaseModel):
    """Request to parse uploaded transcript"""
    fileContent: str = Field(..., description="Base64 encoded file content")
    fileType: Literal["pdf", "image"]


class ParsedCourse(BaseModel):
    """Parsed course data with confidence"""
    code: str
    name: str
    credits: float
    grade: str
    confidence: float = Field(..., ge=0, le=1, description="Parsing confidence 0-1")


class ParseTranscriptResponse(BaseModel):
    """Response from transcript parsing"""
    courses: List[ParsedCourse]
    overallConfidence: float
    warnings: List[str] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    status: str = "error"
