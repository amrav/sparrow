package main

import (
	"log"
	"regexp"
	"strconv"
	"strings"
	"time"

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
			log.Printf("Searching for %s\n", msg["searchText"])
			go c.Search(msg["searchText"])
		}
	}
}

// HandleSearchResults listens for incoming search results
func HandleSearchResults(c *client.Client, sendCh chan interface{},
	recvCh chan server.JsonMsg, done chan struct{}) {
	resultsCh := make(chan proto.SearchResult)
	go c.SearchResults(resultsCh, done)
	var srsBatch []proto.SearchResult
	var timeoutCh <-chan time.Time
	const MAX_BATCH_SIZE = 1000

	sendBatchedSearchResults := func() {
		// Copy batched search results into new slice,
		// since it'll be overwritten by new results
		srs := make([]proto.SearchResult, len(srsBatch), len(srsBatch))
		copy(srs, srsBatch)
		select {
		case sendCh <- srs:
		default:
			log.Fatalf("Unable to send result %+v to sendCh", srs)
		}
		// Reset timeout channel. This will
		// be set the next time a search result comes in.
		timeoutCh = nil
		// allow sent search results to be GC-d
		srsBatch = nil
	}
	for {
		select {
		case <-done:
			return
		case <-timeoutCh:
			log.Printf("Sending batched search results after timer")
			sendBatchedSearchResults()
		case res := <-resultsCh:
			if srsBatch == nil {
				timeoutCh = time.After(500 * time.Millisecond)
			}
			srsBatch = append(srsBatch, res)
			if len(srsBatch) == MAX_BATCH_SIZE {
				log.Printf("Sending batched search results after capacity")
				sendBatchedSearchResults()
			}
			// log.Printf("Got search result: %+v", res)
		}
	}
}

func HandleDownloadFile(c *client.Client, sendCh chan interface{},
	recvCh chan server.JsonMsg, done chan struct{}) {
	for msg := range recvCh {
		if msg["type"] == "DOWNLOAD_FILE" {
			log.Printf("Downloading file: %s (%s) from %s", msg["fileName"], msg["tth"], msg["nick"])
			go func() {
				progressCh := make(chan int, 10)
				size, _ := strconv.ParseUint(msg["size"], 10, 64)
				go c.DownloadFile(msg["fileName"], msg["tth"], msg["nick"], size, progressCh)
				select {
				case <-progressCh:
					log.Printf("Download complete")
					return
				}
			}()
		}
	}
}
