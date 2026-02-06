package main

import (
	"fmt"
	"os" // Necesario para leer variables de entorno en Render
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB es la instancia global de la base de datos
var DB *gorm.DB

func ConnectDatabase() {
	// 1. Intentamos obtener la URL de la base de datos desde las variables de entorno (Render)
	dsn := os.Getenv("DATABASE_URL")

	// 2. Si no existe (porque estás en tu PC), usamos la configuración local
	if dsn == "" {
		fmt.Println("ℹ️ Usando configuración de base de datos local...")
		dsn = "host=localhost user=postgres password=123456 dbname=tienda_go port=5432 sslmode=disable"
	} else {
		fmt.Println("🌐 Conectando a la base de datos remota (Supabase/Render)...")
	}
	
	// Abrir la conexión usando GORM
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		fmt.Println("------------------------------------------------------------------")
		fmt.Println("¡ERROR! No se pudo conectar a la base de datos.")
		fmt.Println("Asegúrate de que:")
		fmt.Println("1. Postgres esté corriendo (si es local).")
		fmt.Println("2. La DATABASE_URL en Render sea correcta.")
		fmt.Println("3. El usuario y contraseña sean correctos.")
		fmt.Println("------------------------------------------------------------------")
		panic(err)
	}

	fmt.Println("✅ Conexión exitosa a la base de datos")

	// MIGRACIÓN AUTOMÁTICA
	// Aquí le decimos a GORM que revise nuestros modelos y cree las tablas si no existen.
	err = database.AutoMigrate(
		&User{}, 
		&Product{}, 
		&Variant{}, 
		&Setting{}, 
		&Sale{}, 
		&ProductImage{}, // Crucial para la galería
	)
	
	if err != nil {
		fmt.Println("❌ Error en la migración de tablas:", err)
	} else {
		fmt.Println("🚀 Tablas sincronizadas correctamente")
	}

	// Asignar la conexión a la variable global
	DB = database
}