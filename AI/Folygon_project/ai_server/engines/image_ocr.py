from paddleocr import PaddleOCR
import cv2

ocr_model = PaddleOCR(use_angle_cls=True, lang='korean')

def image2text_layer(image_path: str):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("이미지를 불러올 수 없습니다.")

    h, w, _ = image.shape
    result = ocr_model.predict(image)

    tokens = []

    for page in result:
        texts = page.get("rec_texts", [])
        polys = page.get("rec_polys", [])
        scores = page.get("rec_scores", [])

        for text, poly, score in zip(texts, polys, scores):
            if not text.strip():
                continue

            xs = [int(p[0]) for p in poly]
            ys = [int(p[1]) for p in poly]

            tokens.append({
                "text": text,
                "bbox": [min(xs), min(ys), max(xs), max(ys)],
                "confidence": float(score)
            })

    return [{
        "page": 1,
        "width": w,
        "height": h,
        "tokens": tokens
    }]
