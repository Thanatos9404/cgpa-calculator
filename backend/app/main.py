"""
FastAPI main application with CORS, security, and API endpoints.
"""
from fastapi import FastAPI, HTTPException, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional
import os
from dotenv import load_dotenv
from io import BytesIO

from app.models import (
    ConversionRequest,
    ConversionResponse,
    PDFRequest,
    TemplateListResponse,
    ParseTranscriptRequest,
    ParseTranscriptResponse,
    ErrorResponse,
)
from app.calculation import (
    convert_scale,
    get_builtin_templates,
    round_for_display,
)
from app.pdf_generator import generate_pdf
from app.ocr_parser import parse_transcript

# Import authentication and protected routes
from app.auth.router import router as auth_router
from app.routes.session import router as session_router
from app.routes.peers import router as peers_router
from app.database.connection import init_db

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="CGPA Calculator API",
    description="Backend API for CGPA calculation, scale conversion, PDF generation, and authentication",
    version="2.0.0",
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
api_key = os.getenv("API_KEY", "")  # Empty means no authentication for legacy endpoints

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

# Include authentication and protected routes
app.include_router(auth_router, prefix="/api")
app.include_router(session_router, prefix="/api")
app.include_router(peers_router, prefix="/api")


def verify_api_key(authorization: Optional[str] = Header(None)):
    """Verify API key if authentication is enabled"""
    if api_key and api_key != "":
        if not authorization or authorization != f"Bearer {api_key}":
            raise HTTPException(status_code=401, detail="Invalid or missing API key")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CGPA Calculator API",
        "version": "2.0.0",
        "features": {
            "authentication": True,
            "protected_storage": True,
        }
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": "2025-12-03",
        "features": {
            "conversion": True,
            "pdf_generation": True,
            "templates": True,
            "ocr": False,
            "authentication": True,
            "protected_storage": True,
            "peer_comparison": True,
        }
    }


@app.post("/convert-scale", response_model=ConversionResponse)
async def convert_gpa_scale(
    request: ConversionRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Convert GPA/CGPA between 4-point and 10-point scales.
    
    - **value**: GPA value to convert
    - **fromScale**: Source scale (4 or 10)
    - **toScale**: Target scale (4 or 10)
    - **method**: "linear" or "official" (BIT Mesra mapping)
    """
    verify_api_key(authorization)
    
    try:
        converted_value, formula = convert_scale(
            request.value,
            request.fromScale,
            request.toScale,
            request.method
        )
        
        # Round for display
        converted_value = round_for_display(converted_value)
        
        return ConversionResponse(
            originalValue=request.value,
            convertedValue=converted_value,
            fromScale=request.fromScale,
            toScale=request.toScale,
            method=request.method,
            formula=formula
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/generate-pdf")
async def generate_pdf_transcript(
    request: PDFRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Generate PDF transcript from session data.
    
    - **session**: Complete session data including semesters and courses
    - **includeCharts**: Whether to include charts (default: true)
    - **chartImages**: Base64 encoded chart images (optional)
    """
    verify_api_key(authorization)
    
    try:
        # Generate PDF
        pdf_bytes = generate_pdf(
            request.session,
            request.chartImages if request.includeCharts else None
        )
        
        # Return as downloadable file
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=transcript.pdf"
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@app.get("/official-templates", response_model=TemplateListResponse)
async def get_templates(
    authorization: Optional[str] = Header(None)
):
    """
    Get all built-in grading templates.
    
    Returns templates for:
    - BIT Mesra 10-point scale
    - Standard US 4-point scale
    """
    verify_api_key(authorization)
    
    templates = get_builtin_templates()
    return TemplateListResponse(templates=templates)


@app.post("/parse-transcript", response_model=ParseTranscriptResponse)
async def parse_uploaded_transcript(
    request: ParseTranscriptRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Parse uploaded transcript PDF or image (OCR).
    
    **NOTE**: This feature is not fully implemented and will return a stub response.
    
    - **fileContent**: Base64 encoded file
    - **fileType**: "pdf" or "image"
    """
    verify_api_key(authorization)
    
    try:
        result = parse_transcript(request.fileContent, request.fileType)
        return result
    
    except Exception as e:
        return ParseTranscriptResponse(
            courses=[],
            overallConfidence=0.0,
            warnings=[f"Error parsing transcript: {str(e)}"]
        )


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return ErrorResponse(
        error=exc.detail,
        status="error"
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return ErrorResponse(
        error="Internal server error",
        detail=str(exc),
        status="error"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
