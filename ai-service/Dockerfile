FROM python:3.11-slim

WORKDIR /app

# Copia apenas requirements primeiro para otimizar o cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Agora copia o restante do código
COPY . .

# Expõe a porta 8001 (a mesma usada no docker-compose.yml)
EXPOSE 8001

# Comando para rodar o servidor FastAPI com Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
