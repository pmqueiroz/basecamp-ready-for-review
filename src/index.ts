import * as Core from '@actions/core'
import * as Github from '@actions/github'
import { dynamicTemplate } from './dynamic-string'

import { messageClient } from './client'
import { PullRequestPayload } from './interface'
import { version } from '../package.json'

const DEFAULT_MESSAGE = '<p>✨ ${blame} marked PR#${pr_number} for review <a href="${html_url}">↗</a></p>'

const messageFactory = (pull: PullRequestPayload) => {
   const { html_url, number } = pull

   return dynamicTemplate(DEFAULT_MESSAGE, { pr_number: number, html_url })
}

Core.debug('Running action on version ' + version)

async function run() {
   const basecamp_token = process.env.BASECAMP_CHATBOT_SECRET
   const accountId = Core.getInput('account_id')
   const bucketId = Core.getInput('bucket_id')
   const chatId = Core.getInput('chat_id')

   Core.debug(JSON.stringify({
      basecamp_token,
      accountId,
      bucketId,
      chatId
   }))

   if (Github.context.eventName !== "pull_request") {
      Core.setFailed('This workflow can only run on pull requests')
      return
   }

   if (!basecamp_token) {
      Core.setFailed('Missing BASECAMP_CHATBOT_SECRET environment variable. Eg: \nenv:\n\tBASECAMP_CHATBOT_SECRET: ${{ secrets.BASECAMP_CHATBOT_KEY }}\n ')
      return
   }

   const payload = Github.context.payload
   const pr = payload.pull_request

   if (!pr?.draft && payload.review.state === 'ready_for_review') return

   const message = messageFactory(pr as PullRequestPayload)

   const config = {
      account_id: accountId,
      bucket_id: bucketId,
      chat_id: chatId
   }

   try {
      const { chatLines } = await messageClient(message, config)
      
      Core.debug(chatLines)
   } catch (error) {
      Core.setFailed(error)
   }
   
}

run().catch(error => Core.setFailed("Workflow failed! " + error.message))