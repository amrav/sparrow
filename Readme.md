**sparrow** is a fast, lightweight DC client. It has a modern web UI for when you want to look at it, and otherwise runs in the background so you can forget it.

## Installation

### Prerequisites
* go ^1.6
* gulp ^3.9.x
* node ^4.x

### Build
```sh
# In the appropriate directory, e.g. "$GOPATH/src/github.com/amrav/sparrow"
git clone https://github.com/amrav/sparrow
cd ui
npm install
# The next step may seem to hang. However, once it says "Finished bundling", it is safe to Ctrl-C.
gulp build
cd ..
go build
```

## Run
Once `go build` completes successfully, you should find a `sparrow` executable in that directory.
```sh
./sparrow
```
This will start the client, which will try to connect to the HHFH hub at IIT KGP. Logs are written to stdout. To connect to the web client, go to `localhost:12345` in a web browser.

## Caveats
This program is pre-alpha quality software. I wouldn't be surprised if it worked for you, but don't install it unless you're a masochist, or a programmer.

If you're going to try, then know that restarting the binary fixes most issues.

If you're still around after that, pull requests are welcome.

## License
GPLv3
