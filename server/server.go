package server

import (
	"log"

	"github.com/amrav/sparrow/client"

	"golang.org/x/net/websocket"
)

type JsonMsg map[string]string

type Server struct {
	conn *websocket.Conn
	// sendCh is a single channel into which all messages that
	// need to be sent to the web client are pushed
	sendCh chan interface{}
	// recvChs is a map of message type to channel, for dispatching
	// messages received from the web client to the registered handlers
	recvChs map[string][]chan JsonMsg
	// This channel is closed when the server stops
	doneCh chan struct{}
	// The server holds a pointer to the connected DC client.
	// TODO: Add handling for client disconnects and errors.
	client *client.Client
}

// New initialises the server, and needs a connected client
func New(c *client.Client) *Server {
	s := &Server{
		sendCh:  make(chan interface{}, 1000),
		recvChs: make(map[string][]chan JsonMsg),
		doneCh:  make(chan struct{}),
		client:  c,
	}
	return s
}

type Handler func(client *client.Client, sendCh chan interface{},
	recvCh chan JsonMsg, doneCh chan struct{})

// Register hands a handler a send and receive channel, and allows it
// to subscribe to messages by message type. Passing an empty string
// as message type results in no incoming messages being sent to the
// handler.
//
// All handlers *must* be registered before the server starts.
func (s *Server) Register(action string,
	handler Handler) {
	var ch chan JsonMsg
	if action != "" {
		if _, ok := s.recvChs[action]; !ok {
			s.recvChs[action] = make([]chan JsonMsg, 0, 1000)
		}
		ch = make(chan JsonMsg, 1000)
		s.recvChs[action] = append(s.recvChs[action], ch)
	}
	go handler(s.client, s.sendCh, ch, s.doneCh)
}

// WsHandler should be registered with websocket.Handler.
func (s *Server) WsHandler(conn *websocket.Conn) {
	s.conn = conn
	log.Print("socket.io client connected")

	// transmitter
	go func() {
		for msg := range s.sendCh {
			err := websocket.JSON.Send(s.conn, msg)
			if err != nil {
				log.Fatalf("Couldn't push data to websocket: %s", err)
			}
		}
	}()

	// receiver
	go func() {
		var msg JsonMsg
		err := websocket.JSON.Receive(s.conn, &msg)
		if err != nil {
			log.Fatalf("Couldn't read data from websocket: %s", err)
		}
		log.Printf("Received message: %s\n", msg)

		if chs, ok := s.recvChs[msg["type"]]; ok {
			for _, ch := range chs {
				log.Printf("Trying to send on channel")
				ch <- msg
				log.Printf("Sent on channel")
			}
		}
	}()

	// Don't close websocket connection
	select {}
}
