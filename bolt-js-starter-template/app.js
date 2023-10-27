const { App, LogLevel } = require('@slack/bolt');
const { config } = require('dotenv');
const { Client } = require('@notionhq/client');
config();
const notion = new Client({ auth: process.env.NOTION_SECRET });
const databaseId = process.env.NOTION_DATABASE_ID;
/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

const baseuiComponentsDictionary = {
  Buttons: [
    "button",
    "button-group"
  ],
  Inputs: [
    "checkbox",
    "form-control",
    "input",
    "payment-card",
    "phone-input",
    "pin-code",
    "radio",
    "slider",
    "textarea"
  ],
  Pickers: [
    "file-uploader",
    "menu",
    "rating",
    "select"
  ],
  DateTime: [
    "datepicker",
    "time-picker",
    "timezone-picker"
  ],
  Navigation: [
    "breadcrumbs",
    "header-navigation",
    "link",
    "pagination",
    "side-nav",
    "tabs"
  ],
  Content: [
    "accordion",
    "avatar",
    "dnd-list",
    "layout-grid",
    "heading",
    "icon",
    "list",
    "tag",
    "tree-view",
    "typography"
  ],
  Tables: [
    "table",
    "data-table",
    "table-grid",
    "table-semantic"
  ],
  Feedback: [
    "notification",
    "progress-bar",
    "progress-steps",
    "spinner",
    "toast"
  ],
  Surfaces: [
    "card",
    "drawer",
    "modal",
    "popover",
    "tooltip"
  ],
  MapMarker: [
    "fixed-marker",
    "floating-marker",
    "floating-route-marker",
    "location-puck"
  ],
  Utility: [
    "aspect-ratio-box",
    "base-provider",
    "block",
    "flex-grid",
    "layer",
    "use-styletron",
    "styled",
    "tokens",
    "unstable-a11y"
  ]
};

const allComponents = Object.values(baseuiComponentsDictionary).flat();


let componentMentionCount = {};

const targetChannels = ['C0604EZGASH'];
const keywords = ["use", "add", "implement", "instance", "component", "create", "design", "update", "paste", "frame", "Figma", "bug", "broken", "\\?"];


app.message(async ({ message, say, client }) => {
  try {
    if (targetChannels.includes(message.channel)) {
      let mentionedComponents = [];

      allComponents.forEach(component => {
        const proximity = 3;
        const keywordPattern = keywords.join("|");
        const regex = new RegExp(`\\b(${keywordPattern})\\s+(\\w+\\s+){0,${proximity}}${component}\\b`, 'gi');
        
        const matches = (message.text.match(regex) || []).length;

        if (matches > 0) {
          componentMentionCount[component] = (componentMentionCount[component] || 0) + matches;
          mentionedComponents.push(component);
        }
      });

      const mentionedComponentNames = mentionedComponents;
      const mentionedComponentCategories = mentionedComponentNames.map(name => {
        for (const [category, components] of Object.entries(baseuiComponentsDictionary)) {
          if (components.includes(name)) {
            return category;
          }
        }
        return 'Unknown';
      });

      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Date': {
            'type': 'date',
            'date': {
              'start': new Date().toISOString().split('T')[0]
            }
          },
          'Message': {
            'type': 'rich_text',
            'rich_text': [
              {
                'type': 'text',
                'text': {
                  'content': message.text
                }
              }
            ]
          },
          'ComponentMentionCount': {
            'type': 'number',
            'number': Object.values(componentMentionCount).reduce((a, b) => a + b, 0)
          },
          'ComponentNames': {
            'type': 'rich_text',
            'rich_text': [
              {
                'type': 'text',
                'text': {
                  'content': mentionedComponentNames.join(', ')
                }
              }
            ]
          },
          'ComponentCategories': {
            'type': 'multi_select',
            'multi_select': mentionedComponentCategories.map(category => {
              return { 'name': category };
            })
          }
        }
      });

      if (mentionedComponents.length > 0) {
        await say(`The following components were mentioned: ${mentionedComponents.join(', ')}`);
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running! ⚡️');
  } catch (error) {
    console.error('Unable to start App', error);
  }
})();






