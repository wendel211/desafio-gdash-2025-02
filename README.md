# Multi-Stack Weather Dashboard

**Desafio GDASH** — Sistema completo com API, Dashboard, Coletor, IA e Queue

Este projeto é um ecossistema completo de monitoramento climático desenvolvido para o desafio GDASH, integrando Backend NestJS, Dashboard React, Coletor Python, Worker Go, Serviço de IA com OpenAI, Mensageria RabbitMQ e Banco MongoDB, todos orquestrados via Docker Compose.

Link do Youtube: [Vídeo](https://youtu.be/szXethsQtHI)

---

## Arquitetura Geral
```
                    Frontend (React)
                           ↓
                    API NestJS ←→ MongoDB
                           ↓
                    AI Service (OpenAI)
                           ↑
                    Worker Go
                           ↑
                    RabbitMQ Queue
                           ↑
                    Python Collector
```

### Fluxo de Dados

1. **Coleta**: Python Collector busca dados climáticos e publica na fila RabbitMQ
2. **Processamento**: Worker Go consome mensagens e envia para a API NestJS
3. **Persistência**: API NestJS valida e armazena no MongoDB
4. **Análise**: AI Service busca histórico e gera insights inteligentes com OpenAI
5. **Visualização**: Dashboard React exibe dados, gráficos e insights em tempo real

---

## Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 18, Vite, TailwindCSS, Recharts |
| **Backend** | NestJS, Swagger, JWT, TypeScript |
| **IA** | Python 3.11, FastAPI, OpenAI GPT-4o-mini |
| **Storage** | MongoDB 7 |
| **Mensageria** | RabbitMQ |
| **Collector** | Python 3.11, Requests |
| **Worker** | Go 1.21, AMQP |
| **Infraestrutura** | Docker, Docker Compose |

---

## Testes Unitários

O projeto conta com **44 testes unitários** cobrindo os principais serviços:

### Cobertura de Testes

| Serviço | Testes | Status | Coverage |
|---------|--------|--------|----------|
| **API NestJS** | 27 | 27/27 | 100% |
| **Collector Python** | 11 | 11/11 | 100% |
| **Worker Go** | 6 | 6/6 | 100% |
| **TOTAL** | **44** | **44/44** | **100%** |

### Executar Testes

#### API NestJS
```bash
cd api
npm test

# Com coverage detalhado
npm run test:cov

# Modo watch (desenvolvimento)
npm run test:watch
```

**Módulos Testados:**
-  AuthService (Login, Validação, JWT)
-  UsersService (CRUD, Hash de senha)
-  WeatherService (Coleta, Filtros, Exportação)
-  InsightsService (Análise de tendências, Alertas)

#### Collector Python
```bash
cd collector
python -m pytest -v

# Com coverage
python -m pytest --cov=. --cov-report=html

# Teste específico
python -m pytest test_weather_service.py -v
```

**Módulos Testados:**
-  WeatherService (Coleta de dados, Mapeamento de códigos)
-  QueueService (Conexão RabbitMQ, Envio de mensagens)

#### Worker Go
```bash
cd worker
go test -v

# Com coverage
go test -cover

# Coverage detalhado
go test -coverprofile=coverage.out
go tool cover -html=coverage.out
```

**Módulos Testados:**
-  WeatherData (Serialização, Deserialização)
-  API Integration (Envio de dados, Validação)

### Rodar Todos os Testes de Uma Vez

**Windows (PowerShell):**
```powershell
# Criar arquivo run-all-tests.ps1 na raiz
.\run-all-tests.ps1
```

**Linux/Mac:**
```bash
chmod +x run-all-tests.sh
./run-all-tests.sh
```

---

## Sistema de IA com OpenAI

### Funcionalidades do AI Service

O AI Service é um microserviço independente que analisa dados climáticos históricos e gera insights inteligentes:

- **Resumo geral** do clima atual e histórico dos últimos 20 registros
- **Detecção de tendências** (aquecimento, resfriamento, estabilização)
- **Alertas personalizados** (calor extremo, ventos fortes, umidade crítica)
- **Classificação automática** (Agradável, Quente, Frio, Instável)

### Configuração da API OpenAI

#### Passo 1: Obter API Key

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie uma conta ou faça login
3. Navegue até **API Keys** e clique em **Create new secret key**
4. Copie a chave gerada (formato: `sk-proj-...`)

#### Passo 2: Configurar o Projeto
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave:
```env
OPENAI_API_KEY=sk-proj-SUA_CHAVE_AQUI
```

#### Passo 3: Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Verifica status do serviço |
| `/generate-insights` | POST | Gera análise completa do histórico climático |

### Fallback Inteligente

O sistema possui mecanismo de fallback automático:

- Se a OpenAI estiver indisponível, utiliza análise baseada em regras estatísticas
- Calcula médias, desvios padrão e identifica anomalias
- Garante que insights sejam sempre gerados, independente da disponibilidade da API externa

---

## Execução com Docker

### Iniciando o Projeto
```bash
docker-compose up -d --build
```

Verifique o status dos containers:
```bash
docker ps
```

### Endpoints e Acessos

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3001 | Interface do usuário |
| **API NestJS** | http://localhost:3000/api | API REST |
| **Swagger** | http://localhost:3000/docs | Documentação interativa da API |
| **AI Service** | http://localhost:8001 | Microserviço de IA |
| **RabbitMQ Management** | http://localhost:15672 | Painel administrativo (guest/guest) |
| **MongoDB** | localhost:27017 | Banco de dados |

### Monitoramento de Logs
```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs de serviços específicos
docker logs ai-service -f
docker logs nest-api -f
docker logs python-collector -f
docker logs worker-go -f
```

### Encerrando o Projeto
```bash
docker-compose down
```

---

## Credenciais de Acesso

Após a inicialização da API, um usuário administrador é criado automaticamente:
```
Email: admin@gdash.com  
Senha: 123456
```

Acesse a interface web em **http://localhost:3001**

---

## Estrutura do Projeto
```
multi-stack-weather-dashboard/
 ├── api/               # Backend NestJS
 ├── ai-service/        # Microserviço de IA (Python + FastAPI + OpenAI)
 ├── frontend/          # Dashboard React + Vite + Tailwind
 ├── collector/         # Coletor de dados climáticos (Python)
 ├── worker/            # Consumidor de fila (Go)
 ├── docker-compose.yml # Orquestração de containers
 ├── .env.example       # Template de variáveis de ambiente
 └── README.md          # Documentação
```

---

## Funcionalidades Implementadas

### Dashboard Climático

- Cards de métricas em tempo real (temperatura, umidade, vento, pressão)
- Gráfico de temperatura com histórico temporal (Recharts)
- Exportação de dados em formato CSV e XLSX
- Insights de IA gerados pela OpenAI
- Sistema de filtros avançados:
  - Intervalo de datas customizável
  - Filtro por condição climática
  - Filtro por faixa de temperatura (mín/máx)

### Análise Inteligente com IA

- Processamento automático do histórico climático
- Detecção de padrões e tendências
- Geração de alertas contextualizados
- Classificação do clima baseada em múltiplos fatores
- Sistema de fallback para garantir disponibilidade

### Gestão de Usuários

- CRUD completo (Create, Read, Update, Delete)
- Interface com modal responsivo
- Sistema de roles (admin/user) com badges visuais
- Feedback visual com toasts e animações
- Validação de formulários

### Integração com API Externa

- Exploração da Pokémon API
- Listagem com paginação
- Filtros por tipo e busca textual
- Modal de detalhes com animações
- Interface colorida adaptada por tipo

### Recursos Adicionais

- Tema Dark/Light com persistência
- Autenticação JWT com refresh token
- Documentação Swagger completa
- Pipeline assíncrono de processamento de dados

---

## Pipeline de Processamento

1. **Python Collector** coleta dados de APIs climáticas
2. Publica mensagens na fila **RabbitMQ** (`weather_queue`)
3. **Worker Go** consome mensagens da fila
4. Worker envia dados validados para **API NestJS**
5. API persiste no **MongoDB**
6. **AI Service** analisa histórico e gera insights
7. **Dashboard** consome e exibe dados atualizados

---

## Testes da API de IA

### Via cURL
```bash
# Health check
curl http://localhost:8001/health

# Gerar insights
curl -X POST http://localhost:8001/generate-insights
```

### Via Swagger

1. Acesse http://localhost:3000/docs
2. Execute login via endpoint POST `/api/auth/login`
3. Copie o token JWT retornado
4. Clique em **Authorize** e insira o token
5. Teste o endpoint GET `/api/weather/insights`

---

## Status de Desenvolvimento

| Funcionalidade | Status |
|----------------|--------|
| API REST funcional | ✅ Concluído |
| Dashboard completo | ✅ Concluído |
| Coletor Python | ✅ Concluído |
| Worker Go | ✅ Concluído |
| Docker Compose | ✅ Concluído |
| Autenticação JWT | ✅ Concluído |
| CRUD de Usuários | ✅ Concluído |
| Filtros Avançados | ✅ Concluído |
| Tema Dark/Light | ✅ Concluído |
| Insights de IA (OpenAI) | ✅ Concluído |
| Exportação CSV/XLSX | ✅ Concluído |
| Integração API pública | ✅ Concluído |
| Bônus: Explore API | ✅ Concluído |
| **Testes Unitários** | ✅ **44/44 (100%)** |

---

## Troubleshooting

### Erro ao gerar insights

**Possíveis causas:**
- Variável `OPENAI_API_KEY` não configurada no `.env`
- Chave de API inválida ou expirada
- AI Service não está em execução

**Solução:**
```bash
# Verificar se o serviço está rodando
docker ps | grep ai-service

# Verificar logs do AI Service
docker logs ai-service -f

# Validar variável de ambiente
docker exec ai-service env | grep OPENAI

# Reiniciar o serviço
docker-compose restart ai-service
```

### Erro de conexão com a API
```bash
# Verificar status de todos os serviços
docker-compose ps

# Reiniciar todos os containers
docker-compose down
docker-compose up -d --build
```

### RabbitMQ não está processando mensagens
```bash
# Verificar logs do RabbitMQ
docker logs rabbitmq -f

# Verificar logs do Worker Go
docker logs worker-go -f

# Acessar painel do RabbitMQ
# http://localhost:15672 (guest/guest)
```

---

## Licença

Este projeto foi desenvolvido para o processo seletivo **GDASH 2025/02**.

---