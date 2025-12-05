FROM golang:1.21-alpine

WORKDIR /app

# Copia apenas go.mod primeiro
COPY go.mod ./

# Inicializa e baixa as dependências (gera go.sum automaticamente)
RUN go mod tidy && go mod download

# Copia o código fonte
COPY . .

# Compila
RUN go build -o worker

CMD ["./worker"]