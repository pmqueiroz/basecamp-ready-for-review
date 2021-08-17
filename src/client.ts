import https from 'https'
import Core from '@actions/core'

export const messageClient = (message: string, chatLines: string) => {
   const options = {
      hostname: 'https://3.basecamp.com',
      path: chatLines,
      method: 'POST',
      headers: {
         'content': message
      }
   }

   const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`)

      if (res.statusCode !== 200) {
         Core.setFailed(`Request failed with ${res.statusCode} status code`)
      }
   })
    
    req.on('error', error => {
      Core.setFailed(error.message)
    })
    
    req.end()
}