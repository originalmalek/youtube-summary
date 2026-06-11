'''
Synchronous document parsing utilities for background job processing.
Supports PDF, DOC, DOCX, and TXT files.
'''

import io
import re
from typing import Optional, Dict, Any


def extract_text_from_pdf(file_content: bytes) -> str:
    '''
    Extract text from PDF file content.
    
    Args:
        file_content: PDF file content as bytes
        
    Returns:
        Extracted text as string
        
    Raises:
        Exception: If PDF parsing fails
    '''
    try:
        import PyPDF2
        
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Check if PDF is encrypted
        if pdf_reader.is_encrypted:
            raise Exception('Password-protected PDF files are not supported.')
        
        # Extract text from all pages
        text_parts = []
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            if text.strip():
                text_parts.append(text)
        
        if not text_parts:
            raise Exception('No readable text found in PDF document.')
            
        return ' '.join(text_parts)
        
    except Exception as e:
        raise Exception(f'Could not parse PDF document: {str(e)}')


def extract_text_from_docx(file_content: bytes) -> str:
    '''
    Extract text from DOCX file content.
    
    Args:
        file_content: DOCX file content as bytes
        
    Returns:
        Extracted text as string
        
    Raises:
        Exception: If DOCX parsing fails
    '''
    try:
        from docx import Document
        
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        
        # Extract text from all paragraphs
        text_parts = []
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if text:
                text_parts.append(text)
        
        # Also extract text from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    text = cell.text.strip()
                    if text:
                        text_parts.append(text)
        
        if not text_parts:
            raise Exception('No readable text found in DOCX document.')
            
        return ' '.join(text_parts)
        
    except Exception as e:
        raise Exception(f'Could not parse DOCX document: {str(e)}')


def extract_text_from_doc(file_content: bytes) -> str:
    '''
    Extract text from DOC file content.
    
    Args:
        file_content: DOC file content as bytes
        
    Returns:
        Extracted text as string
        
    Raises:
        Exception: If DOC parsing fails
    '''
    try:
        import docx2txt
        
        doc_file = io.BytesIO(file_content)
        text = docx2txt.process(doc_file)
        
        if not text or not text.strip():
            raise Exception('No readable text found in DOC document.')
            
        return text.strip()
        
    except Exception as e:
        raise Exception(f'Could not parse DOC document: {str(e)}')


def extract_text_from_txt(file_content: bytes) -> str:
    '''
    Extract text from TXT file content.
    
    Args:
        file_content: TXT file content as bytes
        
    Returns:
        Extracted text as string
        
    Raises:
        Exception: If TXT parsing fails
    '''
    try:
        # Try UTF-8 first, then fall back to other encodings
        encodings = ['utf-8', 'latin-1', 'cp1252']
        
        for encoding in encodings:
            try:
                text = file_content.decode(encoding)
                if text.strip():
                    return text.strip()
            except UnicodeDecodeError:
                continue
        
        raise Exception('Could not decode text file. Please ensure it\'s a valid text file.')
        
    except Exception as e:
        raise Exception(f'Could not parse text file: {str(e)}')


def clean_extracted_text(text: str) -> str:
    '''
    Clean and normalize extracted text.
    
    Args:
        text: Raw extracted text
        
    Returns:
        Cleaned text
    '''
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove excessive newlines
    text = re.sub(r'\n+', '\n', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def extract_text_from_file(file_content: bytes, content_type: str) -> str:
    '''
    Extract text from file based on its content type.
    
    Args:
        file_content: File content as bytes
        content_type: MIME type of the file
        
    Returns:
        Extracted text content
        
    Raises:
        Exception: If file format is unsupported or parsing fails
    '''
    # Check minimum file size
    if len(file_content) < 10:
        raise Exception('File is too small or empty.')
    
    # Extract text based on content type
    if content_type == 'text/plain':
        text = extract_text_from_txt(file_content)
    elif content_type == 'application/pdf':
        text = extract_text_from_pdf(file_content)
    elif content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = extract_text_from_docx(file_content)
    elif content_type == 'application/msword':
        text = extract_text_from_doc(file_content)
    else:
        raise Exception(f'Unsupported file type: {content_type}. Supported formats: TXT, PDF, DOC, DOCX.')
    
    # Clean the extracted text
    text = clean_extracted_text(text)
    
    # Validate minimum text length
    if len(text) < 50:
        raise Exception('Document contains insufficient text content for summarization (minimum 50 characters required).')
    
    # Validate maximum text length (to prevent excessive processing)
    max_chars = 500000  # 500KB of text
    if len(text) > max_chars:
        text = text[:max_chars]
        # Try to cut at a sentence boundary
        last_period = text.rfind('.')
        if last_period > max_chars * 0.8:  # If we find a period in the last 20%
            text = text[:last_period + 1]
    
    return text


def get_file_info(filename: str, file_size: int, content_type: str) -> Dict[str, Any]:
    '''
    Get file information for task storage.
    
    Args:
        filename: Original filename
        file_size: File size in bytes
        content_type: MIME type
        
    Returns:
        Dictionary with file information
    '''
    return {
        'filename': filename,
        'size': file_size,
        'content_type': content_type,
        'size_mb': round(file_size / (1024 * 1024), 2)
    }