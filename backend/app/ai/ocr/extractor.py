"""OCR Engine: EasyOCR + PyMuPDF for PDF/image text extraction."""
import io
import tempfile
import os
from typing import Optional

import fitz  # PyMuPDF
import pdfplumber


def extract_text_from_pdf(file_bytes: bytes) -> dict:
    """Extract text from a PDF using PyMuPDF + pdfplumber fallback."""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages_text = []
        for page in doc:
            text = page.get_text("text")
            pages_text.append(text)
        full_text = "\n\n".join(pages_text)
        page_count = len(doc)
        doc.close()

        if full_text.strip():
            return {"text": full_text, "page_count": page_count, "method": "pymupdf"}
    except Exception:
        pass

    # Fallback: pdfplumber
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = [p.extract_text() or "" for p in pdf.pages]
            return {
                "text": "\n\n".join(pages_text),
                "page_count": len(pdf.pages),
                "method": "pdfplumber",
            }
    except Exception as e:
        return {"text": "", "page_count": 0, "method": "error", "error": str(e)}


def extract_text_from_image(file_bytes: bytes) -> dict:
    """Extract text from an image using EasyOCR."""
    try:
        import easyocr
        import numpy as np
        from PIL import Image

        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        img_array = np.array(image)

        reader = easyocr.Reader(["en"], gpu=False)
        results = reader.readtext(img_array, detail=0, paragraph=True)
        text = "\n".join(results)
        return {"text": text, "page_count": 1, "method": "easyocr"}
    except Exception as e:
        return {"text": "", "page_count": 0, "method": "error", "error": str(e)}


def extract_text(file_bytes: bytes, file_type: str) -> dict:
    """Route to correct extractor based on file type."""
    ft = file_type.lower().lstrip(".")
    if ft == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ft in ("png", "jpg", "jpeg", "tiff", "bmp", "webp"):
        return extract_text_from_image(file_bytes)
    elif ft in ("docx", "doc"):
        return _extract_docx(file_bytes)
    return {"text": "", "page_count": 0, "method": "unsupported"}


def _extract_docx(file_bytes: bytes) -> dict:
    """Extract text from DOCX using python-docx."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        text = "\n".join(p.text for p in doc.paragraphs)
        return {"text": text, "page_count": 1, "method": "python-docx"}
    except Exception as e:
        return {"text": "", "page_count": 0, "method": "error", "error": str(e)}
