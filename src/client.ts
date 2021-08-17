import https from 'https'

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
         console.error(`Request failed with ${res.statusCode} status code`)
      }
   })
    
    req.on('error', error => {
      console.error(error.message)
    })
    
    req.end()
}