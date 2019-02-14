const {
  ChoicePrompt,
  ComponentDialog,
  WaterfallDialog
} = require('botbuilder-dialogs')

const { RearCard18 } = require('./cards/rear-1-8')

const DIALOG_ID = 'rearDialogId'
const PROMPT_ID = 'rearPromptId'

class RearDialog extends ComponentDialog {
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
    await stepContext.context.sendActivity({ attachments: [RearCard18] })
    return stepContext.prompt(PROMPT_ID, 'Is the paper jam cleared?', ['Yes', 'No'])
  }

  async end (stepContext) {
    await stepContext.context.sendActivity('Should branch out to ???')
    return stepContext.endDialog()
  }
}

exports.RearDialog = RearDialog
exports.REAR_DIALOG_ID = DIALOG_ID
