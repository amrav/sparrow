package main

import (
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/amrav/sparrow/client"
	"github.com/amrav/sparrow/proto"
	"golang.org/x/net/websocket"
)

func UiServer(c *client.Client) func(*websocket.Conn) {
	connected := false
	return func(ws *websocket.Conn) {
		log.Print("socket.io client connected")
		done := make(chan struct{})
		sendCh := make(chan interface{}, 1000)
		recvChs := make([]chan map[string]string, 0, 1)

		go SendHubMessages(c, sendCh, done)
		go SendPrivateMessages(c, sendCh, done)
		recvChs = append(recvChs, make(chan map[string]string, 1000))
		go HandleSearchRequests(c, sendCh, recvChs[0], done)
		defer close(done)

		if !connected {
			c.Connect("10.109.49.49:411")
			connected = true
		}
		// transmitter
		go func() {
			for msg := range sendCh {
				err := websocket.JSON.Send(ws, msg)
				if err != nil {
					log.Fatalf("Couldn't push data to websocket: %s", err)
				}
			}
		}()
		// receiver
		go func() {
			var msg map[string]string
			err := websocket.JSON.Receive(ws, &msg)
			log.Printf("Received message: %s\n", msg)
			if err != nil {
				log.Fatalf("Couldn't read data from websocket: %s", err)
			}

			for _, ch := range recvChs {
				log.Printf("Trying to send on channel")
				ch <- msg
				log.Printf("Sent on channel")
			}
		}()
		select {}
	}
}

func SendHubMessages(c *client.Client, sendCh chan interface{}, done chan struct{}) {
	doneCh := make(chan struct{})
	defer close(doneCh)
	chatRegexp := regexp.MustCompile(`(?s)^<(.+?)>\s(.+)\|$`)
	ch := c.HubMessagesMatch(doneCh, chatRegexp)
	for msg := range ch {
		matches := chatRegexp.FindSubmatch(msg)
		if matches != nil {
			msg := map[string]string{
				"type": "RECEIVE_MESSAGE",
				"from": string(matches[1]),
				"text": string(matches[2]),
			}
			if strings.HasPrefix(msg["from"], "%") {
				continue
			}
			select {
			case sendCh <- msg:
			case <-done:
				return
			}
		}
	}
}

func SendPrivateMessages(c *client.Client, sendCh chan interface{}, done chan struct{}) {
	doneCh := make(chan struct{})
	defer close(doneCh)
	chatRegexp := regexp.MustCompile(`(?s)^\$To: (.+?) From: (.+?) \$<(.+?)>\s(.+)\|$`)
	ch := c.HubMessagesMatch(doneCh, chatRegexp)
	for msg := range ch {
		matches := chatRegexp.FindSubmatch(msg)
		if matches != nil {
			msg := map[string]string{
				"type": "RECEIVE_PRIVATE_MESSAGE",
				"from": string(matches[2]),
				"text": string(matches[4]),
			}
			select {
			case sendCh <- msg:
			case <-done:
				return
			}
		}
	}
}

func HandleSearchRequests(c *client.Client, sendCh chan interface{}, recvCh chan map[string]string, done chan struct{}) {
	log.Printf("HSR: Waiting for message\n")
	for msg := range recvCh {
		log.Printf("HSR: Received message %s\n", msg)
		if msg["type"] == "MAKE_SEARCH_QUERY" {
			go func() {
				resultsCh := make(chan client.SearchResult)
				defer close(resultsCh)
				log.Printf("Searching for %s\n", msg["searchText"])
				// Eventually send this to js client
				c.Search(msg["searchText"], resultsCh)
				for res := range resultsCh {
					select {
					case sendCh <- res:
					case <-done:
						return
					}
				}
			}()
		}
	}
	log.Printf("HSR: Exiting\n")
}

func main() {
	c := client.New()
	c.StartActiveMode()
	c.SetNick(proto.GenerateRandomUsername())

	http.Handle("/connect", websocket.Handler(UiServer(c)))
	http.Handle("/", http.FileServer(http.Dir("ui")))
	log.Fatal(http.ListenAndServe(":12345", nil))
}
