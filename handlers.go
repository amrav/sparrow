package main

import (
	"log"
	"regexp"
	"strings"

	"github.com/amrav/sparrow/client"
	"github.com/amrav/sparrow/proto"
	"github.com/amrav/sparrow/server"
)

func SendHubMessages(c *client.Client, sendCh chan interface{},
	recvCh chan server.JsonMsg, done chan struct{}) {
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

func SendPrivateMessages(c *client.Client, sendCh chan interface{},
	recvCh chan server.JsonMsg, done chan struct{}) {
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

func HandleSearchRequests(c *client.Client, sendCh chan interface{},
	recvCh chan server.JsonMsg, done chan struct{}) {
	log.Printf("HSR: Waiting for message\n")
	for msg := range recvCh {
		log.Printf("HSR: Received message %s\n", msg)
		if msg["type"] == "MAKE_SEARCH_QUERY" {
			go func() {
				resultsCh := make(chan proto.SearchResult)
				defer close(resultsCh)
				log.Printf("Searching for %s\n", msg["searchText"])
				go c.Search(msg["searchText"], resultsCh, done)
				for {
					select {
					case <-done:
						return
					case res := <-resultsCh:
						// log.Printf("Got search result: %+v", res)
						select {
						case sendCh <- res:
						default:
							log.Fatalf("Unable to send result for %s to sendCh", msg["searchText"])
						}
					}
				}
			}()
		}
	}
	log.Printf("HSR: Exiting\n")
}
