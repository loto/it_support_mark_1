const { CardFactory } = require('botbuilder')
const json = require('./card.json')
const card = CardFactory.adaptiveCard(json)

exports.FrontCard1 = card
