const {
  ChoicePrompt,
  ComponentDialog,
  WaterfallDialog
} = require('botbuilder-dialogs')

const { PrinterCarriageCard12 } = require('./cards/printer-carriage-1-2')

const DIALOG_ID = 'paperCarriageDialogId'
const PROMPT_ID = 'paperCarriagePromptId'

class PrinterCarriageDialog extends ComponentDialog {
  constructor (dialogId) {
    super(dialogId)

    if (!dialogId) throw new Error('Missing parameter, dialogId is required')

    this.addDialog(
      new WaterfallDialog(DIALOG_ID, [
        this.first.bind(this),
        this.end.bind(this)
      ])
    )
    this.addDialog(new ChoicePrompt(PROMPT_ID))
  }

  async first (stepContext) {
    await stepContext.context.sendActivity({ attachments: [PrinterCarriageCard12] })
    return stepContext.prompt(PROMPT_ID, 'Is the paper jam cleared?', ['Yes', 'No'])
  }

  async end (step) {
    await step.context.sendActivity('PrinterCarriageDialog end')
    return step.endDialog({})
  }
}

exports.PrinterCarriageDialog = PrinterCarriageDialog
exports.PRINTER_CARRIAGE_DIALOG_ID = DIALOG_ID
