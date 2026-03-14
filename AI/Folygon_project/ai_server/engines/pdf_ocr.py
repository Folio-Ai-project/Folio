import pdfplumber

def pdf2text_layer(pdf_path: str):
    pages_output=[]

    with pdfplumber.open(pdf_path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tokens = []

            for word in page.extract_words(use_text_flow=True):
                x1 = int(word['x0'])
                y1 = int(word['top'])
                x2 = int(word['x1'])
                y2 = int(word['bottom'])

                tokens.append({
                    'text': word['text'],
                    'bbox': [x1, y1, x2, y2],
                    'font_size': word.get('size')
                })

            pages_output.append({
                'page': page_idx + 1,
                'width': int(page.width),
                'height': int(page.height),
                'tokens': tokens
            })

    return pages_output