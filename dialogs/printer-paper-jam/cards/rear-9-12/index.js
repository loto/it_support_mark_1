const { CardFactory } = require('botbuilder')
const json = require('./card.json')
const card = CardFactory.adaptiveCard(json)

exports.RearCard912 = card
