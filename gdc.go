package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/fatih/color"
)

func sendHub(conn net.Conn, reply string) {
	reply = "$" + reply + "|"
	yellow := color.New(color.FgYellow).SprintFunc()
	_, err := conn.Write([]byte(reply))
	if err != nil {
		log.Fatal(err)
	}
	log.Print(yellow("Client: "), reply)
}

func generateRandomUsername() string {
	const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	b := make([]byte, 16)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}

func lockMsgToKey(lockMsg string) string {
	lock := []byte(strings.Fields(lockMsg)[1])
	key := make([]byte, len(lock))
	for i := 1; i < len(lock); i += 1 {
		key[i] = lock[i] ^ lock[i-1]
	}
	key[0] = lock[0] ^ lock[len(lock)-1] ^ lock[len(lock)-2] ^ 5
	for i := range key {
		key[i] = ((key[i] << 4) | (key[i] >> 4)) & 0xFF
	}
	var result []byte
	for _, k := range key {
		switch k {
		case 0, 5, 36, 96, 124, 126:
			result = append(result, fmt.Sprintf("/%%DCN%03d%%/", k)...)
		default:
			result = append(result, k)
		}
	}
	return string(result)
}

var nick = generateRandomUsername()

func handleConnection(conn net.Conn) {
	defer conn.Close()
	remote := conn.RemoteAddr().String()
	log.Print("Handling connection from: ", remote)
	magenta := color.New(color.FgMagenta).SprintFunc()
	sendClient := func(msg string) {
		msg = "$" + msg + "|"
		_, err := conn.Write([]byte(msg))
		if err != nil {
			log.Fatal("Error sending message to client: ", remote, " : ", err)
		}
		log.Print(magenta("client -> "+remote+" : "), msg)
	}
	reader := bufio.NewReader(conn)
	for {
		msg, err := reader.ReadString('|')
		if err != nil {
			log.Fatal("Error reading from TCP connection: ",
				remote, " : ", err)
		}
		log.Print("TCP: ", msg)
		if strings.HasPrefix(msg, "$MyNick") {
			sendClient("MyNick " + nick)
		}
		if strings.HasPrefix(msg, "$Lock") {
			sendClient("Lock EXTENDEDPROTOCOL/wut? Pk=gdcRef=10.109.49.49")
			sendClient("Supports MiniSlots XmlBZList ADCGet TTHL TTHF")
			sendClient("Direction Download 19200")
			sendClient("Key " + lockMsgToKey(msg))
		}
		if strings.HasPrefix(msg, "$Key ") {
			sendClient("ADCGET file files.xml.bz2 0 -1")
		}
		if strings.HasPrefix(msg, "$ADCSND file") {
			fields := strings.Fields(msg)
			numBytes, err := strconv.Atoi(fields[4][0 : len(fields[4])-1])
			if err != nil {
				log.Fatal("Error parsing numBytes: ", err)
			}
			buf := make([]byte, numBytes)
			// receive file list
			f, err := os.Create("files.xml.bz2")
			if err != nil {
				log.Fatal("Couldn't create filelist: ", err)
			}
			defer f.Close()
			nbytes, err := io.ReadFull(reader, buf)
			f.Write(buf)
			if err != nil {
				log.Fatal("Couldn't write to filelist: ", err)
			}
			if nbytes != numBytes {
				log.Fatal(fmt.Sprintf("Wrote only %d of %d bytes", nbytes, numBytes))
			}
			log.Print("Finished downloading file")
			return
		}
	}
}

func startTcpServer(activePort string) {
	ln, err := net.Listen("tcp", activePort)
	if err != nil {
		log.Fatal("Couldn't start tcp server: ", err)
	}
	for {
		conn, err := ln.Accept()
		if err != nil {
			log.Fatal("Couldn't accept connection: ", err)
		}
		go handleConnection(conn)
	}
}

func sendClient(client, msg string) {
	conn, err := net.Dial("udp", client)
	if err != nil {
		log.Fatal("Couldn't connect to client: ", client, " : ", err)
	}
	msg = fmt.Sprintf("$%s|", msg)
	_, err = conn.Write([]byte(msg))
	if err != nil {
		log.Fatal("Couldn't write to client: ", client, " : ", err)
	}
	magenta := color.New(color.FgMagenta).SprintFunc()
	log.Print(magenta("client -> "+client+": "), msg)
	reply, err := bufio.NewReader(conn).ReadString('|')
	if err != nil {
		log.Fatal("Failed reading from client: ", client, " : ", err)
	}
	log.Print(client, " : ", reply)
	conn.Close()
}

func main() {
	cyan := color.New(color.FgCyan).SprintFunc()
	conn, err := net.Dial("tcp", "10.109.49.49:411")
	if err != nil {
		log.Fatal("Couldn't connect to hub: ", err)
	}

	reader := bufio.NewReader(conn)
	shareSize := 100 * 1024 * 1024 * 1024
	activePort := "10245"
	go startTcpServer(":" + activePort)
	doneInit := false
	for true {
		msg, err := reader.ReadString('|')
		if err != nil {
			log.Fatal("Failed reading from hub: ", err)
		}
		// log.Print(cyan("Hub: "), msg)
		if strings.HasPrefix(msg, "$Lock ") {
			key := lockMsgToKey(msg)
			sendHub(conn, "Supports NoGetINFO NoHello UserIP2")
			sendHub(conn, "Key "+key)
			sendHub(conn, "ValidateNick "+nick)
			sendHub(conn, "Version 1,0091")
			sendHub(conn, fmt.Sprintf("MyINFO $ALL %s <gdc V:0.0.0,M:A,H:1/0/0,S:3>$ $10^Q$$%d$", nick, shareSize))
		} else if !doneInit && strings.HasPrefix(msg, "<PtokaX>") {
			go func() {
				time.Sleep(1 * time.Second)
				sendHub(conn, fmt.Sprintf(
					"ConnectToMe scallywag 10.102.72.100:%s", activePort))
			}()
			doneInit = true
		}

		if strings.HasPrefix(msg, "<PtokaX>") || strings.HasPrefix(msg, "$To ") {
			log.Print(cyan("Hub: "), msg)
		}
		/*else if strings.HasPrefix(msg, "$MyINFO") ||
		strings.HasPrefix(msg, "<PtokaX>") ||
		strings.HasPrefix(msg, "$To") ||
		strings.HasPrefix(msg, "$UserCommand") || */
	}
}
