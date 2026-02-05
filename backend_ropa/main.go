package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os" // Necesario para eliminar archivos físicos
	"strconv"
	"time"
)

var maintenanceMode = false

// --- MODELOS ---
type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Email    string `gorm:"unique" json:"email"`
	Password string `json:"password"`
	IsAdmin  bool   `json:"is_admin"`
}

type Variant struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	ProductID uint   `json:"product_id"`
	Size      string `json:"size"`
	Color     string `json:"color"`
	Stock     int    `json:"stock"`
}

type ProductImage struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	ProductID uint   `json:"product_id"`
	URL       string `json:"url"`
}

type Setting struct {
	Key   string `gorm:"primaryKey" json:"key"`
	Value bool   `json:"value"`
}

type Product struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `json:"name"`
	Brand       string         `json:"brand"`
	Material    string         `json:"material"`
	Price       float64        `json:"price"`
	Stock       int            `json:"stock"`
	Description string         `json:"description"`
	Image       string         `json:"image"`
	Category    string         `json:"category"`
	OnSale      bool           `json:"on_sale"`
	Discount    int            `json:"discount_percentage"`
	Variants    []Variant      `gorm:"foreignKey:ProductID" json:"variants"`
	Gallery     []ProductImage `gorm:"foreignKey:ProductID" json:"gallery"`
}

type Sale struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	TransactionID    string    `json:"transaction_id"`
	ItemsDescription string    `json:"items_description"`
	TotalPrice       float64   `json:"total_price"`
	CreatedAt        time.Time `json:"created_at"`
}

type CheckoutRequest struct {
	Items []struct {
		ID       uint `json:"id"`
		Quantity int  `json:"quantity"`
	} `json:"items"`
}

// --- FUNCIONES AUXILIARES ---

func GetSales(c *gin.Context) {
	var sales []Sale
	if err := DB.Order("created_at desc").Find(&sales).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener ventas"})
		return
	}
	c.JSON(http.StatusOK, sales)
}

