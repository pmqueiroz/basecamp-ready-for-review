import Core from '@actions/core'
import Github from '@actions/github'
import { dynamicTemplate } from './dynamic-string'

import { messageClient } from './client'
import { PullRequestPayload } from './interface'

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

      const chatLinesInput = Core.getInput('chatlines_url')
      const chatLines = dynamicTemplate(chatLinesInput, { basecamp_api_key: basecamp_token })
      
      messageClient(message, chatLines)
   }

} catch (error) {
   Core.setFailed(error.message)
}