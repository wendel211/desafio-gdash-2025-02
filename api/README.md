# 🔥 API — NestJS (Weather Service)

Backend principal do projeto **GDASH Weather Dashboard**, responsável por:

- Autenticação JWT  
- CRUD de usuários  
- Recebimento de dados de weather via Worker  
- Logs climáticos  
- Insights automáticos  
- Exportações CSV/XLSX  

---

## 🚀 Rodar localmente (sem Docker)
```sh
npm install
npm run start:dev
```

---

## 🔧 Variáveis `.env`
```
PORT=3000
MONGO_URI=mongodb://mongo:27017/weather
JWT_SECRET=supersecret
DEFAULT_ADMIN_EMAIL=admin@gdash.com
DEFAULT_ADMIN_PASSWORD=123456
```

---

## 📁 Estrutura
```
src/
 ├── auth/
 ├── users/
 ├── weather/
 ├── common/
 └── main.ts
```

---

## 🌩 Endpoints Principais

### 🔐 Autenticação
```
POST /auth/login
```

### 👤 Usuários
```
GET /users
POST /users
PATCH /users/:id
DELETE /users/:id
```

### 🌦 Weather
```
GET /weather/logs
GET /weather/insights
GET /weather/export.csv
GET /weather/export.xlsx
POST /weather    (usado pelo worker)
```

---

## 📘 Swagger
```
http://localhost:3000/api
```