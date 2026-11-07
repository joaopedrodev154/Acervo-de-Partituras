from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Acervo de Partituras API")

# Libera a comunicação entre o Front-end e o Back-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # No futuro, trocaremos pelo link da Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota de teste para saber se está tudo funcionando
@app.get("/")
def read_root():
    return {"mensagem": "API do Acervo de Partituras rodando com sucesso!"}