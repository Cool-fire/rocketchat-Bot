const express = require('express')
const { driver, api } = require('@rocket.chat/sdk');

const app = express()
const port =5000
app.use(express.urlencoded());
app.use(express.json());


const HOST = '192.168.0.5:3000';
const USER = 'bot';
const PASS = 'pass';
const BOTNAME = 'rcbot'; 
const SSL = false; 
const ROOMS = ['GENERAL'];

var myuserid;
// this simple bot does not handle errors, different message types, server resets 
// and other production situations 

const runbot = async () => {
    const conn = await driver.connect( { host: HOST, useSsl: SSL})
    myuserid = await driver.login({username: USER, password: PASS});
    const roomsJoined = await driver.joinRooms(ROOMS);
    console.log('joined rooms');

    // set up subscriptions - rooms we are interested in listening to
    const subscribed = await driver.subscribeToMessages();
    console.log('subscribed');

    // connect the processMessages callback
    const msgloop = await driver.reactToMessages( processMessages );
    console.log('connected and waiting for messages');

    // when a message is created in one of the ROOMS, we 
    // receive it in the processMesssages callback

    // greets from the first room in ROOMS 
    const sent = await driver.sendToRoom( BOTNAME + ' is listening ...',ROOMS[0]);
    console.log('Greeting message sent');
}

// callback for incoming messages filter and processing
const processMessages = async(err, message, messageOptions) => {
  if (!err) {
    // filter our own message
    if (message.u._id === myuserid) return;
    // can filter further based on message.rid
    const roomname = await driver.getRoomName(message.rid);
    if (message.msg.toLowerCase().startsWith("@bot tall")) {
      const response = message.u.username + 
            ', how can ' + BOTNAME + ' help you with ' +
            message.msg.substr(BOTNAME.length + 1);
      // const sentmsg = await driver.sendToRoom(response, roomname);
      //"blocks":[{"type":"section","text":"hii","blockId":"1234","accessory":{"type":"button","action_id":"id","text":"Click here","value":"ok","url":"https://www.google.com"},"elements":[{"type":"button","action_id":"id","text":"Click here","value":"neutral","url":"https://www.google.com"},{"type":"button","action_id":"id","text":"Click here","value":"cancel","url":"https://www.google.com"}]}]
       // "attachments": [ { "title": "interactive buttons", "button_alignment": "horizontal", "actions": [ { "type": "button", "text": "Ok", "url": "http://koji.serveo.net/?rid=GENERAL", "is_webview": true,"webview_height_ratio": "tall" }, { "type": "button", "text": "Cancel ", "url": "http://koji.serveo.net/?rid=GENERAL","is_webview": true,"webview_height_ratio": "full" } ] } ]
        	const sentmsg = await driver.sendMessage({ "rid": "GENERAL", "msg": "clicking on button sends response to bot", "blocks": [ { "type": "section","text":{"type":"plain_text","text":"gooo"}, "blockId": "1234", "accessory": { "type": "button","text":{"type":"plain_text","text":"access"}, "action_id": "id", "value": "ok", "url": "https://www.google.com" } } ] })
    }
  }
}

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/webhook_url', function (req, res) {
  let body = req.body;
  console.log(body)
  // if(body.type === "button"){
  // 	if(body.value === "ok"){
  // 		const updateMsg = api.post('chat.update', {"roomId":"GENERAL", "msgId":"qbt794H8gwyu7DfxF", "text": "updated text by bot" }, true)
  // 		      // const sentmsg = driver.sendMessage({ "rid": "GENERAL", "msg": "This is a test!" ,"attachments": [ { "title": "image button with msg in chat window", "actions": [ { "type": "button", "image_url": "http://www.emoji.co.uk/files/phantom-open-emojis/travel-places-phantom/12698-airplane.png", "msg": "I clicked the airplane", "msg_in_chat_window": true } ] } ] });
  // 	}
  // 	if(body.value === "cancel"){
  // 		const sentmsg = driver.sendToRoom("request cancelled by bot", ROOMS[0])
  // 	}
  // }
  if(body.responseObj.value == "Ok"){
      const updateMsg = api.post('chat.update', {"roomId":"GENERAL", "msgId":body.responseObj.msgId, "text": "updated text ","attachments": [ { "title": "image button with msg ", "actions": [ { "type": "button", "image_url": "http://www.emoji.co.uk/files/phantom-open-emojis/travel-places-phantom/12698-airplane.png", "msg": "I clicked the airplane", "msg_in_chat_window": true } ] } ] }, true);
  } else if (body.responseObj.value == "Cancel "){
          const updateMsg = api.post('chat.update', {"roomId":"GENERAL", "msgId":body.responseObj.msgId, "text": "Are you sure? ","attachments": [ { "title": "interactive buttons", "button_alignment": "horizontal", "actions": [ { "type": "button", "text": "Yes", "url": "http://www.kayak.com", "is_webview": true }, { "type": "button", "text": "No ", "url": "https://requests.example.com/cancel/r123456", "is_webview": true } ] } ] }, true);
  } else if(body.responseObj.value == "Yes"){
      const sentmsg = driver.sendToRoom("request cancelled by user", body.responseObj.roomId)
  }

  res.send('Got a POST request');
})

runbot();

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
