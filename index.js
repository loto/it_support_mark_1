const path = require('path')
const restify = require('restify')
require('dotenv').config()

const { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } = require('botbuilder')
const { BotConfiguration } = require('botframework-config')
const { Bot } = require('./bot')

const DEV_ENVIRONMENT = 'development'
const BOT_FILE = path.join(__dirname, (process.env.botFilePath || ''))
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT)

let botConfig
try {
  botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret)
} catch (err) {
  console.error(`\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`)
  console.error(`\n - The botFileSecret is available under appsettings for your Azure Bot Service bot.`)
  console.error(`\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.`)
  console.error(`\n - See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.\n\n`)
  process.exit()
}

const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION)

const adapter = new BotFrameworkAdapter({
  appId: endpointConfig.appId || process.env.MicrosoftAppId,
  appPassword: endpointConfig.appPassword || process.env.MicrosoftAppPassword,
  channelService: process.env.ChannelService,
  openIdMetadata: process.env.BotOpenIdMetadata
})

adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError]: ${error}`)
  await context.sendActivity(`Oops. Something went wrong!`)
  await conversationState.clear(context)
}

let server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`\n${server.name} listening to ${server.url}.`)
})

const memoryStorage = new MemoryStorage()
const conversationState = new ConversationState(memoryStorage)
const userState = new UserState(memoryStorage)

let bot
try {
  bot = new Bot(conversationState, userState, botConfig)
} catch (err) {
  console.error(`[botInitializationError]: ${err}`)
  process.exit()
}

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await bot.onTurn(context)
  })
})
