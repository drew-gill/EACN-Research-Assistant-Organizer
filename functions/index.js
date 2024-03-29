'use strict'
const functions = require('firebase-functions');
const config = functions.config();

const twilio = require('twilio');
const client = new twilio(config.twilio.account_sid, config.twilio.auth_token)

const { App, ExpressReceiver } = require('@slack/bolt');
const expressReceiver = new ExpressReceiver({
    signingSecret: config.slack.signing_secret,
    endpoints: '/events',
    processBeforeResponse: true,
});
const app = new App({
    receiver: expressReceiver,
    token: config.slack.bot_token,
    processBeforeResponse: true,
});

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Global error handler
app.error(console.log);

initializeApp({
    credential: applicationDefault()
});
  
const db = getFirestore();

// Handle `/echo` command invocations
app.command('/echo-from-firebase', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();

    // Requires:
    // Add chat:write scope + invite the bot user to the channel you run this command
    // Add chat:write.public + run this command in a public channel
    await say(`You said "${command.text}"`);
});

app.command('/remind-users-schedule', async ({command, ack, say}) => {
    // Acknowledge command request
    await ack().then(() => 
        client.messages.create({
        body: 'Reminder that you have a shift today at noon!',
        to: command.text, // Text this number (format +11234567890)
        from: '+13526058962', // From a valid Twilio number
        })
        .then((message) => console.log(message.sid))
    );

    // Requires:
    // Add chat:write scope + invite the bot user to the channel you run this command
    // Add chat:write.public + run this command in a public channel
    await say(`You sent a reminder to ${command.text}!`);
})

app.command('/remind-by-name', async ({command, ack, say}) => {
    await ack();

    const userRef = db.collection("users").doc(command.text)
    const user = await userRef.get();
    if (!doc.exists) {
        say("No such user!");
    } else {
        await client.messages.create({
            body: 'Reminder that you have a shift today from 10am-12pm!',
            to: user.number, // Text this number (format +11234567890)
            from: '+13526058962', // From a valid Twilio number
            })
            .then(() => say(`You sent a reminder to ${command.text} at ${user.number}!`))
    }
})

// https://{your domain}.cloudfunctions.net/slack/events
exports.slack = functions.https.onRequest(expressReceiver.app);