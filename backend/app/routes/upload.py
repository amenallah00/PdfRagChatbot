
import os
import shutil

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.pdf_service import extract_text_from_pdf
from app.services.vector_service import create_vector_store


router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    # 1. Check file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # 2. Save uploaded PDF
    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. Extract text
    pages = extract_text_from_pdf(file_path)

    if not pages:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the PDF."
        )

    # 4. Create chunks
    chunks = []

    for page in pages:

        text = page["text"]

        # Simple chunking for now
        chunk_size = 1000

        for i in range(0, len(text), chunk_size):

            chunk_text = text[i:i + chunk_size]

            if chunk_text.strip():

                chunks.append({
                    "page": page["page"],
                    "text": chunk_text
                })

    # 5. Create/update vector store
    create_vector_store(
        chunks,
        source=file.filename
    )

    return {
        "message": "PDF uploaded and indexed successfully.",
        "filename": file.filename,
        "pages": len(pages),
        "chunks": len(chunks)
    }