func main() {
	ConnectDatabase()
	SeedDatabase()

	r := gin.Default()
	
	r.MaxMultipartMemory = 32 << 20 
	r.Static("/uploads", "./uploads")

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// --- AUTH ---
	r.POST("/api/register", func(c *gin.Context) {
		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(400, gin.H{"error": "Datos inválidos"})
			return
		}
		newUser := User{Email: body.Email, Password: body.Password}
		DB.Create(&newUser)
		c.JSON(200, newUser)
	})

	r.POST("/api/login", func(c *gin.Context) {
		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(400, gin.H{"error": "Datos inválidos"})
			return
		}
		var user User
		if err := DB.Where("email = ? AND password = ?", body.Email, body.Password).First(&user).Error; err != nil {
			c.JSON(401, gin.H{"error": "No autorizado"})
			return
		}
		c.JSON(200, user)
	})

	// --- MANTENIMIENTO ---
	r.GET("/api/settings/maintenance_mode", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"value": maintenanceMode})
	})

	r.POST("/api/settings/maintenance", func(c *gin.Context) {
		var body struct{ Value bool `json:"value"` }
		if err := c.ShouldBindJSON(&body); err == nil {
			maintenanceMode = body.Value
			c.JSON(http.StatusOK, gin.H{"status": "ok", "value": maintenanceMode})
		}
	})

	// --- PRODUCTOS ---
	r.GET("/api/products", func(c *gin.Context) {
		var products []Product
		DB.Preload("Variants").Preload("Gallery").Find(&products)
		c.JSON(http.StatusOK, products)
	})

	r.GET("/api/sales", GetSales)

	r.POST("/api/products", func(c *gin.Context) {
		price, _ := strconv.ParseFloat(c.PostForm("price"), 64)
		stock, _ := strconv.Atoi(c.PostForm("stock"))
		discount, _ := strconv.Atoi(c.PostForm("discount_percentage"))

		file, err := c.FormFile("image")
		imagePath := ""
		if err == nil {
			imagePath = "/uploads/" + file.Filename
			c.SaveUploadedFile(file, "./uploads/"+file.Filename)
		}

		newProduct := Product{
			Name:        c.PostForm("name"),
			Price:       price,
			Stock:       stock,
			Description: c.PostForm("description"),
			Category:    c.PostForm("category"),
			OnSale:      c.PostForm("on_sale") == "true",
			Discount:    discount,
			Image:       imagePath,
		}
		DB.Create(&newProduct)

		form, err := c.MultipartForm()
		if err == nil && form != nil {
			files := form.File["gallery[]"] 
			for i, f := range files {
				uniqueName := fmt.Sprintf("prod_%d_%d_%s", newProduct.ID, i, f.Filename)
				if err := c.SaveUploadedFile(f, "./uploads/"+uniqueName); err == nil {
					DB.Create(&ProductImage{ProductID: newProduct.ID, URL: "/uploads/" + uniqueName})
				}
			}
		}

		c.JSON(http.StatusOK, newProduct)
	})

	r.PUT("/api/products/:id", func(c *gin.Context) {
		id := c.Param("id")
		var product Product
		if err := DB.First(&product, id).Error; err != nil {
			c.JSON(404, gin.H{"error": "No encontrado"})
			return
		}

		price, _ := strconv.ParseFloat(c.PostForm("price"), 64)
		stock, _ := strconv.Atoi(c.PostForm("stock"))
		product.Name = c.PostForm("name")
		product.Price = price
		product.Stock = stock
		product.OnSale = c.PostForm("on_sale") == "true"
		product.Discount, _ = strconv.Atoi(c.PostForm("discount_percentage"))

		file, err := c.FormFile("image")
		if err == nil {
			product.Image = "/uploads/" + file.Filename
			c.SaveUploadedFile(file, "./uploads/"+file.Filename)
		}
		DB.Save(&product)

		form, _ := c.MultipartForm()
		if form != nil {
			galleryFiles := form.File["gallery[]"]
			for i, f := range galleryFiles {
				uniqueName := fmt.Sprintf("edit_%d_%d_%s", product.ID, i, f.Filename)
				if err := c.SaveUploadedFile(f, "./uploads/"+uniqueName); err == nil {
					DB.Create(&ProductImage{ProductID: product.ID, URL: "/uploads/" + uniqueName})
				}
			}
		}

		c.JSON(http.StatusOK, product)
	})

	// --- ELIMINACIÓN CON LIMPIEZA DE ARCHIVOS ---
	r.DELETE("/api/products/:id", func(c *gin.Context) {
		id := c.Param("id")
		var product Product

		// 1. Obtener datos antes de borrar de la DB (Preload Gallery es vital aquí)
		if err := DB.Preload("Gallery").First(&product, id).Error; err != nil {
			c.JSON(404, gin.H{"error": "Producto no encontrado"})
			return
		}

		// Función interna para borrar archivos físicos
		removePhysicalFile := func(url string) {
			if url != "" {
				filePath := "." + url
				if err := os.Remove(filePath); err != nil {
					fmt.Printf("Aviso: No se pudo borrar el archivo %s: %v\n", filePath, err)
				} else {
					fmt.Printf("Archivo eliminado del disco: %s\n", filePath)
				}
			}
		}

		// 2. Borrar imagen principal
		removePhysicalFile(product.Image)

		// 3. Borrar imágenes de la galería
		for _, img := range product.Gallery {
			removePhysicalFile(img.URL)
		}

		// 4. Borrar de la Base de Datos (Relaciones primero)
		DB.Where("product_id = ?", id).Delete(&ProductImage{})
		DB.Delete(&Product{}, id)

		c.JSON(http.StatusOK, gin.H{"message": "Producto y archivos eliminados con éxito"})
	})

	// --- CHECKOUT ---
	r.POST("/api/checkout", func(c *gin.Context) {
		var req CheckoutRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Datos inválidos"})
			return
		}

		tx := DB.Begin()
		var totalVenta float64
		var detalleProductos string

		for _, item := range req.Items {
			var p Product
			if err := tx.First(&p, item.ID).Error; err == nil {
				precioVenta := p.Price
				if p.OnSale && p.Discount > 0 {
					precioVenta = p.Price * (1 - float64(p.Discount)/100)
				}
				totalVenta += precioVenta * float64(item.Quantity)
				tx.Model(&p).Update("stock", p.Stock-item.Quantity)
				detalleProductos += fmt.Sprintf("%dx %s, ", item.Quantity, p.Name)
			}
		}

		nuevaVenta := Sale{
			TransactionID:    "TR-" + strconv.FormatInt(time.Now().Unix(), 10),
			ItemsDescription: detalleProductos,
			TotalPrice:       totalVenta,
			CreatedAt:        time.Now(),
		}
		tx.Create(&nuevaVenta)
		tx.Commit()
		c.JSON(http.StatusOK, gin.H{"status": "success"})
	})

	r.Run(":8080")
}