from app.services.pdf_service import extract_text_from_pdf
from app.services.chunk_service import create_chunks


pdf_path = "data/Ismail_Mechkene_PRLens_rapport.pdf"


# Step 1: Extract PDF
pages = extract_text_from_pdf(pdf_path)

print(f"Pages extracted: {len(pages)}")


# Step 2: Create chunks
chunks = create_chunks(pages)

print(f"Total chunks: {len(chunks)}")


# Display first 5 chunks
for i, chunk in enumerate(chunks[:5]):

    print("\n==============================")
    print(f"CHUNK {i + 1}")
    print(f"PAGE: {chunk['page']}")
    print("==============================")

    print(chunk["text"])