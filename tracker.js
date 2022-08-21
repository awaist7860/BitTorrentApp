'use strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;

const crypto = require('crypto');   //1




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

    const buf = Buffer.alloc(16); //2

    //connection id
    buf.writeUInt32BE(0x417, 0);  //3
    buf.writeUInt32BE(0X27101980, 4);

    //Action
    buf.writeUInt32BE(0, 8);  //4

    //transactionID
    crypto.randomBytes(4).copy(buf, 12);  //5

    return buf;

    //1. (Const Crypto) First we require the built-in crypto module to help us create a random number for our buffer. We’ll see that in action shortly.

    //2. Then we create a new empty buffer with a size of 16 bytes since we already know that the entire message should be 16 bytes long.

    //3. Here we write the the connection id, which should always be 0x41727101980 when writing the connection request. We use the method writeUInt32BE which writes an unsigned 32-bit integer in big-endian format (more info here). We pass the number 0x417 and an offset value of 0. And then again the number 0x27101980 at an offset of 4 bytes. You might be wondering 2 things: what’s with the 0x? and why do we have to split the number into two writes? The 0x indicates that the number is a hexadecimal number, which can be a more conventient representation when working with bytes. Otherwise they’re basically the same as base 10 numbers. The reason we have to write in 4 byte chunks, is that there is no method to write a 64 bit integer. Actually node.js doesn’t support precise 64-bit integers. But as you can see it’s easy to write a 64-bit hexadecimal number as a combination of two 32-bit hexadecimal numbers.

    //4. Next we write 0 for the action into the next 4 bytes, setting the offset at 8 bytes since just wrote an 8 byte integer. This values should always be 0 for the connection request.

    //5. For the final 4 bytes we generate a random 4-byte buffer using crypto.randomBytes which is a pretty handy way of creating a random 32-bit integer. To copy that buffer into our original buffer we use the copy method passing in the offset we would like to start writing at.

  }
  
  function parseConnResp(resp) {
    // ...

    return{
      action: resp.readUInt32BE(0),
      transactionId: resp.readUInt32BE(4),
      connectionId: resp.slice(8)
    }
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