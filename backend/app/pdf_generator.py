"""
PDF generator using WeasyPrint to create high-quality transcript PDFs from HTML.
"""
from typing import Optional, Dict
from weasyprint import HTML, CSS
from io import BytesIO
from datetime import datetime
from app.models import Session, Semester
from app.calculation import calculate_cgpa, calculate_gpa, round_for_display


def generate_html_transcript(
    session: Session,
    chart_images: Optional[Dict[str, str]] = None
) -> str:
    """
    Generate HTML transcript from session data.
    
    Args:
        session: Complete session data
        chart_images: Dict of chart_name -> base64_image_data
    
    Returns:
        HTML string
    """
    cgpa = calculate_cgpa(session.semesters) if session.semesters else None
    cgpa_display = round_for_display(cgpa) if cgpa else "N/A"
    
    # Build semester HTML
    semesters_html = ""
    for idx, semester in enumerate(session.semesters, 1):
        gpa = calculate_gpa(semester.courses)
        gpa_display = round_for_display(gpa) if gpa else "N/A"
        
        courses_rows = ""
        for course in semester.courses:
            gp_display = round_for_display(course.gradePoint) if course.gradePoint else "N/A"
            courses_rows += f"""
                <tr>
                    <td>{course.code}</td>
                    <td>{course.name}</td>
                    <td class="text-center">{course.credits}</td>
                    <td class="text-center">{course.grade or '-'}</td>
                    <td class="text-center">{gp_display}</td>
                </tr>
            """
        
        semesters_html += f"""
        <div class="semester-section">
            <h2>{semester.name}</h2>
            <p class="semester-gpa">Semester GPA: <strong>{gpa_display}</strong></p>
            <table class="courses-table">
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Grade</th>
                        <th>Grade Point</th>
                    </tr>
                </thead>
                <tbody>
                    {courses_rows}
                </tbody>
            </table>
        </div>
        """
    
    # Chart images (if provided)
    charts_html = ""
    if chart_images:
        charts_html = '<div class="charts-section page-break">'
        charts_html += '<h2>Academic Performance Charts</h2>'
        for chart_name, base64_data in chart_images.items():
            charts_html += f'''
                <div class="chart-container">
                    <h3>{chart_name}</h3>
                    <img src="data:image/png;base64,{base64_data}" alt="{chart_name}" />
                </div>
            '''
        charts_html += '</div>'
    
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Academic Transcript</title>
        <style>
            @page {{
                size: A4;
                margin: 2cm;
            }}
            
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 11pt;
                line-height: 1.6;
                color: #333;
            }}
            
            .header {{
                text-align: center;
                margin-bottom: 2em;
                padding-bottom: 1em;
                border-bottom: 3px solid #2563eb;
            }}
            
            .header h1 {{
                font-size: 24pt;
                color: #1e40af;
                margin-bottom: 0.5em;
            }}
            
            .cgpa-display {{
                font-size: 18pt;
                color: #059669;
                font-weight: bold;
                margin: 1em 0;
            }}
            
            .metadata {{
                display: flex;
                justify-content: space-between;
                margin-bottom: 2em;
                font-size: 10pt;
                color: #666;
            }}
            
            .semester-section {{
                margin-bottom: 2em;
                page-break-inside: avoid;
            }}
            
            .semester-section h2 {{
                font-size: 16pt;
                color: #1e40af;
                margin-bottom: 0.5em;
                padding-bottom: 0.3em;
                border-bottom: 2px solid #93c5fd;
            }}
            
            .semester-gpa {{
                font-size: 12pt;
                color: #059669;
                margin-bottom: 1em;
            }}
            
            .courses-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 1em;
            }}
            
            .courses-table thead {{
                background-color: #dbeafe;
            }}
            
            .courses-table th,
            .courses-table td {{
                padding: 0.5em;
                text-align: left;
                border: 1px solid #bfdbfe;
            }}
            
            .courses-table th {{
                font-weight: 600;
                color: #1e40af;
            }}
            
            .text-center {{
                text-align: center;
            }}
            
            .page-break {{
                page-break-before: always;
            }}
            
            .charts-section {{
                margin-top: 2em;
            }}
            
            .chart-container {{
                margin-bottom: 2em;
                text-align: center;
            }}
            
            .chart-container h3 {{
                font-size: 14pt;
                color: #1e40af;
                margin-bottom: 1em;
            }}
            
            .chart-container img {{
                max-width: 100%;
                height: auto;
            }}
            
            .footer {{
                margin-top: 3em;
                padding-top: 1em;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                font-size: 9pt;
                color: #6b7280;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Academic Transcript</h1>
            <p class="cgpa-display">Cumulative GPA: {cgpa_display}</p>
        </div>
        
        <div class="metadata">
            <div>Grading Scale: {session.metadata.scale}-Point</div>
            <div>Generated: {datetime.now().strftime('%B %d, %Y')}</div>
        </div>
        
        {semesters_html}
        
        {charts_html}
        
        <div class="footer">
            <p>This is a computer-generated transcript from CGPA Calculator</p>
            <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
    </body>
    </html>
    """
    
    return html_template


def generate_pdf(
    session: Session,
    chart_images: Optional[Dict[str, str]] = None
) -> bytes:
    """
    Generate PDF from session data.
    
    Args:
        session: Complete session data
        chart_images: Optional dict of base64 encoded chart images
    
    Returns:
        PDF bytes
    """
    html_content = generate_html_transcript(session, chart_images)
    
    # Convert HTML to PDF using WeasyPrint
    pdf_buffer = BytesIO()
    HTML(string=html_content).write_pdf(pdf_buffer)
    
    return pdf_buffer.getvalue()
