
import pytesseract
from pdf2image import convert_from_path
# path to tesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_pdf(pdf_path):

    images = convert_from_path(pdf_path)

    full_text = ""

    for img in images:
        text = pytesseract.image_to_string(img)
        full_text += text

    return full_text