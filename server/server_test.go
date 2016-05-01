package server

import (
	"fmt"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"github.com/amrav/sparrow/client"
	"golang.org/x/net/websocket"
)

func wsConnect(server *Server, t *testing.T) (wsClient *websocket.Conn, wsServer *httptest.Server) {
	wsServer = httptest.NewServer(websocket.Handler(server.WsHandler))
	url_, _ := url.Parse(wsServer.URL)
	wsUrl := fmt.Sprintf("ws://%s/%s", url_.Host, url_.Path)
	origin := fmt.Sprintf("http://%s/", url_.Host)
	wsConn, err := websocket.Dial(wsUrl, "", origin)
	if err != nil {
		t.Error("Could not connect to websocket:", err)
	}
	return wsConn, wsServer
}

func TestWebSocketConnectDisconnect(t *testing.T) {
	var c *client.Client
	server := New(c)
	done := make(chan struct{})
	server.Register("", func(c *client.Client, s chan interface{}, r chan JsonMsg, doneCh chan struct{}) {
		select {
		case <-doneCh:
			close(done)
		}
	})
	wsConn, wsServer := wsConnect(server, t)
	defer wsServer.Close()
	wsConn.Close()
	select {
	case <-done:
		return
	case <-time.After(1 * time.Second):
		t.Error("Server didn't close doneCh after websocket client disconnected")
	}
}
