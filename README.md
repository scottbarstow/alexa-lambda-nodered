# alexa-lambda-nodered
A simple [AWS Lambda](http://aws.amazon.com/lambda) function that demonstrates how to write a skill for the Amazon Echo using the Alexa SDK and call an external service deployed using [Node Red](http://nodered.org). A lot of this example was built using the [Amazon samples](http://github.com/amzn/alexa-skills-kit-js) as a template.

## Concepts
This project shows how to create a Lambda function for handling Alexa Skill requests that:

- Communicates with an external webservice deployed using the NodeRed project
- Handles a very simple interaction with Alexa that allows you to ask for info about a person by first name. Not much practical use but it's my first project using all three components for an end to end interaction.

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