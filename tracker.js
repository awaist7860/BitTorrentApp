'use strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;


//Module
module.exports.getPeers = (torrent, callback) => {
    const socket = dgram.createSocket('udp4');
    const url = torrent.announce.toString('utf8');

    //1. send connect request
    udpSend(socket, buildConnReq(), url);

    socket.on('message', response => {
        if(respType(response) === 'connect'){
            //2. Recieve and parse connect response
            const connResp = parseConnResp(response);
            //3. Send announe request
            const announceReq = buildAnnounceReq(connResp.connectionId);
            udpSend(socket, announceReq, url);
        } else if (respType(response) === 'announce'){
            //4. Parse announce response
            const announceResp = parseAnnounceResp(response);
            //5. Pass peers to callback
            callback(announceResp.peers);
        }
    });
};

function udpSend(socket, message, rawUrl, callback=()=>{}) {
    const url = urlParse(rawUrl);
}

function respType(resp) {
    // ...
  }
  
  function buildConnReq() {
    // ...
  }
  
  function parseConnResp(resp) {
    // ...
  }
  
  function buildAnnounceReq(connId) {
    // ...
  }
  
  function parseAnnounceResp(resp) {
    // ...
  }

//1) udpSend is just a convenience function that mostly just calls socket.send but lets me avoid having to set the offset and length arguments since I know I want to send the whole buffer, and sets a default callback which is just an empty function, since I mostly don’t need to do anything after sending the message (see point 5 in the previous section if you need a refresher on socket.send)

//2) respType will check if the response was for the connect or the announce request. Since both responses come through the same socket, we want a way to distinguish them.

//3) to 6) These 4 methods will build and parse the connect and announce messages.