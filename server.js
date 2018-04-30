require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const debug = require('debug')('slash-command-template:index');

const app = express();


/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
 * Endpoint to receive /helpdesk slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/andon-test', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const { token, text, trigger_id, user_id } = req.body;
  
  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    // immediately respond with a empty 200 response to let
    // Slack know the command was received

    if(text.toLowerCase() == 'help')
    {
        var body = {
                "response_type": "ephemeral",
                "text": "Need some help with `/andon`?",
                "attachments": [
                    {
                        "text": "Use `/andon` to set the promote status of the Release branch. Usage : \n • `/andon pull` or `/andon p` to pull the Andon cord and Stop the Line! \n • `/andon release` or `/andon r` to release the Andon cord and start the line running again",
                        "mrkdwn_in": ["text", "pretext"]
                    }
                ]
            }
        
        res.send(body);
    }

    if(text.toLowerCase() == 'pull' || text.toLowerCase() == 'p')
    {
        var body = {
                "response_type": "in_channel",
                "attachments": [
                    {
                        "title": "Andon Pulled by <@" + user_id + ">. Line Stopped!",
                        "color": "danger",
                    },
                ]
        }; 
      
        var channel_status = qs.stringify({
                token:process.env.SLACK_TOKEN,
                channel:process.env.SLACK_CHANNEL_ID,
                topic: 'Line STOPPED! :no_entry:'
        });
      
        res.send(body);
      
        if(process.env.UPDATE_CHANNEL_TOPIC === true)
        {
          var channel_status = {
            token:process.env.SLACK_TOKEN,
            channel:process.env.SLACK_CHANNEL_ID,
            topic: 'Line STOPPED. :no_entry:'
          };
      
          const url = 'https://slack.com/api/channels.setTopic';
      
          axios.post(url, qs.stringify(channel_status), {
            "Content-Type": "application/x-www-form-urlencoded"
          })
          // .then(response => console.log(response))
          .catch(errors => console.log(errors));
        }            
    }

    if(text.toLowerCase() == 'release' || text.toLowerCase() == 'r')
    {
        var body = {
                "response_type": "in_channel",
                "attachments": [
                    {
                        "title": "Andon Released by <@" + user_id + ">. Line running again. As you were....",
                        "color": "good",
                    },
                ]
        };
      
        res.send(body);
        
        if(process.env.UPDATE_CHANNEL_TOPIC === true)
        {
          var channel_status = {
            token:process.env.SLACK_TOKEN,
            channel:process.env.SLACK_CHANNEL_ID,
            topic: 'Line running. :white_check_mark:'
          };
      
          const url = 'https://slack.com/api/channels.setTopic';
      
          axios.post(url, qs.stringify(channel_status), {
            "Content-Type": "application/x-www-form-urlencoded"
          })
          // .then(response => console.log(response))
          .catch(errors => console.log(errors));
        }
    }
  } else {
    debug('Token mismatch');
    res.sendStatus(500);
  }
});         

  
app.listen(process.env.PORT, () => {
  console.log(`App ${process.env.PROJECT_DOMAIN}listening on port ${process.env.PORT}!`);
});  