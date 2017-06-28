// For more information about this template visit http://aka.ms/azurebots-node-qnamaker

"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var builder_cognitiveservices = require("botbuilder-cognitiveservices");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
//                 knowledgeBaseId: process.env.QnAKnowledgebaseId,
//     subscriptionKey: process.env.QnASubscriptionKey});
var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
knowledgeBaseId: 'ec5d68c2-ad34-476f-b328-dcd162d53684',
subscriptionKey: '19731e51bc6e4b68ba6471f88fe6a8f1'});

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
                defaultMessage: 'No match! Try again changing the query terms!',
                qnaThreshold: 0.3}
);


//bot.dialog('/', basicQnAMakerDialog);

  var intents = new builder.IntentDialog();
  bot.dialog('/', intents);

  intents.matches(/short /i, function (session, args) {
      session.sendTyping(); 
      var input = args.matched.input
      
      var data=input.split(" ")[1];
      var Bitly = require('bitly');
      var bitly = new Bitly('4c91152d6d998db81e5edc3f020130009983570e');

      bitly.shorten(data)
        .then(function(response) {
          var short_url = response.data.url
          console.log("shorturl:"+short_url);
          session.send('Your short URL is: '+short_url);
        }, function(error) {
          throw error;
        });
  });

  intents.onDefault(function (session, args, next) {
      session.send("I'm sorry "+session.dialogData.name+". I didn't understand.");
  });

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}
