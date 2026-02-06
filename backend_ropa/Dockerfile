# Fase 1: Construcción (Builder)
# Usamos la versión 1.24 que es la que requieren tus librerías más recientes
FROM golang:1.24-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Instalar git (algunas dependencias de Go lo requieren para descargarse)
RUN apk add --no-cache git

# Copiar archivos de definición de módulos
COPY go.mod go.sum ./

# Limpiar y descargar dependencias 
# Esto arregla el error de "updates to go.mod needed" automáticamente
RUN go mod tidy && go mod download

# Copiar el resto del código fuente
COPY . .

# Compilar el binario optimizado para producción
# -ldflags="-w -s" reduce el tamaño del ejecutable
RUN go build -ldflags="-w -s" -o main .

# Fase 2: Imagen de ejecución (Runtime)
# Usamos una imagen mínima para que el despliegue sea rápido
FROM alpine:latest

WORKDIR /app

# Instalar certificados CA para permitir conexiones seguras (HTTPS) a Supabase
RUN apk --no-cache add ca-certificates

# Copiar solo el binario compilado desde la fase anterior
COPY --from=builder /app/main .

# Crear la carpeta de imágenes para evitar errores de ruta
RUN mkdir uploads

# Exponer el puerto que configuramos en main.go
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["./main"]