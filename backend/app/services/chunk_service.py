from langchain_text_splitters import RecursiveCharacterTextSplitter


def create_chunks(pages):
    """
    Split extracted PDF pages into smaller chunks
    while keeping the original page number.
    """

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = []

    for page in pages:

        page_chunks = splitter.split_text(page["text"])

        for chunk in page_chunks:

            chunks.append({
                "text": chunk,
                "page": page["page"]
            })

    return chunks