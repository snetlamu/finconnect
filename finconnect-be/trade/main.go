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

// TradeItem represents a trade transaction
type TradeItem struct {
	TradeID   string  `json:"trade_id" bson:"trade_id"`
	Sender    string  `json:"sender" bson:"sender"`
	Receiver  string  `json:"receiver" bson:"receiver"`
	Symbol    string  `json:"symbol" bson:"symbol"`
	Quantity  int     `json:"quantity" bson:"quantity"`
	Price     float64 `json:"price" bson:"price"`
	Timestamp string  `json:"timestamp" bson:"timestamp"`
}

var tradeCollection *mongo.Collection

func initMongo() {
	err := godotenv.Load("/home/ubuntu/finconnect/finconnect-be/news/.env")
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

	// Connect to the trades collection
	tradeCollection = client.Database("finconnect").Collection("trades")
}

func getTradeData(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := tradeCollection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching trades"})
		return
	}
	defer cursor.Close(ctx)

	var trades []TradeItem
	if err := cursor.All(ctx, &trades); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding trade data"})
		return
	}

	c.JSON(http.StatusOK, trades)
}

func main() {
	initMongo()

	router := gin.Default()

	router.GET("/trades", getTradeData)

	log.Println("Server running on port 8000")
	err := router.Run(":8000")
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
