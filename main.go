package main

import (
	"embed"
	"fmt"
	"io"
	"io/fs"

	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/gorilla/mux"
	"github.com/spf13/viper"
)

var (
	//go:embed ui/*
	ui embed.FS
)

func askGinkoApi(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	busStop := vars["busStop"]

	base, err := url.Parse("https://api.ginko.voyage/TR/getTempsLieu.do")
	if err != nil {
		log.Fatal(err)
	}

	params := url.Values{}
	params.Add("nom", busStop)
	params.Add("apiKey", viper.GetString("GINKO_API_KEY"))
	params.Add("nb", "5")

	base.RawQuery = params.Encode()

	resp, err := http.Get(base.String())
	if err != nil {
		log.Fatal(err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	w.Write(body)
}

func main() {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()
	err := viper.ReadInConfig()
	if err != nil {
		log.Fatalf("Error while reading config file %s", err)
	}
	viper.SetDefault("PORT", 8080)

	// Setup webserver
	sub, err := fs.Sub(ui, "ui")
	if err != nil {
		panic(err)
	}
	webapp := http.FileServer(http.FS(sub))

	mux := mux.NewRouter().StrictSlash(false)
	mux.HandleFunc("/api/v1/ginko/{busStop}", askGinkoApi)
	mux.PathPrefix("/").Handler(webapp)

	// Create a HTTP server and bind the router to it, and set wanted address
	srv := &http.Server{
		Handler:      mux,
		Addr:         ":" + viper.GetString("PORT"),
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	fmt.Printf("Starting server on port %s\n", srv.Addr)
	log.Fatal(srv.ListenAndServe())
}
