const {
  ChoicePrompt,
  ComponentDialog,
  WaterfallDialog
} = require('botbuilder-dialogs')

const { RearCard18 } = require('./cards/rear-1-8')
const { RearCard912 } = require('./cards/rear-9-12')
const DIALOG_ID = 'rearDialogId'
const PROMPT_ID = 'rearPromptId'

const { PrinterCarriageDialog, PRINTER_CARRIAGE_DIALOG_ID } = require('./printer-carriage')

class RearDialog extends ComponentDialog {
  constructor (dialogId) {
    super(dialogId)

    if (!dialogId) throw new Error('Missing parameter, dialogId is required')

    this.addDialog(
      new WaterfallDialog(DIALOG_ID, [
        this.first.bind(this),
        this.second.bind(this),
        this.end.bind(this)
      ])
    )
    this.addDialog(new ChoicePrompt(PROMPT_ID))
    this.addDialog(new PrinterCarriageDialog(PRINTER_CARRIAGE_DIALOG_ID))
  }

  async first (stepContext) {
    await stepContext.context.sendActivity({ attachments: [RearCard18] })
    return stepContext.prompt(PROMPT_ID, 'Is the paper jam cleared?', ['Yes', 'No'])
  }

  async second (stepContext) {
    if (stepContext.result.value === 'Yes') {
      return stepContext.replaceDialog(PRINTER_CARRIAGE_DIALOG_ID)
    } else {
      await stepContext.context.sendActivity({ attachments: [RearCard912] })
      return stepContext.prompt(PROMPT_ID, 'Is the paper jam cleared?', ['Yes', 'No'])
    }
  }

  async end (stepContext) {
    if (stepContext.result.value === 'Yes') {
      return stepContext.replaceDialog(PRINTER_CARRIAGE_DIALOG_ID)
    } else {
      await stepContext.context.sendActivity('Should branch out to Pulling paper out from under the front cover')
      return stepContext.endDialog()
    }
  }
}

exports.RearDialog = RearDialog
exports.REAR_DIALOG_ID = DIALOG_ID
