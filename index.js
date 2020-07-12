//import * as dotenv from 'dotenv' 
const dotenv = require('dotenv')
dotenv.config()

//import {createEventAdapter} from '@slack/events-api'
//import {WebClient} from '@slack/web-api'

const { createEventAdapter } = require('@slack/events-api')
const { WebClient } = require('@slack/web-api')

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
    let result = 'no value'
    try {
        result = await web.conversations.members({
            channel: 'C01742NR3HA', // retrieved manually using tester code and bot token at https://api.slack.com/methods/conversations.list/test
        });
    } catch (error) {
        console.log(error);
    }

    const mixed_groups = mix_users(result.members)
    const text_message = make_message(mixed_groups)

    try {
        await web.chat.postMessage({
            channel: '#lunch-mixer',
            text: text_message,
        });
    } catch (error) {
        console.log(error);
    }

    console.log('Posting result of member query')
    console.log(result)
})();

// generally want groups of 5. 5 + 1 = 3 + 3
// 5 + 2 = 4 + 3, 5 + 3 = 4 + 4, 5 + 4 = 5 + 4
// so, 1>2>3, then 1>2>3, then 4,3 then 4,4 then 5,4 
const mix_users = members => {
    members = shuffle(members)
    const groups = []
    members.forEach((member, index) => {
        if ((index+1)%5 === 1)
            groups.push([member])
        else groups [Math.floor(index/5)].push(member)
    });

    final_group_index = Math.floor(members.length/5)

    if (final_group_index > 0 && groups[final_group_index].length < 3) {
        groups[final_group_index].push(groups[final_group_index-1].pop())
    }

    if (final_group_index > 0 && groups[final_group_index].length < 3) {
        groups[final_group_index].push(groups[final_group_index-1].pop())
    }

    return groups
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

const make_message = (groups) => {
    let text = ''
    groups.forEach((group, index) => {
        text = text + `Group ${index+1}: <@${group[0]}> (zoom host) with `
        group.forEach((member, index2)=>{
            if (index2 !== 0)
                text = text + `<@${member}> `
        })
        text = text + `\n`
    })
    return text
}

slackEvents.on('app_mention', (event) => {
    console.log(event)
    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
    

})

slackEvents.on('error', console.error);

slackEvents.start(port).then(()=>{
    console.log(`server listening to port ${port}`)
})