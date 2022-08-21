'use strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;

const crypto = require('crypto');   //1

const torrentParser = require('./torrent-parser');
const util = require('./util');

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
            const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
            
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

  const action = resp.readUInt32BE(0);
  if (action === 0) return 'connect';
  if (action === 1) return 'announce';

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

    //Buffer example
    //Offset  Size            Name            Value
    //0       32-bit integer  action          0 // connect
    //4       32-bit integer  transaction_id
    //8       64-bit integer  connection_id
    //16



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
  
  function buildAnnounceReq(connId, torrent, port=6881) {
    // ...
    
    const buf = Buffer.allocUnsafe(98);

    //connection id
    connId.copy(buff, 0);

    //action
    buf.writeUInt32BE(1, 8);

    //transactionID
    crypto.randomBytes(4).copy(buf, 12);

    //infoHasher
    torrentParser.infoHash(torrent).copy(buf, 16);

    //pEERid
    util.genID().copy(buf, 36);

    //downloaded
    Buffer.alloc(8).copy(buf, 56);

    torrentParser.size(torrent).copy(buf, 64);

    //uploaded
    Buffer.alloc(8),copy(buf, 72);

    //event
    buf.writeUInt32BE(0, 80);

    //ip address
    buf.writeUInt32BE(0, 80);

    //key
    crypto.randomBytes(4).copy(buf, 88);

    //num want
    buf.writeUInt32BE(-1, 92);

    //port
    buf.writeUInt32BE(port, 96);

    //Offset  Size    Name    Value
    //0       64-bit integer  connection_id
    //8       32-bit integer  action          1 // announce
    //12      32-bit integer  transaction_id
    //16      20-byte string  info_hash
    //36      20-byte string  peer_id
    //56      64-bit integer  downloaded
    //64      64-bit integer  left
    //72      64-bit integer  uploaded
    //80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
    //84      32-bit integer  IP address      0 // default
    //88      32-bit integer  key             ? // random
    //92      32-bit integer  num_want        -1 // default
    //96      16-bit integer  port            ? // should be betwee
    //98

  }
  
  function parseAnnounceResp(resp) {
    // ...

    function group(iterable, groupsize){
      let groups = [];
      for(let i = 0; i < iterable.length; i += groupsize){
        groups.push(iterable.slice(i, i + groupsize));
      }

      return groups;
    }

    return {
      action: resp.readUInt32BE(0),
      transactionId: resp.readUInt32BE(4),
      leechers: resp.readUInt32BE(8),
      seeders: resp.readUInt32BE(12),
      peers: group(resp.slice(20), 6).map(address =>{
        return{
          ip: address.slice(0, 4).join('.'),
          port: address.readUInt16BE(4)
        }
      })
    }

  }

//1) udpSend is just a convenience function that mostly just calls socket.send but lets me avoid having to set the offset and length arguments since I know I want to send the whole buffer, and sets a default callback which is just an empty function, since I mostly don’t need to do anything after sending the message (see point 5 in the previous section if you need a refresher on socket.send)

//2) respType will check if the response was for the connect or the announce request. Since both responses come through the same socket, we want a way to distinguish them.

//3) to 6) These 4 methods will build and parse the connect and announce messages.