# 📘 AI Service – Weather Insights Microservice

Este microserviço é responsável por gerar insights inteligentes baseados em dados climáticos do sistema GDASH. Ele funciona como um módulo independente, escrito em Python + FastAPI, utilizando modelos de IA (OpenAI) para transformar os dados meteorológicos em informações úteis, como:

* Resumo do clima
* Tendências observadas
* Alertas importantes
* Classificação geral das condições

O serviço é chamado diretamente pela API NestJS, que então entrega os insights ao frontend do Dashboard.

---

## 🚀 Tecnologias Utilizadas

* Python 3.11
* FastAPI
* OpenAI API
* Uvicorn
* Requests
* Docker
* Docker Compose
* JSON structured prompting

---

## 🧩 Arquitetura do Microserviço

Este serviço recebe registros climáticos via:
```
POST /generate-insights
```

E retorna JSON estruturado, sempre neste formato:
```json
{
  "resumo": "...",
  "tendencias": ["...", "..."],
  "alertas": ["...", "..."],
  "classificacao": "..."
}
```

Caso o modelo não consiga gerar JSON válido, é retornado:
```json
{
  "insights": "texto bruto retornado pelo modelo"
}
```

Isso garante robustez e evita que o frontend quebre.

---

## 📁 Estrutura de Pastas
```
ai-service/
├── main.py
├── utils/
│   └── prompt.py
├── requirements.txt
└── Dockerfile
```

---

## ⚙️ Variáveis de Ambiente

Você deve definir as variáveis no arquivo `.env` na raiz do projeto (carregado automaticamente).

| Variável | Descrição |
|----------|-----------|
| `OPENAI_API_KEY` | Chave de API do OpenAI (obrigatória) |
| `NEST_API_URL` | URL interna do serviço NestJS (`api:3000`) |

Exemplo:
```
OPENAI_API_KEY=sk-xxxxxxx
NEST_API_URL=http://api:3000
```

---

## 🛠️ Como Rodar Localmente (Sem Docker)
```sh
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

O endpoint ficará disponível em:
```
http://localhost:8001
```

---

## 🐳 Rodando com Docker
```sh
docker build -t ai-service .
docker run -p 8001:8001 ai-service
```

Quando rodado dentro do `docker-compose.yml`, o container é acessível pela URL interna:
```
http://ai-service:8001
```

---

## 📡 Endpoints

### `GET /health`

Verifica se o serviço está online.

**Resposta:**
```json
{ "status": "ok" }
```

### `POST /generate-insights`

O AI Service irá:

1. Consultar o backend NestJS em:
```
GET http://api:3000/weather/logs
```

2. Analisar os dados meteorológicos
3. Criar um prompt estruturado
4. Gerar insights usando OpenAI
5. Retornar JSON organizado

**Resposta (exemplo):**
```json
{
  "resumo": "Temperaturas estáveis com leve tendência de queda.",
  "tendencias": [
    "Vento aumentando nas últimas horas",
    "Umidade alta pela manhã"
  ],
  "alertas": [
    "Possível chuva no período da tarde"
  ],
  "classificacao": "Clima instável"
}
```

---

## 🧠 Como funciona o Prompt de Análise

O arquivo `utils/prompt.py` constrói um prompt disciplinado que instrui o modelo a sempre retornar JSON válido, evitando alucinações ou texto solto.

Ele inclui:
* Estrutura fixa
* Campos obrigatórios
* Amostra do formato
* Dados meteorológicos brutos

Isso torna o microserviço muito estável.

---

## 🔗 Integração com o NestJS

A API chama este microserviço usando:
```
AI_URL=http://ai-service:8001
```

E o controller NestJS expõe:
```
GET /weather/insights
```

O frontend então usa esse endpoint para renderizar recomendações climáticas.

---

## 🧪 Testando o Serviço Manualmente

**Testar health:**
```sh
curl http://localhost:8001/health
```

**Testar geração:**
```sh
curl -X POST http://localhost:8001/generate-insights
```

---

## 📝 Logs e Debug

Para visualizar logs:
```sh
docker logs ai-service -f
```

---

## 🎯 Objetivo do Microserviço

Este módulo entrega a parte "IA Aplicada" do desafio GDASH:

* Conecta múltiplos serviços
* Usa IA para enriquecer dados climáticos
* Funciona como microserviço isolado
* É desacoplado, escalável e distribuído

Com isso, o projeto cumpre o requisito de IA integrada ao pipeline real de dados.