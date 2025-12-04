"""
OCR-based transcript parser (optional/stretch feature).
Parses uploaded PDF or image transcripts using pdfplumber + pytesseract.
"""
from typing import List
from app.models import ParsedCourse, ParseTranscriptResponse, ErrorResponse
import base64
from io import BytesIO


def parse_transcript(
    file_content: str,
    file_type: str
) -> ParseTranscriptResponse:
    """
    Parse transcript from uploaded PDF or image.
    
    NOTE: This is a stub implementation. Full OCR parsing is computationally
    intensive and requires additional setup (Tesseract installation, etc.).
    
    To implement:
    1. Install Tesseract OCR on system
    2. Use pdfplumber for PDF text extraction
    3. Use pytesseract for image OCR
    4. Implement pattern matching for course codes, grades, credits
    5. Return confidence scores for each field
    
    Args:
        file_content: Base64 encoded file
        file_type: "pdf" or "image"
    
    Returns:
        ParseTranscriptResponse with parsed courses or error
    """
    
    # Decode base64
    try:
        file_bytes = base64.b64decode(file_content)
    except Exception as e:
        return ParseTranscriptResponse(
            courses=[],
            overallConfidence=0.0,
            warnings=[f"Failed to decode file: {str(e)}", "OCR feature not fully implemented"]
        )
    
    # TODO: Implement actual OCR parsing
    # For now, return a stub response
    return ParseTranscriptResponse(
        courses=[],
        overallConfidence=0.0,
        warnings=[
            "OCR transcript parsing is not yet implemented.",
            "This feature requires Tesseract OCR installation and additional setup.",
            "Please manually enter your courses or use CSV/XLSX import instead."
        ]
    )


# Example implementation sketch (not functional without dependencies):
"""
def parse_pdf_transcript(pdf_bytes: bytes) -> List[ParsedCourse]:
    import pdfplumber
    import re
    
    courses = []
    
    with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            
            # Pattern matching for common transcript formats
            # Example: "CS101   Data Structures   3.0   A   8.0"
            pattern = r'([A-Z]{2,4}\d{3})\s+([A-Za-z\s]+?)\s+([\d.]+)\s+([A-F][+-]?|[OEDCF])\s+([\d.]+)'
            
            matches = re.findall(pattern, text)
            
            for match in matches:
                code, name, credits, grade, gp = match
                courses.append(ParsedCourse(
                    code=code.strip(),
                    name=name.strip(),
                    credits=float(credits),
                    grade=grade.strip(),
                    confidence=0.85  # Would be calculated based on OCR quality
                ))
    
    return courses
"""
