# Code

1. Generate a pronto payload

   ```js
   var payload = makeFujitsuPayload(
     tempC,
     MODE[mode.toLowerCase()],
     FANSPEED[fanSpeed.toLowerCase()],
     SWING[swing.toLowerCase()],
     powerOn
   )
   ```

1. Add the non-payload metadata to the pronto payload to get a full pronto code

   ```js
   var pronto = addProntoMetadata(
     payload,
     39e3,
     [0x7c, 0x3e],
     [0x10, 0x130],
     [0x10, 0x2e],
     [0x10, 0x10]
   )
   ```

1. Optionally, convert to base64-encoded Broadlink format

   ```js
   var b64 = pronto2broadlink(pronto)
   ```

# Server

The web server can be called with parameters to send to the heatpump. The response will contain the IR code to send to the heatpump to achieve these parameters.

For example, if the server is running at `localhost:8080`:

```sh
# Get pronto format
curl "http://localhost:8080/pronto?tempC=18&mode=heat&fanSpeed=Quiet&swing=Off&powerOn=0"

# Get broadlink format
curl "http://localhost:8080/broadlink?tempC=18&mode=heat&fanSpeed=Quiet&swing=Off&powerOn=0"
```

## Run it with Node

1. Install express

   ```sh
   yarn install
   ```

1. Start the server.

   ```sh
   yarn start
   ```

## Run it with Docker

1. Build it

   ```sh
   docker build -t ar-ry13 .
   ```

1. Run it

   ```sh
   docker run -it -p 8080:8080 ar-ry13
   ```
