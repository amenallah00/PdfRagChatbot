from app.services.pdf_service import extract_text_from_pdf
from app.services.chunk_service import create_chunks
from app.services.vector_service import create_vector_store, search_documents
from app.services.rag_service import ask_question

# 1. Extract PDF
print("1. Extracting PDF ...")

pdf_path = "data/Ismail_Mechkene_PRLens_rapport.pdf"

pages = extract_text_from_pdf(pdf_path)

print(f"Pages: {len(pages)}")


# 2. Create chunks
print("\n2. Creating chunks ...")

chunks = create_chunks(pages)

print(f"Chunks: {len(chunks)}")


# 3. Create vector database
print("\n3. Creating embeddings and vector database ...")

vector_store = create_vector_store(chunks)

print("Vector database created successfully!")


# 4. Search
print("\n4. Searching for relevant documents ...")

query = "What is artificial intelligence?"

results = search_documents(vector_store, query, k=3)

for i, doc in enumerate(results, 1):
    print(f"\n--- Result {i} ---")
    print(f"Page: {doc.metadata['page']}")
    print(doc.page_content[:500])

    print("\n5. Asking the RAG ...")

question = "What areas does the company work in?"

answer = ask_question(vector_store, question)

print("\nAnswer:")
print(answer)