require('dotenv').config()
const { ActivityTypes } = require('botbuilder')
const { LuisRecognizer } = require('botbuilder-ai')
const { DialogSet } = require('botbuilder-dialogs')

const { WelcomeCard } = require('./cards/welcome')
const { HelpCard } = require('./cards/help')
const { ErrorCard } = require('./cards/error')
const LUIS_CONFIGURATION = 'BasicBotLuisApplication'
const INTENT = {
  HELP: 'Help',
  PRINTER_PAPER_JAM: 'PrinterPaperJam'
}

const { PrinterPaperJamStartDialog, PRINTER_PAPER_JAM_START_DIALOG_ID } = require('./dialogs/printer-paper-jam')

class Bot {
  constructor (conversationState, userState, botConfig) {
    if (!conversationState) throw new Error('Missing parameter.  conversationState is required')
    if (!userState) throw new Error('Missing parameter.  userState is required')
    if (!botConfig) throw new Error('Missing parameter.  botConfig is required')

    const luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION)
    if (!luisConfig || !luisConfig.appId) throw new Error('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n')
    const luisEndpoint = luisConfig.region && luisConfig.region.indexOf('https://') === 0 ? luisConfig.region : luisConfig.getEndpoint()
    this.luisRecognizer = new LuisRecognizer({
      applicationId: luisConfig.appId,
      endpoint: luisEndpoint,
      endpointKey: luisConfig.authoringKey
    })

    this.userSessionAccessor = userState.createProperty('userSessionAccessor')
    this.dialogState = conversationState.createProperty('dialogState')

    this.dialogs = new DialogSet(this.dialogState)
    this.dialogs.add(new PrinterPaperJamStartDialog(PRINTER_PAPER_JAM_START_DIALOG_ID))

    this.conversationState = conversationState
    this.userState = userState
  }

  async onTurn (turnContext) {
    switch (turnContext.activity.type) {
      case ActivityTypes.Message:
        await this.onActivityMessage(turnContext)
        break

      case ActivityTypes.Invoke:
      case ActivityTypes.Event:
        await this.onActivityEvent(turnContext)
        break

      case ActivityTypes.ConversationUpdate:
        await this.onActivityConversationUpdate(turnContext)
        break

      default:
        await turnContext.sendActivity(`[${turnContext.activity.type} event detected.]`)
        break
    }

    await this.conversationState.saveChanges(turnContext)
    await this.userState.saveChanges(turnContext)
  }

  async onActivityMessage (turnContext) {
    const dialogContext = await this.dialogs.createContext(turnContext)
    const results = await this.luisRecognizer.recognize(turnContext)
    const topIntent = LuisRecognizer.topIntent(results)
    const interrupted = await this.isTurnInterrupted(dialogContext, topIntent)

    if (interrupted) {
      if (dialogContext.activeDialog !== undefined) {
        await dialogContext.repromptDialog()
      }
    } else {
      if (dialogContext.activeDialog) {
        await dialogContext.continueDialog()
        if (!turnContext.responded && dialogContext.activeDialog) {
          await dialogContext.endDialog()
          await turnContext.sendActivity({ attachments: [ErrorCard, HelpCard] })
        }
      } else {
        if (topIntent === INTENT.PRINTER_PAPER_JAM) {
          await dialogContext.beginDialog(PRINTER_PAPER_JAM_START_DIALOG_ID)
        }
      }
    }
  }

  async onActivityEvent (turnContext) {
    const dialogContext = await this.dialogs.createContext(turnContext)
    await dialogContext.continueDialog()
  }

  async onActivityConversationUpdate (turnContext) {
    const members = turnContext.activity.membersAdded

    for (let index = 0; index < members.length; index++) {
      const member = members[index]
      if (member.id !== turnContext.activity.recipient.id) {
        await turnContext.sendActivity({ attachments: [WelcomeCard, HelpCard] })
      }
    }
  }

  async isTurnInterrupted (dialogContext, topIntent) {
    if (topIntent === INTENT.HELP) {
      await dialogContext.context.sendActivity({ attachments: [HelpCard] })
      return true
    }

    return false
  }
}

module.exports.Bot = Bot
