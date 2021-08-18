const R = require('ramda')
const camelCase = require('camelcase')

const PR_ACTIONS = {
   READY_FOR_REVIEW: {
      action: 'ready for review',
      prefix: 'DEFAULT_READY_TO_REVIEW_PREFIX',
      defaultMessage: 'DEFAULT_MESSAGE_READY_TO_REVIEW'
   },
   OPENED: {
      action: 'opened',
      prefix: 'DEFAULT_PR_OPEN_PREFIX',
      defaultMessage: 'DEFAULT_PR_ACTIONS'
   },
   MERGED: {
      action: 'merged',
      prefix: 'DEFAULT_PR_MERGED_PREFIX',
      defaultMessage: 'DEFAULT_PR_ACTIONS'
   },
   CLOSED: {
      action: 'closed',
      prefix: 'DEFAULT_PR_CLOSED_PREFIX',
      defaultMessage: 'DEFAULT_PR_ACTIONS'
   },
}

const template = undefined

const applyCustomTemplate = (layout, template, deep=false) => {
   let concatValues = (_, l, r) => deep === true ? R.concat(l, r) : r

   return R.mergeDeepWithKey(concatValues, layout, template)
}

const customTemplateFactory = (template) => {
   return template.reduce((acc, curr) => {
      const config = curr.split('=')

      const [fieldName, fieldValue] = config

      let [action, scope] = fieldName.split(':')

      if (scope !== 'PREFIX' && scope !== 'MESSAGE') return acc

      if (scope === 'MESSAGE') {
         scope = 'defaultMessage'
      }

      return applyCustomTemplate(acc, {[action.toUpperCase()]: { [camelCase(scope)]: fieldValue } }, true)
   }, {})
}

console.log(customTemplateFactory(template))

console.log(applyCustomTemplate(PR_ACTIONS, customTemplateFactory(template)))
