import * as dotenv from 'dotenv' 
dotenv.config()

import {createEventAdapter} from '@slack/events-api'
import {WebClient} from '@slack/web-api'

console.log('Getting started with adavonneiofj')

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET)
const port = process.env.PORT || 3000;

const web = new WebClient(process.env.BOT_USER_OAUTH_ACCESS_TOKEN)
const currentTime =  new Date().toTimeString();

(async () => {
    try {
        await web.chat.postMessage({
            channel: '#lunch-mixer',
            text: `The current time is ${currentTime}`,
        });
    } catch (error) {
        console.log(error);
    }

    console.log('Time posted~')
})();

slackEvents.on('message', (event) => {
    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
})

slackEvents.on('error', console.error);

slackEvents.start(port).then(()=>{
    console.log(`server listening to port ${port}`)
})