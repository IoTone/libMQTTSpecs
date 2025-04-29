# Overview

The goal of this project is to build an MQTT library in typescript for the Snap Spectacles.  It ideally works with WS or TCP sockets, though at this stage it probably must be Web Sockets.

## Design

Without studying the spec too deeply, porting over a minimalist browser based mqtt library client for MQTT 3.1 or so.  If successful, it should be possible to use this in spectacles applications with experimental APIs on.

## Status

In progress.  Web stockets must be integrated and then testing.

## Testing

There is an example project provided.  It will just ping the test.mosquitto.org when the button toggle is hit.

## Known Issues

- Needs to support MQTT > 3.1
- Needs security
- Needs a test suite
- Needs to work with TCP and any other transports
- Will not work without security on
- The original JS used for the MQTT needs to ge modernized so that it is starting from .TS and then generates the .JS ... in this way, one could truly verify the portability.
- There may be a more efficient design.  Since most JS libraries started in the browser or in Node.js, this one has elements of Node.js.  


