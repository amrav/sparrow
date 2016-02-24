package main

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/amrav/sparrow/client"
	"github.com/amrav/sparrow/proto"
	"golang.org/x/net/websocket"
)

func UiServer(c *client.Client) func(*websocket.Conn) {
	return func(ws *websocket.Conn) {
		log.Print("socket.io client connected")
		var socketCh = make(chan []byte, 1000)
		go SendHubMessages(c, socketCh)
		c.Connect("10.109.49.49:411")
		for msg := range socketCh {
			_, err := ws.Write(msg)
			log.Print("Sent: ", string(msg))
			if err != nil {
				log.Fatal("Couldn't write to websocket: ", err)
			}
		}
	}
}

func SendHubMessages(c *client.Client, socketCh chan []byte) {
	done := make(chan struct{})
	defer close(done)
	ch := c.HubMessages(done)
	chatRegexp := regexp.MustCompile(`(?s)<(.+?)>\s(.+)\|`)
	for msg := range ch {
		matches := chatRegexp.FindSubmatch([]byte(msg))
		if matches != nil {
			msg := map[string]string{
				"type": "chatMessage",
				"from": string(matches[1]),
				"text": string(matches[2]),
			}
			js, err := json.Marshal(msg)
			if err != nil {
				log.Fatalf("Couldn't marshal json: %s %s", msg, err)
			}
			if strings.HasPrefix(msg["from"], "%") {
				continue
			}
			socketCh <- js
		}
	}
}

func main() {
	c := client.New()
	c.StartActiveMode()
	c.SetNick(proto.GenerateRandomUsername())

	http.Handle("/connect", websocket.Handler(UiServer(c)))
	http.Handle("/", http.FileServer(http.Dir("ui")))
	log.Fatal(http.ListenAndServe(":12345", nil))
}
