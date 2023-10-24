const { App, LogLevel } = require('@slack/bolt');
const { config } = require('dotenv');
config();

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

// Initialize the mentioned component
let sliderMentionCount = 0;  

// Define the target channel
const targetChannel = 'C0604EZGASH';

// Listen for messages in the channel
app.message(async ({ message, say }) => {
  if (message.channel === targetChannel) {
    //Using the console to find out why the messages are not appearing
    console.log(message.text);

    // count and increment everytime the word slider is mentioned
    const matches = (message.text.match(/slider/gi) || []).length;
    sliderMentionCount += matches;
   
    if (matches > 0) {
      await say(`The word "Slider" has been mentioned ${sliderMentionCount} times.`);
    }
  }
});

/** Start Bolt App */
(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running! ⚡️');
  } catch (error) {
    console.error('Unable to start App', error);
  }
})();
