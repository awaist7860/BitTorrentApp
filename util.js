'use strict'

const crypto = require('crypto');

let id = null;

module.exports.genID = () =>{
    if(!id){
        id = crypto.randomBytes(20);
        Buffer.from('-AT0001').copy(id, 0);
    }
    return id;
}

//“peer id” is used to uniquely identify your client. I created a new file called util.js to generate an id for me. A peer id can basically be any random 20-byte string but most clients follow a convention detailed here. Basically “AT” is the name of my client (allen-torrent), and 0001 is the version number. As you can see the id is only generated once. Normally an id is set every time the client loads and should be the same until it’s closed. We’ll we using the id again later.