'use strict'

const mongoose = require('mongoose')

const DraftModel = require('../../models/drafts')

const ObjectId = mongoose.Types.ObjectId



exports.saveDraft = body => {
  const draft = new DraftModel(body)
  return draft.save({checkKeys: false})
}

