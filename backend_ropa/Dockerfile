# Fase 1: Construcción (Builder)
FROM golang:1.24-alpine AS builder

WORKDIR /app

# 1. Instalar git
RUN apk add --no-cache git

# 2. Copiar TODO el código primero
# Esto es vital para que 'go mod tidy' vea qué librerías usas en main.go
COPY . .

# 3. Ahora sí, limpiar y descargar dependencias basándose en el código copiado
RUN go mod tidy
RUN go mod download

# 4. Compilar el binario
RUN go build -ldflags="-w -s" -o main .

# Fase 2: Imagen de ejecución (Runtime)
FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates

# Copiar el binario compilado
COPY --from=builder /app/main .

# Crear la carpeta de imágenes
RUN mkdir uploads

EXPOSE 8080

CMD ["./main"]