# Fase de construcción usando la imagen oficial de Go
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Instalar git por si alguna dependencia lo necesita
RUN apk add --no-cache git

# Copiar archivos de dependencia
COPY go.mod go.sum ./
RUN go mod download

# Copiar el código fuente
COPY . .

# Compilar la aplicación (el binario se llamará 'main')
RUN go build -o main .

# Fase final (Imagen súper ligera)
FROM alpine:latest
WORKDIR /app

# Instalar certificados (necesarios para conectar con Supabase/HTTPS)
RUN apk --no-cache add ca-certificates

# Copiar el binario desde la fase de construcción
COPY --from=builder /app/main .

# Crear carpeta de uploads
RUN mkdir uploads

# Exponer el puerto
EXPOSE 8080

# Comando para arrancar
CMD ["./main"]