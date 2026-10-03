from app.services.pdf_service import extract_text_from_pdf


pdf_path = "data/Ismail_Mechkene_PRLens_rapport.pdf"

pages = extract_text_from_pdf(pdf_path)

print(f"Number of pages: {len(pages)}")

for page in pages[:3]:
    print("\n==============================")
    print(f"PAGE {page['page']}")
    print("==============================")
    print(page["text"][:1000])