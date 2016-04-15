package client

import (
	"log"
	"regexp"
	"strconv"
	"strings"

	"github.com/amrav/sparrow/proto"
)

func (c *Client) GetFileList(nick string) []byte {
	done := make(chan struct{})
	defer close(done)
	ch := c.ClientMessages(nick, done)
	c.MessageHub("$ConnectToMe %s %s:%d", nick,
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

func (c *Client) Search(searchString string, searchResults chan proto.SearchResult,
	doneCh chan struct{}) {
	done := make(chan struct{})
	defer close(done)
	ch := c.ClientMessages("*", done)
	c.MessageHub("$Search %s:%d F?T?0?1?%s|", c.Active.Ip.String(), c.Active.UdpPort,
		proto.Escape(searchString))

	//	srRegexp := regexp.MustCompile(`\$SR (\S+) (.+?)\x05(\d+) (\d+)/(\d+)\x05TTH:(\W+)`)
	srRegexp := regexp.MustCompile(`\$SR (\S+) (.+?)(\x05\d+)? (\d+)/(\d+)\x05TTH:(\S+)`)
	for {
		select {
		case msg := <-ch:
			switch msg := msg.(type) {
			case string:
				if strings.HasPrefix(msg, "$SR ") {
					m := srRegexp.FindStringSubmatch(msg)
					if m == nil {
						continue
					}
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
					searchResults <- sr
				}
			}
		case <-doneCh:
			log.Printf("Search of %s stopped by doneCh close.", searchString)
			return
		}
	}
}
