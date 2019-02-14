const {
  ChoicePrompt,
  ComponentDialog,
  WaterfallDialog
} = require('botbuilder-dialogs')

const { ReloadingTestingCard12 } = require('./cards/reloading-testing-1-2')
const DIALOG_ID = 'reloadingTestingDialogId'
const PROMPT_ID = 'reloadingTestingPromptId'

class ReloadingTestingDialog extends ComponentDialog {
  constructor (dialogId) {
    super(dialogId)

    if (!dialogId) throw new Error('Missing parameter, dialogId is required')

    this.addDialog(
      new WaterfallDialog(DIALOG_ID, [
        this.end.bind(this)
      ])
    )
    this.addDialog(new ChoicePrompt(PROMPT_ID))
  }

  async end (stepContext) {
    await stepContext.context.sendActivity({ attachments: [ReloadingTestingCard12] })
    return stepContext.endDialog()
  }
}

exports.ReloadingTestingDialog = ReloadingTestingDialog
exports.RELOADING_TESTING_DIALOG_ID = DIALOG_ID
