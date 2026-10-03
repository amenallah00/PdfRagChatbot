import pymupdf


def extract_text_from_pdf(pdf_path: str):
    """
    Extract text from a PDF while keeping page information.
    """

    document = pymupdf.open(pdf_path)

    pages = []

    for page_number, page in enumerate(document, start=1):
        text = page.get_text()

        if text.strip():
            pages.append({
                "page": page_number,
                "text": text
            })

    document.close()

    return pages