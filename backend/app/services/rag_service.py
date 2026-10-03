from app.services.vector_service import search_documents
from app.services.llm_service import get_llm


def ask_question(vector_store, question):

    # 1. Retrieve relevant documents
    documents = search_documents(
        vector_store,
        question,
        k=3
    )

    # 2. Build context
    context = "\n\n".join(
        document.page_content
        for document in documents
    )

    # 3. Build prompt
    prompt = f"""
You are an AI assistant that answers questions based only on the provided context.

Context:
{context}

Question:
{question}

Instructions:
- Answer only using the provided context.
- If the answer is not in the context, say that you don't know.
- Do not invent information.

Answer:
"""

    # 4. Get LLM
    llm = get_llm()

    # 5. Generate answer
    response = llm.invoke(prompt)

    # 6. Extract sources
    sources = []

    for document in documents:
        metadata = document.metadata

        source = {
            "page": metadata.get("page", 0),
            "source": metadata.get("source", "Unknown")
        }

        # Avoid duplicate sources
        if source not in sources:
            sources.append(source)

    # 7. Return answer + sources
    return {
        "answer": response.content,
        "sources": sources
    }
