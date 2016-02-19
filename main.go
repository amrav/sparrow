package main

import (
	"github.com/amrav/sparrow/client"
	"github.com/amrav/sparrow/proto"
)

func main() {
	c := client.New()
	c.StartActiveMode()
	c.SetNick(proto.GenerateRandomUsername())
	c.Connect("10.109.49.49:411")
	c.GetFileList("scallywag")
	<-make(chan struct{})
}
