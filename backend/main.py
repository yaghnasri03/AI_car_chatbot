from fastapi import FastAPI, UploadFile, File
from ocr_service import extract_text_from_pdf
import shutil
import os
from llm_service import extract_contract_data
app = FastAPI()

UPLOAD_FOLDER = "contracts"

# create folder if not exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/")
def home():
    return {"message": "Car Contract AI Assistant Running"}

@app.post("/upload-contract")
async def upload_contract(file: UploadFile = File(...)):

    file_location = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text_from_pdf(file_location)

    analysis = extract_contract_data(text)

    return {
        "message": "Contract uploaded and analyzed",
        "ai_analysis": analysis
    }