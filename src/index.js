var APP_ID = undefined;

var http       = require('http')
  , AlexaSkill = require('./AlexaSkill');
  
var getPersonInfo = function(person, callback){
    http.get("http://107.170.66.63:1880/message", function(res){
        var body = "";
        res.on('data', function(data){
            body += data
        });
        
        res.on('end', function(){
            var result = JSON.parse(body);
            callback(result);
            
        });
    }).on('error', function(e){
        console.log(e);
    })
}

var handlePersonInfoRequest = function(intent, session, response){
    var person = intent.slots.person.value;
    console.log("Person is " + person);
    getPersonInfo(person, function(data){
        var name = data.name;
        var weight = data.weight;
        var height = data.height;
        var cardText = "The person you asked about is " + name + ". He is " + height + " tall and weighs " + weight;
        response.tellWithCard(cardText, "Person Info", cardText);
    })
}


var PersonInfo = function(){
  AlexaSkill.call(this, APP_ID);
};

PersonInfo.prototype = Object.create(AlexaSkill.prototype);
PersonInfo.prototype.constructor = PersonInfo;

PersonInfo.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session){
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
      + ", sessionId: " + session.sessionId);
};

PersonInfo.prototype.eventHandlers.onLaunch = function(launchRequest, session, response){
  var output = 'Welcome to Get Person Info. ' +
    'Which Person do you want to know more about?';

  var reprompt = 'Which person do you want to know more about?';

  response.ask(output, reprompt);

  console.log("onLaunch requestId: " + launchRequest.requestId
      + ", sessionId: " + session.sessionId);
};

PersonInfo.prototype.intentHandlers = {
  GetPersonInfoIntent: function(intent, session, response){
    handlePersonInfoRequest(intent, session, response);
  },

  HelpIntent: function(intent, session, response){
    var speechOutput = 'Get info on anyone in our database';
    response.ask(speechOutput);
  }
};


exports.handler = (event, context, callback) => {
    var skill = new PersonInfo();
    skill.execute(event, context);
};