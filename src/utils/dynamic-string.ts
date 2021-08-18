import * as R from 'ramda'
import * as Core from '@actions/core'

/**
 *  @reference this code below come from a module created to react that will not work on node
 * 
 * {@link https://github.com/rodrigo-picanco/dynamic-string}
*/
export const dynamicTemplate = R.curry((templateString: string, templateVariables: Record<string, any>) =>{
   Core.debug(JSON.stringify({templateString}))

   return templateString.replace(/\${(.*?)}/g, (_, g) => templateVariables[g])
})