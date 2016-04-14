package client

import (
	"log"
	"regexp"
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

	srRegexp := regexp.MustCompile(`\$SR (\S+) (.+?)\x05(\d+) (\d+)/(\d+)\x05TTH:(\W+) .+\|$`)
	for {
		select {
		case msg := <-ch:
			log.Printf("Got active message: %s\n", msg)
			switch msg := msg.(type) {
			case string:
				if strings.HasPrefix(msg, "$SR ") {
					log.Printf("Search result: %s", msg)
					m := srRegexp.Match([]byte(msg))
					log.Printf("Match: %s", m)
				}
			}
		case <-doneCh:
			log.Printf("Search of %s stopped by doneCh close.", searchString)
			return
		}
	}
}
