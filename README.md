# alexa-lambda-nodered
A simple [AWS Lambda](http://aws.amazon.com/lambda) function that demonstrates how to write a skill for the Amazon Echo using the Alexa SDK and call an external service deployed using [Node Red](http://nodered.org). A lot of this example was built using the [Amazon samples](http://github.com/amzn/alexa-skills-kit-js) as a template.

I've been wanting to get into both Lambda and Alexa, so this was an excuse to see how it all worked.

## Concepts
This project shows how to create a Lambda function for handling Alexa Skill requests that:

- Communicates with an external webservice deployed using the NodeRed project
- Handles a very simple interaction with Alexa that allows you to ask for info about a person by first name. Not much practical use but it's my first project using all three components for an end to end interaction.

## Some Key Info
- Once you're done with the Alexa Skill setup, the skill is deployed to any Alexa you own that's tied to the same Amazon ID you're using to create the Lambda and Alexa Skill. It's really convenient. Once you've saved the skill, you can immediately interact with it. Very slick.
- The configuration of both the Skill and Lambda function are not super intuitive, which is somewhat typical for Amazon UI/UX. Takes some getting used to. I had the Alexa console open on one monitor and the Lambda console open on another while I was testing. Made it much easier to see how things flowed.

## Setup
To run this example skill you need to do three things. The first is to deploy the function code in Lambda. The second is to configure the Alexa skill to use Lambda. The third is to deploy the Node Red flow somewhere where it can be accessed by Lambda

### AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda link. Note: ensure you are in us-east or you won't be able to use Alexa with Lambda.
2. Click on the Create a Lambda Function or Get Started Now button.
3. Skip the blueprint
4. Name the Lambda Function "Get-Person-Info-Skill".
5. Select the runtime as Node.js
6. Go to the the src directory, select all files and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.
7. Select Code entry type as "Upload a .ZIP file" and then upload the .zip file to the Lambda
8. Keep the Handler as index.handler (this refers to the main js file in the zip).
9. Create a basic execution role and click create.
10. Leave the Advanced settings as the defaults.
11. Click "Next" and review the settings then click "Create Function"
12. Click the "Event Sources" tab and select "Add event source"
13. Set the Event Source type as Alexa Skills kit and Enable it now. Click Submit.
14. Copy the ARN from the top right to be used later in the Alexa Skill Setup

### Alexa Skill Setup
1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set "Get Person Info" for the skill name and "person info" as the invocation name, this is what is used to activate your skill. For example you would say: "Alexa, Ask Person Info about Scott."
3. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above. Click Next.
4. Copy the Intent Schema from the included IntentSchema.json.
5. Copy the Sample Utterances from the included SampleUtterances.txt. Click Next.
6. [optional] go back to the skill Information tab and copy the appId. Paste the appId into the index.js file for the variable APP_ID,
   then update the lambda source zip file with this change and upload to lambda again, this step makes sure the lambda function only serves request from authorized source.
7. You are now able to start testing your sample skill! You should be able to go to the [Echo webpage](http://echo.amazon.com/#skills) and see your skill enabled.
8. In order to test it, try to say some of the Sample Utterances from the Examples section below.
9. Your skill is now saved and once you are finished testing you can continue to publish your skill.
10. You can test your skill by clicking the test button and pasting in the following Alexa event JSON sample. Note the only thing that really matters in this file is the **intent** section.

```
{
  "session": {
    "new": false,
    "sessionId": "amzn1.echo-api.session.[unique-value-here]",
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.[unique-value-here]"
    },
    "application": {
      "applicationId": "amzn1.ask.skill.[unique-value-here]"
    }
  },
  "version": "1.0",
  "request": {
    "locale": "en-US",
    "timestamp": "2016-10-27T21:06:28Z",
    "type": "IntentRequest",
    "requestId": "amzn1.echo-api.request.[unique-value-here]",
    "intent": {
      "slots": {
          "person": {
              "name": "person",
              "value": "scott"
          }
      },
      "name": "GetPersonInfoIntent"
    }
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "device": {
        "supportedInterfaces": {
          "AudioPlayer": {}
        }
      },
      "application": {
        "applicationId": "amzn1.ask.skill.[unique-value-here]"
      },
      "user": {
        "userId": "amzn1.ask.account.[unique-value-here]"
      }
    }
  }
}
```

### Node Red Setup
1. npm install -g node-red on a publicly acccessible machine
2. Copy the files in the node-red folder of this project to the host machine.
3. Start node-red by typing node-red -s settings.json in the folder where you put the files. This will launch node-red with the flows.json as the flow file.
4. This exposes a get webservice at http://yourip:1880/message. You should be able to hit it in your browser and see the sample json returned.

### Putting It All Together

It took me a while to get all of this figured out, so I'm going to elaborate a bit on how all of the pieces fit together.

When you say 'Alexa ask Person Info about Scott', Alexa parses your voice request and puts the value of the name requested (in my case 'scott') in the slot for the intent.

If you look at the Utterance, I have one that says `about {person}`. So, Alexa says "Oh, you want to know about Scott", so it creates an event like the one above and puts the value of 'scott' in the person slot of the 'GetPersonInfoIntent'

```
"intent": {
      "slots": {
          "person": {
              "name": "person",
              "value": "scott"
          }
      },
      "name": "GetPersonInfoIntent"
```

Then, in the lambda function, you'll see that I dig the value out of the intent using this code:

```    
var person = intent.slots.person.value;
```

I could do anything I want with this value. In the case of this example, I just use it in the response from Alexa, but I could easily pass it to an external service or whatever.

The lambda function then makes a request to the NodeRed flow using this code:

```
PersonInfo.prototype.intentHandlers = {
  GetPersonInfoIntent: function(intent, session, response){
    handlePersonInfoRequest(intent, session, response);
  },

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

var getPersonInfo = function(person, callback){
    http.get("http://yourip:1880/message", function(res){
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
```

I tell the intent handler to handle the GetPersonInfoIntent, then it calls `handlePersonInfoRequest`, which then calls `getPersonInfo`, which calls my NodeRed flow.

The NodeRed flow returns a really simple JSON payload that looks something like this:
```
{
	"name":"scott",
	"height":"6 feet 4 inches",
	"weight":"192 lbs"
}
```

That's pretty much it! If you have any questions or the code doesn't work for you for some reason, [hit me up on the Twitter](https://twitter.com/scottbarstow).
