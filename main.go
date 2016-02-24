package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"runtime/pprof"
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
			// log.Print("Sent: ", string(msg))
			if err != nil {
				log.Fatal("Couldn't write to websocket: ", err)
			}
		}
	}
}

func SendHubMessages(c *client.Client, socketCh chan []byte) {
	done := make(chan struct{})
	defer close(done)
	chatRegexp := regexp.MustCompile(`^<(?s)(.+?)>\s(.+)\|$`)
	ch := c.HubMessagesMatch(done, chatRegexp)
	for msg := range ch {
		matches := chatRegexp.FindSubmatch(msg)
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

var cpuprofile = flag.String("cpuprofile", "", "write cpu profile to file")

func main() {
	flag.Parse()
	if *cpuprofile != "" {
		f, err := os.Create(*cpuprofile)
		if err != nil {
			log.Fatal(err)
		}
		pprof.StartCPUProfile(f)
		// capture ctrl+c and stop CPU profiler
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt)
		go func() {
			for _ = range c {
				pprof.StopCPUProfile()
				os.Exit(1)
			}
		}()
		defer pprof.StopCPUProfile()
	}
	c := client.New()
	c.StartActiveMode()
	c.SetNick(proto.GenerateRandomUsername())

	http.Handle("/connect", websocket.Handler(UiServer(c)))
	http.Handle("/", http.FileServer(http.Dir("ui")))
	log.Fatal(http.ListenAndServe(":12345", nil))
}
