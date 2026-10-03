
import os
import shutil

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.models.chat_model import QuestionRequest, AnswerResponse
from app.services.rag_service import ask_question
from app.services.pdf_service import extract_text_from_pdf
from app.services.vector_service import (
    get_vector_store,
    create_vector_store
)


router = APIRouter()

vector_store = get_vector_store()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/ask", response_model=AnswerResponse)
def ask(request: QuestionRequest):

    result = ask_question(
        vector_store,
        request.question
    )

    return AnswerResponse(
        answer=result["answer"],
        sources=result["sources"]
    )


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    # 1. Check that the file is a PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # 2. Save the PDF
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

    chunk_size = 1000

    for page in pages:

        text = page["text"]

        for i in range(0, len(text), chunk_size):

            chunk_text = text[i:i + chunk_size]

            if chunk_text.strip():

                chunks.append({
                    "page": page["page"],
                    "text": chunk_text
                })

    # 5. Add chunks to Chroma
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

