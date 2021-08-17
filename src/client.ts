import axios from 'axios'
import { dynamicTemplate } from './dynamic-string'
import * as Core from '@actions/core'

const CHAT_LINES_URL = '/${account_id}/integrations/${chatbot_key}/buckets/${bucket_id}/chats/${chat_id}/lines.json'

interface messageClientConfig {
   account_id: string
   bucket_id: string
   chat_id: string
}

export const messageClient = async (message: string, config: messageClientConfig) => {
   Core.debug('Client called')
   const chatLines = dynamicTemplate(CHAT_LINES_URL, config)

   const instance = axios.create({
      baseURL: 'https://3.basecamp.com',
      timeout: 1000,
      headers: {
         'Content-Type': 'application/json'
      }
   })

   return await instance.post(chatLines, { content: message })
}
