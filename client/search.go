package client

type SearchResult struct {
	sourceNick    string
	fileName      string
	fileSize      string
	directoryName string
	isDirectory   bool
	freeSlots     uint64
	totalSlots    uint64
}
