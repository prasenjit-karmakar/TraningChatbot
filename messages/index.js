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

   intents.matches(/search /i, function (session, args) {
    session.sendTyping(); 
    var input = args.matched.input
    var GoogleSearch = require('google-search');
    var googleSearch = new GoogleSearch({
    key: 'AIzaSyDpYiVTNJIYW9ZuYwbXoSbicjYazDJO3Xs',
    cx: '000397035475459010136:pjvn0287nfk'
});
 
 
googleSearch.build({
  q: input,
  start: 5,
  //gl: "tr", //geolocation, 
  //lr: "lang_tr",
  num: 10, // Number of search results to return between 1 and 10, inclusive 
  //siteSearch: "https://www.techolution.com" // Restricts results to URLs from a specified site 
}, function(error, response) {
  //console.log(response);
 var results = response.items;
 var linkArr = [];
 results.forEach(function(value){
  linkArr.push(value.link);
});
    session.send("Here are top 10 search results for you ....."+ "\n"+JSON.stringify(linkArr).replace('[','').replace(']','').replace(/,/g, '\n'));
});
  });

  intents.onDefault(function (session, args, next) {
      session.send("I'm sorry . I didn't understand.");
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
