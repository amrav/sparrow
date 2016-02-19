package client

import "log"

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
