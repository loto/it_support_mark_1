const {
  ChoicePrompt,
  ComponentDialog,
  WaterfallDialog
} = require('botbuilder-dialogs')

const { DisclaimerCard } = require('./cards/disclaimer')

const DIALOG_ID = 'startDialogId'
const PROMPT_ID = 'paperLoadingTrayAccessPromptId'

const { PaperLoadingTrayDialog, PAPER_LOADING_TRAY_DIALOG_ID } = require('./paper-loading-tray')

class StartDialog extends ComponentDialog {
  constructor (dialogId) {
    super(dialogId)

    if (!dialogId) throw new Error('Missing parameter, dialogId is required')

    this.addDialog(
      new WaterfallDialog(DIALOG_ID, [
        this.disclaimer.bind(this),
        this.prompt.bind(this),
        this.end.bind(this)
      ])
    )
    this.addDialog(new ChoicePrompt(PROMPT_ID))
    this.addDialog(new PaperLoadingTrayDialog(PAPER_LOADING_TRAY_DIALOG_ID))
  }

  async disclaimer (step) {
    step.context.sendActivity({ attachments: [DisclaimerCard] })
    return step.prompt(PROMPT_ID, 'Can you access the paper loading tray?', ['Yes', 'No'])
  }

  async prompt (step) {
    if (step.result.value === 'Yes') {
      return step.beginDialog(PAPER_LOADING_TRAY_DIALOG_ID)
    }
    return step.endDialog()
  }

  async end (step) {
    return step.endDialog()
  }
}

exports.StartDialog = StartDialog
exports.START_DIALOG_ID = DIALOG_ID
