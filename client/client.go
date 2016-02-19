package client

import (
	"bufio"
	"fmt"
	"html"
	"io"
	"log"
	"net"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/amrav/sparrow/proto"
	"github.com/fatih/color"
)

type Client struct {
	Active struct {
		Ip   net.IP
		Port int
	}
	activeListener  net.Listener
	hubConn         net.Conn
	hubListeners    chan listener
	clientListeners struct {
		sync.RWMutex
		m map[string]chan clientListener
	}
	User          proto.User
	outbox        chan outboxMsg
	clientUpdates chan clientUpdate
}

type outboxMsg struct {
	To  string
	Msg string
}

type clientUpdate struct {
	Nick   string
	Update string
	Conn   net.Conn
}

type connClient struct {
	Conn      net.Conn
	Listeners []listener
}

type listener struct {
	Messages chan string
	Done     chan struct{}
}

type clientListener struct {
	Messages chan interface{}
	Done     chan struct{}
}

func New() *Client {
	c := &Client{
		hubListeners:  make(chan listener, 1000),
		outbox:        make(chan outboxMsg, 1000),
		clientUpdates: make(chan clientUpdate, 1000),
		clientListeners: struct {
			sync.RWMutex
			m map[string]chan clientListener
		}{m: make(map[string]chan clientListener)},
	}
	go c.transmit()
	return c
}

func sendClient(conn net.Conn, nick string, msg string, args ...interface{}) {
	msg = fmt.Sprintf(msg, args...)
	magenta := color.New(color.FgMagenta).SprintFunc()
	_, err := conn.Write([]byte(msg))
	if err != nil {
		log.Fatal("Error sending message to client: ", nick, ": ", err)
	}
	log.Print(magenta("client -> %s: ", nick), msg)
}

func (c *Client) transmit() {
	clientMsgs := make(map[string]chan string)
	hubMsgs := make(chan string, 1000)
	yellow := color.New(color.FgYellow).SprintFunc()

	// Run hub transmitter
	go func() {
		for m := range hubMsgs {
			_, err := c.hubConn.Write([]byte(m))
			if err != nil {
				log.Fatal("Couldn't write to hub: ", err)
			}
			log.Print(yellow("Client: "), m)
		}
	}()

	for {
		select {
		case m := <-c.outbox:
			if m.To == "" {
				hubMsgs <- m.Msg
			} else {
				if _, ok := clientMsgs[m.To]; !ok {
					clientMsgs[m.To] = make(chan string, 1000)
				}
				clientMsgs[m.To] <- m.Msg
			}

		case u := <-c.clientUpdates:
			switch u.Update {
			case "connected":
				if _, ok := clientMsgs[u.Nick]; !ok {
					clientMsgs[u.Nick] = make(chan string, 1000)
				}
				// Run client transmitter
				go func(ch chan string) {
					for msg := range ch {
						sendClient(u.Conn, u.Nick, msg)
					}
				}(clientMsgs[u.Nick])
			case "disconnected":
				close(clientMsgs[u.Nick])
				delete(clientMsgs, u.Nick)
			}
		}
	}
}

func (c *Client) SetNick(nick string) {
	c.User.Nick = nick
	log.Print("Changed nick: ", c.User.Nick)
}

func (c *Client) StartActiveMode() {
	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		log.Fatal("Failed to start active mode: ", err)
	}
	c.activeListener = ln
	c.Active.Port = ln.Addr().(*net.TCPAddr).Port
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		log.Fatal("Couldn't get interface addresses: ", err)
	}
	for _, addr := range addrs {
		var ip net.IP
		switch v := addr.(type) {
		case *net.IPNet:
			ip = v.IP
		case *net.IPAddr:
			ip = v.IP
		}
		ipv4 := ip.To4()
		// Get machine IP of the form 10.x.x.x
		if ipv4 != nil && ipv4[0] == 10 {
			c.Active.Ip = ip
			break
		}
	}
	if c.Active.Ip == nil {
		log.Fatal("Couldn't find machine IP of form 10.x.x.x")
	}
	go func() {
		for {
			conn, err := ln.Accept()
			if err != nil {
				log.Fatal("Couldn't accept connection: ", err)
			}
			go c.handleActiveConn(conn)
		}
	}()
}

