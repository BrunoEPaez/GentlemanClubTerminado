package main

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB es la instancia global de la base de datos
var DB *gorm.DB

func ConnectDatabase() {
	// Configuración de la conexión (DSN)
	// Asegúrate de que los datos de user, password y dbname coincidan con tu Postgres local
	dsn := "host=localhost user=postgres password=123456 dbname=tienda_go port=5432 sslmode=disable"
	
	// Abrir la conexión usando GORM
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		fmt.Println("------------------------------------------------------------------")
		fmt.Println("¡ERROR! No se pudo conectar a PostgreSQL.")
		fmt.Println("Asegúrate de que:")
		fmt.Println("1. Postgres esté corriendo.")
		fmt.Println("2. La base de datos 'tienda_go' exista.")
		fmt.Println("3. El usuario y contraseña sean correctos.")
		fmt.Println("------------------------------------------------------------------")
		panic(err)
	}

	fmt.Println("✅ Conexión exitosa a Postgres")

	// MIGRACIÓN AUTOMÁTICA
	// Aquí le decimos a GORM que revise nuestros modelos y cree las tablas si no existen.
	// Incluimos ProductImage para que la galería funcione.
	err = database.AutoMigrate(
		&User{}, 
		&Product{}, 
		&Variant{}, 
		&Setting{}, 
		&Sale{}, 
		&ProductImage{}, // <-- Crucial para la galería
	)
	
	if err != nil {
		fmt.Println("❌ Error en la migración de tablas:", err)
	} else {
		fmt.Println("🚀 Tablas sincronizadas correctamente (Galería de imágenes lista)")
	}

	// Asignar la conexión a la variable global
	DB = database
}