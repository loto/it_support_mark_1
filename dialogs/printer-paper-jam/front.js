const {
  ChoicePrompt,
  ComponentDialog,
  WaterfallDialog
} = require('botbuilder-dialogs')

const { FrontCard1 } = require('./cards/front-1')
const DIALOG_ID = 'frontDialogId'
const PROMPT_ID = 'frontPromptId'

class FrontDialog extends ComponentDialog {
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
    await stepContext.context.sendActivity({ attachments: [FrontCard1] })
    return stepContext.prompt(PROMPT_ID, 'Is the paper jam cleared?', ['Yes', 'No'])
  }

  async end (stepContext) {
    await stepContext.context.sendActivity('Should branch out to ???')
    return stepContext.endDialog()
  }
}

exports.FrontDialog = FrontDialog
exports.FRONT_DIALOG_ID = DIALOG_ID
