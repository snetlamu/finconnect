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

type ScreenerItem struct {
	Symbol        string  `json:"symbol" bson:"symbol"`
	Name          string  `json:"name" bson:"name"`
	Price         float64 `json:"price" bson:"price"`
	MarketCap     float64 `json:"market_cap" bson:"market_cap"`
	PEratio       float64 `json:"pe_ratio" bson:"pe_ratio"`
	DividendYield float64 `json:"dividend_yield" bson:"dividend_yield"`
	Volume        int64   `json:"volume" bson:"volume"`
	Sector        string  `json:"sector" bson:"sector"`
}

var screenerCollection *mongo.Collection

func initMongo() {
	err := godotenv.Load("/home/ubuntu/finconnect/finconnect-be/screener/.env")
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

	screenerCollection = client.Database("finconnect").Collection("stockScreener")
}

func getScreenerData(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := screenerCollection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching stock screener data"})
		return
	}
	defer cursor.Close(ctx)

	var data []ScreenerItem
	if err := cursor.All(ctx, &data); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding screener data"})
		return
	}

	c.JSON(http.StatusOK, data)
}

func main() {
	initMongo()

	router := gin.Default()

	router.GET("/screener", getScreenerData)

	log.Println("Server running on port 4000")
	if err := router.Run(":4000"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
