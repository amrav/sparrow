package client

import (
	"log"
	"os"
	"os/user"
	"path"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/amrav/sparrow/proto"
)

func (c *Client) GetFileList(nick string) []byte {
	done := make(chan struct{})
	defer close(done)
	ch := c.ClientMessages(nick, done)
	c.MessageHub("$ConnectToMe %s %s:%d|", nick,
		c.Active.Ip.String(), c.Active.Port)
	c.MsgClient(nick, "$Direction Download 29000")
	c.MsgClient(nick, "$ADCGET file files.xml.bz2 0 -1|")

	for msg := range ch {
		switch msg := msg.(type) {
		case string:
		case []byte:
			log.Printf("Got file list: %d bytes", len(msg))
			return msg
		}
	}
	panic("Client channel closed without getting file list")
}

func (c *Client) Search(searchString string) {
	searchString = proto.Escape(searchString)
	searchString = strings.Replace(searchString, " ", "$", -1)
	c.MessageHub("$Search %s:%d F?T?0?1?%s|", c.Active.Ip.String(),
		c.Active.UdpPort, searchString)
}

func (c *Client) SearchResults(srCh chan proto.SearchResult, doneCh chan struct{}) {
	done := make(chan struct{})
	defer close(done)
	ch := c.ClientMessages("*", done)

	srRe := regexp.MustCompile(`^\$SR (\S+) (.+?)(\x05\d+)? (\d+)/(\d+)\x05TTH:(\S+)`)
	sent, maxSent := 0, 20000
	for {
		select {
		case msg := <-ch:
			switch msg := msg.(type) {
			case string:
				m := srRe.FindStringSubmatch(msg)
				if m != nil {
					// log.Printf("Result: %s", msg)
					// log.Printf("Match: %+v", m)
					size, isDirectory := uint64(0), true
					// log.Printf("len(m) = %d", len(m))
					if m[3] != "" {
						size, _ = strconv.ParseUint(m[3][1:],
							10, 64)
						isDirectory = false
					}
					freeSlots, _ := strconv.ParseUint(m[4],
						10, 64)
					totalSlots, _ := strconv.ParseUint(m[5],
						10, 64)
					sr := proto.SearchResult{
						Type:        "RECEIVE_SEARCH_RESULT",
						Nick:        m[1],
						Name:        m[2],
						Size:        size,
						FreeSlots:   freeSlots,
						TotalSlots:  totalSlots,
						Tth:         m[6],
						IsDirectory: isDirectory,
					}
					if sent < maxSent {
						select {
						case srCh <- sr:
							log.Printf("Sent result: %+v", sr)
						case <-time.After(2 * time.Second):
							log.Fatal("Search results channel blocked too long")
						}
						sent += 1
					}
				}
			}
		case <-doneCh:
			return
		}
	}
}

func (c *Client) DownloadFile(name string, tth string, nick string, size uint64, progressCh chan int) {
	defer close(progressCh)
	done := make(chan struct{})
	defer close(done)
	ch := c.ClientMessages(nick, done)
	c.MessageHub("$ConnectToMe %s %s:%d|", nick,
		c.Active.Ip.String(), c.Active.Port)

	downloaded := 0
	usr, _ := user.Current()
	file, err := os.Create(path.Join(usr.HomeDir, "DC-sparrow", name))
	if err != nil {
		log.Fatal("Couldn't open download file: ", err)
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Fatal("Couldn't close download file: ", err)
		}
	}()
	for msg := range ch {
		switch msg := msg.(type) {
		case string:
			if strings.HasPrefix(msg, "$Key ") {
				// Handshake complete
				c.MsgClient(nick, "$ADCGET file TTH/%s 0 %d|", tth, size)
			}
		case []byte:
			downloaded += len(msg)
			log.Printf("Downloaded %s: (%d of %d bytes) (%d%%)", name,
				downloaded, size, int(downloaded*100/int(size)))
			if progressCh != nil {
				select {
				case progressCh <- downloaded:
				default:
					panic("Couldn't write to progressCh")
				}
			}
			_, err := file.Write(msg)
			if err != nil {
				log.Fatal("Couldn't write file: ", err)
			}
			// TODO: Figure out whether to use uint64 or int
			if downloaded == int(size) {
				log.Printf("Download complete: %s (%d bytes)",
					name, size)
				return
			}
		}
	}
	if downloaded != int(size) {
		log.Printf("Warning: Couldn't complete file download %s (%d bytes downloaded)", name, downloaded)
	}
}
