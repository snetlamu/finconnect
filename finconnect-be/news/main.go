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

type NewsItem struct {
	Title       string `json:"title" bson:"title"`
	Description string `json:"description" bson:"description"`
	URL         string `json:"url" bson:"url"`
	Image       string `json:"image" bson:"image"`
	Source      string `json:"source" bson:"source"`
}

var newsCollection *mongo.Collection

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

	// Connect to the newsData collection
	newsCollection = client.Database("finconnect").Collection("newsData")
}

func getNewsData(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := newsCollection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching news"})
		return
	}
	defer cursor.Close(ctx)

	var news []NewsItem
	if err := cursor.All(ctx, &news); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding news"})
		return
	}

	c.JSON(http.StatusOK, news)
}

func main() {
	initMongo()

	router := gin.Default()

	router.GET("/news", getNewsData)

	log.Println("Server running on port 7000")
	err := router.Run(":7000")
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
