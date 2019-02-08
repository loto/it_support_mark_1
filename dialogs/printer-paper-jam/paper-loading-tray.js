const {
  ChoicePrompt,
  ComponentDialog,
  WaterfallDialog
} = require('botbuilder-dialogs')

const { PaperLoadingTrayCard } = require('./cards/paper-loading-tray')

const DIALOG_ID = 'paperLoadingTrayDialogId'
const PROMPT_ID = 'paperLoadingTrayJammedClearedPromptId'

class PaperLoadingTrayDialog extends ComponentDialog {
  constructor (dialogId) {
    super(dialogId)

    if (!dialogId) throw new Error('Missing parameter, dialogId is required')

    this.addDialog(
      new WaterfallDialog(DIALOG_ID, [
        this.instructions.bind(this),
        this.prompt.bind(this)
      ])
    )
    this.addDialog(new ChoicePrompt(PROMPT_ID))
  }

  async instructions (step) {
    step.context.sendActivity({ attachments: [PaperLoadingTrayCard] })
    return step.prompt(PROMPT_ID, 'Is the paper jam cleared?', ['Yes', 'No'])
  }

  async prompt (step) {
    return step.endDialog()
  }
}

exports.PaperLoadingTrayDialog = PaperLoadingTrayDialog
exports.PAPER_LOADING_TRAY_DIALOG_ID = DIALOG_ID
