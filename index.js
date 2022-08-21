'use strict';


//Link to website
//https://allenkim67.github.io/programming/2016/05/04/how-to-make-your-own-bittorrent-client.html

const fs = require('fs');
const bencode = require('bencode');
const tracker = require('./tracker');
const torrentParser = require('./torrent-parser');

//1
//const dgram = require('dgram');
//const Buffer = require('buffer').Buffer;
//const urlParse = require('url').parse;

//const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));

const torrent = torrentParser.open('puppy.torrent');

tracker.getPeers(torrent, peers => {
    console.log('list of peers: ', peers);
});

//2
//const url = urlParse(torrent.announce.toString('utf8'));

//3
//const socket = dgram.createSocket('udp4');

//4
//const myMsg = Buffer.from('Hello?', 'utf8');

//5
//socket.send(myMsg, 0, myMsg.length, url.port, url.host, () => {});

//6
//socket.on('message', msg => {
    //console.log('message is ', msg);
//});

console.log(torrent.announce.toString('utf8'));

//1) First we require 3 more modules, dgram, buffer, and url. These are all just from the standard library.

//2) I use the url module’s parse method on our tracker url. This lets me easily extract different parts of the url like its protocol, hostname, port, etc.

//3) The dgram module is our module for udp, and here I’m creating a new socket instance. A socket is an object through which network communication can happen. We pass the argument ‘udp4’, which means we want to use the normal 4-byte IPv4 address format (e.g. 127.0.0.1). You can also pass ‘udp6’ for the newer IPv6 address format (e.g. FE80:CD00:0000:0CDE:1257:0000:211E:729C) but this format is still rarely used.

//3) In order to send a message through a socket, it must be in the form of a buffer, not a string or number. Buffer.from is an easy way to create a buffer from a string, see my mini guide for more info on buffers.

//5) The socket’s send method is used for sending messages. The first argument is the message as a buffer. The next two arguments let you send just part of the buffer as the message by specifying an offset and length of the buffer, but if you’re just sending the whole buffer you can just set the offset to 0 and the length to the whole length of the buffer. Next is the port and host of the receiver’s url. Finally the last argument is a callback for when the message has finished sending.

//6) ere we tell the socket how to handle incoming messages. Whenever a message comes back through the socket it will be passed to the callback function.