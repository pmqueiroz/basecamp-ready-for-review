import * as R from 'ramda'
import camelCase from 'camelcase'

export const applyCustomTemplate = (layout: Record<string, any>, template: Record<string, any>, deep=false) => {
   let concatValues = (_: string, l: any, r: any) => deep === true ? R.concat(l, r) : r

   return R.mergeDeepWithKey(concatValues, layout, template)
}

export const customTemplateFactory = (template: string[]) => {
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
