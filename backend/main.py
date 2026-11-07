import os
from fastapi import FastAPI, Depends, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models

# Cria as tabelas se não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Acervo de Partituras API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pasta onde os arquivos enviados serão guardados
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Torna a pasta de uploads acessível publicamente pela web
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/partituras/")
def listar_partituras(db: Session = Depends(get_db)):
    return db.query(models.Partitura).all()

@app.post("/partituras/")
async def criar_partitura(
    titulo: str = Form(...),
    compositor: str = Form(...),
    instrumento: str = Form(...),
    genero: str = Form("Geral"),
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Salva o arquivo fisicamente na pasta uploads
    file_path = os.path.join(UPLOAD_DIR, arquivo.filename)
    with open(file_path, "wb") as buffer:
        content = await arquivo.read()
        buffer.write(content)
    
    # URL pública para aceder ao arquivo
    url_arquivo = f"http://127.0.0.1:8000/uploads/{arquivo.filename}"

    nova_partitura = models.Partitura(
        titulo=titulo,
        compositor=compositor,
        instrumento=instrumento,
        genero=genero,
        url_arquivo=url_arquivo
    )

    db.add(nova_partitura)
    db.commit()
    db.refresh(nova_partitura)

    return {"mensagem": "Partitura salva com sucesso!", "partitura": nova_partitura}