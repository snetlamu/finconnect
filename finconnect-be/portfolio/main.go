package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Stock struct {
	Year  string `json:"year" bson:"year"`
	CSCO  int    `json:"CSCO" bson:"CSCO"`
	GOOGL int    `json:"GOOGL" bson:"GOOGL"`
	AMZN  int    `json:"AMZN" bson:"AMZN"`
	MSFT  int    `json:"MSFT" bson:"MSFT"`
	TSLA  int    `json:"TSLA" bson:"TSLA"`
}

var collection *mongo.Collection

func initMongo() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("MONGODB_URI not set in .env")
	}

	clientOptions := options.Client().ApplyURI(uri)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("MongoDB connection error: %v", err)
	}

	collection = client.Database("mydb").Collection("stockData")
}

func getStockData(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching data"})
		return
	}
	defer cursor.Close(ctx)

	var stocks []Stock
	if err := cursor.All(ctx, &stocks); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding data"})
		return
	}

	c.JSON(http.StatusOK, stocks)
}

func main() {
	initMongo()

	router := gin.Default()

	router.GET("/portfolio", getStockData)

	log.Println("Server running on port 8000")
	err := router.Run(":8000")
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