func (c *Client) handleActiveConn(conn net.Conn) {
	remote := conn.RemoteAddr().String()
	otherNick := remote
	log.Print("Handling connection from: ", remote)

	blue := color.New(color.FgHiBlue).SprintFunc()

	sendClient(conn, remote, "$Nick %s|", c.User.Nick)

	reader := bufio.NewReader(conn)
	var listeners []clientListener
	var newListeners chan clientListener

	publishToListeners := func(thing interface{}) {
		// Get new listeners
	loop:
		for {
			select {
			case l := <-newListeners:
				listeners = append(listeners, l)
			default:
				break loop
			}
		}

		// Publish to listeners
		fl := listeners[:0]
		for _, l := range listeners {
			select {
			case <-l.Done:
				close(l.Messages)
			case l.Messages <- thing:
				fl = append(fl, l)
			default:
				log.Print("Warning: wasn't able to write to client listener; dropping message")
				fl = append(fl, l)
			}
		}
		listeners = fl
	}

	for {
		msg, err := reader.ReadString('|')
		if err != nil {
			log.Fatal("Error reading from TCP connection: ",
				remote, " : ", err)
		}
		log.Print(blue("%s -> client: ", otherNick), msg)
		if strings.HasPrefix(msg, "$MyNick ") {
			otherNick = strings.Fields(msg)[1]
			otherNick = otherNick[:len(otherNick)-1]
			c.clientUpdates <- clientUpdate{
				Nick:   otherNick,
				Update: "connected",
				Conn:   conn,
			}

			c.clientListeners.Lock()
			ch, ok := c.clientListeners.m[otherNick]
			if !ok {
				c.clientListeners.m[otherNick] = make(chan clientListener, 1000)
				ch = c.clientListeners.m[otherNick]
			}
			newListeners = ch
			c.clientListeners.Unlock()

			sendClient(conn, otherNick,
				"$Lock EXTENDEDPROTOCOL/wut? Pk=gdcRef=10.109.49.49|")
			sendClient(conn, otherNick,
				"$Supports MiniSlots XmlBZList ADCGet TTHL TTHF|")
		}
		if strings.HasPrefix(msg, "$Lock") {
			sendClient(conn, otherNick,
				"$Key %s|", proto.LockToKey(strings.Fields(msg)[1]))
		}

		publishToListeners(msg)

		// Check if we need to download something
		if strings.HasPrefix(msg, "$ADCSND file") {
			fields := strings.Fields(msg)
			numBytes, err := strconv.Atoi(fields[4][0 : len(fields[4])-1])
			if err != nil {
				log.Fatal("Error parsing numBytes: ", err)
			}
			buf := make([]byte, numBytes)
			_, err = io.ReadFull(reader, buf)
			if err != nil {
				log.Print("Couldn't read filelist: ", err)
			}
			log.Print("Finished downloading file")
			publishToListeners(buf)
		}
	}
}

func (c *Client) Connect(hubAddr string) {
	log.Print("Username: ", c.User.Nick)
	log.Print("Connecting to hub: ", hubAddr)
	conn, err := net.DialTimeout("tcp", hubAddr, 5*time.Second)
	if err != nil {
		log.Fatal("Failed to connect to hub: ", err)
	}
	c.hubConn = conn
	done := make(chan struct{})
	msg := c.HubMessages(done)
	defer close(done)

	go c.handleHubMessages()

	for m := range msg {
		if strings.HasPrefix(m, "$Lock ") {
			lock := strings.Fields(m)[1]
			key := proto.LockToKey(lock)
			c.MessageHub("$Key %s|", key)
			//c.MessageHub("$Lock EXTENDEDPROTOCOL/wut? Pk=gdcRef=10.109.49.49|")
			c.MessageHub("$ValidateNick %s|", c.User.Nick)
			//c.MessageHub("$Supports NoGetINFO NoHello UserIP2|")

			c.MessageHub("$Version 1,0091|")
			c.MessageHub(fmt.Sprintf("$MyINFO $ALL %s <gdc V:0.0.0,M:A,H:1/0/0,S:3>$ $10^Q$$%d$|", c.User.Nick, c.User.ShareSize))
		}
		if strings.HasPrefix(m, "$Hello ") {
			return
		}
	}
}

func (c *Client) handleHubMessages() {
	cyan := color.New(color.FgCyan).SprintFunc()
	reader := bufio.NewReader(c.hubConn)
	for {
		msg, err := reader.ReadString('|')
		if err != nil {
			log.Fatal("Failed reading from hub: ", err)
		}
		log.Print(cyan("Hub: "), html.UnescapeString(msg))
		var hls []listener
	loop:
		for {
			select {
			case hl := <-c.hubListeners:
				hls = append(hls, hl)
			default:
				break loop
			}
		}
		for _, hl := range hls {
			select {
			case hl.Messages <- msg:
				c.hubListeners <- hl
			case <-hl.Done:
				close(hl.Messages)
			default:
				log.Print("Warning: Unable to write to hub listener, dropping message")
				c.hubListeners <- hl
			}
		}
	}
}

func (c *Client) MessageHub(msg string, args ...interface{}) {
	msg = fmt.Sprintf(msg, args...)
	c.outbox <- outboxMsg{"", msg}
}

func (c *Client) MsgClient(nick string, msg string, args ...interface{}) {
	msg = fmt.Sprintf(msg, args...)
	c.outbox <- outboxMsg{nick, msg}
}

func (c *Client) HubMessages(done chan struct{}) chan string {
	ch := make(chan string, 100)
	select {
	case c.hubListeners <- listener{ch, done}:
	default:
		panic("Tried adding too many hub listeners")
	}
	log.Print("Added hub listener")
	return ch
}

func (c *Client) ClientMessages(nick string, done chan struct{}) chan interface{} {
	ch := make(chan interface{}, 100)
	l := clientListener{ch, done}

	c.clientListeners.Lock()
	clc, ok := c.clientListeners.m[nick]
	if !ok {
		c.clientListeners.m[nick] = make(chan clientListener, 1000)
		clc = c.clientListeners.m[nick]
	}
	c.clientListeners.Unlock()
	select {
	case clc <- l:
	default:
		panic("Tried adding too many client listeners")
	}

	log.Print("Added client listener")
	return ch
}
