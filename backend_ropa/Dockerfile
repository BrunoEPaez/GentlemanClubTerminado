# Fase de construcción
FROM generic-images.render.com/lang/golang:1.22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencia
COPY go.mod go.sum ./
RUN go mod download

# Copiar el código fuente
COPY . .

# Compilar la aplicación
RUN go build -o main .

# Fase final (Imagen ligera)
FROM alpine:latest
WORKDIR /app

# Instalar certificados para conexiones seguras
RUN apk --no-cache add ca-certificates

# Copiar el binario desde la fase anterior
COPY --from=builder /app/main .

# Crear carpeta de uploads para que no de error
RUN mkdir uploads

# Exponer el puerto que usa Gin
EXPOSE 8080

# Comando para arrancar
CMD ["./main"]