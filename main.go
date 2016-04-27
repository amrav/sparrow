package main

import (
	"log"
	"net/http"

	"golang.org/x/net/websocket"

	"github.com/amrav/sparrow/client"
	"github.com/amrav/sparrow/proto"
	"github.com/amrav/sparrow/server"

	"github.com/pkg/profile"
)

func main() {
	defer profile.Start().Stop()
	c := client.New()
	c.StartActiveMode()
	c.SetNick(proto.GenerateRandomUsername())
	c.Connect("10.109.49.49:411")

	s := server.New(c)
	s.Register("", SendHubMessages)
	s.Register("", SendPrivateMessages)
	s.Register("", HandleSearchResults)
	s.Register("MAKE_SEARCH_QUERY", HandleSearchRequests)
	s.Register("DOWNLOAD_FILE", HandleDownloadFile)

	http.Handle("/connect", websocket.Handler(s.WsHandler))
	http.Handle("/", http.FileServer(http.Dir("ui")))
	log.Fatal(http.ListenAndServe(":12345", nil))
}
