const {
  ChoicePrompt,
  ComponentDialog,
  WaterfallDialog
} = require('botbuilder-dialogs')

const { DisclaimerCard } = require('./cards/disclaimer')
const { PaperLoadingTrayCard12 } = require('./cards/paper-loading-tray-1-2')
const { PaperLoadingTrayCard34 } = require('./cards/paper-loading-tray-3-4')
const DIALOG_ID = 'startDialogId'
const PROMPT_ID = 'startPromptId'

const { PrinterCarriageDialog, PRINTER_CARRIAGE_DIALOG_ID } = require('./printer-carriage')

class StartDialog extends ComponentDialog {
  constructor (dialogId) {
    super(dialogId)

    if (!dialogId) throw new Error('Missing parameter, dialogId is required')

    this.addDialog(
      new WaterfallDialog(DIALOG_ID, [
        this.first.bind(this),
        this.second.bind(this),
        this.third.bind(this),
        this.end.bind(this)
      ])
    )
    this.addDialog(new ChoicePrompt(PROMPT_ID))
    this.addDialog(new PrinterCarriageDialog(PRINTER_CARRIAGE_DIALOG_ID))
  }

  async first (stepContext) {
    await stepContext.context.sendActivity({ attachments: [DisclaimerCard] })
    await stepContext.context.sendActivity({ attachments: [PaperLoadingTrayCard12] })
    return stepContext.prompt(PROMPT_ID, 'Is the paper jam cleared?', ['Yes', 'No'])
  }

  async second (stepContext) {
    if (stepContext.result.value === 'Yes') {
      return stepContext.replaceDialog(PRINTER_CARRIAGE_DIALOG_ID)
    } else {
      await stepContext.context.sendActivity({ attachments: [PaperLoadingTrayCard34] })
      return stepContext.prompt(PROMPT_ID, 'Is the paper jam cleared?', ['Yes', 'No'])
    }
  }

  async third (stepContext) {
    if (stepContext.result.value === 'Yes') {
      return stepContext.replaceDialog(PRINTER_CARRIAGE_DIALOG_ID)
    }
  }

  async end (stepContext) {
    await stepContext.context.sendActivity('StartDialog end')
    return stepContext.endDialog()
  }
}

exports.StartDialog = StartDialog
exports.START_DIALOG_ID = DIALOG_ID
