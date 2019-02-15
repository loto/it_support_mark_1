const {
  ChoicePrompt,
  ComponentDialog,
  WaterfallDialog
} = require('botbuilder-dialogs')

const { PrinterCarriageCard12 } = require('./cards/printer-carriage-1-2')
const { PrinterCarriageCard39 } = require('./cards/printer-carriage-3-9')
const DIALOG_ID = 'paperCarriageDialogId'
const PROMPT_ID = 'paperCarriagePromptId'

const { ReloadingTestingDialog, RELOADING_TESTING_DIALOG_ID } = require('./reloading-testing')

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
    this.addDialog(new ReloadingTestingDialog(RELOADING_TESTING_DIALOG_ID))
  }

  async first (stepContext) {
    await stepContext.context.sendActivity({ attachments: [PrinterCarriageCard12] })
    return stepContext.prompt(PROMPT_ID, 'Does the printer carriage move?', ['Yes', 'No'])
  }

  async end (stepContext) {
    if (stepContext.result.value === 'Yes') {
      return stepContext.replaceDialog(RELOADING_TESTING_DIALOG_ID)
    } else {
      await stepContext.context.sendActivity({ attachments: [PrinterCarriageCard39] })
      return stepContext.replaceDialog(RELOADING_TESTING_DIALOG_ID)
    }
  }
}

exports.PrinterCarriageDialog = PrinterCarriageDialog
exports.PRINTER_CARRIAGE_DIALOG_ID = DIALOG_ID
