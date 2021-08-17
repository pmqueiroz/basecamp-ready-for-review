import Core from '@actions/core'
import Github from '@actions/github'
import { dynamicTemplate } from './dynamic-string'

import { messageClient } from './client'
import { PullRequestPayload } from './interface'

const CHAT_LINES_URL = 'https://3.basecampapi.com/${account_id}/integrations/${chatbot_key}/buckets/${bucket_id}/chats/${chat_id}/lines.json'
const DEFAULT_MESSAGE = '<p>✨ ${blame} marked PR#${pr_number} for review <a href="${html_url}">↗</a></p>'

const messageFactory = (pull: PullRequestPayload) => {
   const { html_url, number } = pull

   return dynamicTemplate(DEFAULT_MESSAGE, { pr_number: number, html_url })
}

try {
   const basecamp_token = process.env.BASECAMP_CHATBOT_SECRET

   if (!basecamp_token) {
      Core.setFailed('Missing BASECAMP_CHATBOT_SECRET environment variable. Eg: \nenv:\n\tBASECAMP_CHATBOT_SECRET: ${{ secrets.BASECAMP_CHATBOT_KEY }}\n ')
   }

   const payload = Github.context.payload
   const pr = payload.pull_request

   if (!pr?.draft && payload.review.state === 'ready_for_review') {
      const message = messageFactory(pr as PullRequestPayload)

      const accountId = Core.getInput('account_id')
      const bucketId = Core.getInput('bucket_id')
      const chatId = Core.getInput('chat_id')

      const config = {
         account_id: accountId,
         bucket_id: bucketId,
         chat_id: chatId
      }

      const chatLines = dynamicTemplate(CHAT_LINES_URL, config)
      
      messageClient(message, chatLines)
   }

} catch (error) {
   console.error(error.message)
   Core?.setFailed(error.message)
}