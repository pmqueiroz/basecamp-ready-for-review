import * as Core from '@actions/core'
import * as Github from '@actions/github'
import { dynamicTemplate } from './dynamic-string'

import { messageClient } from './client'
import { PullRequestPayload } from './interface'
import { version } from '../package.json'

const DEFAULT_MESSAGE_READY_TO_REVIEW = '<p>✨ pull request <b>${pr_title}#${pr_number}</b> is ready for review <a href="${html_url}">↗</a></p>'
const DEFAULT_MESSAGE_PR_OPEN = '<p>🚀${pr_author} opened pull request <b>${pr_title}#${pr_number}</b> <a href="${html_url}">↗</a></p>'

const messageFactory = (pull: PullRequestPayload, defaultMessage: string) => {
   const { html_url, number: pr_number, title: pr_title, user: { login: pr_author } } = pull

   return dynamicTemplate(defaultMessage, { pr_title, pr_number, html_url, pr_author })
}

Core.debug('Running action on version ' + version)

async function run() {
   const basecamp_token = process.env.BASECAMP_CHATBOT_SECRET
   const accountId = Core.getInput('account_id')
   const bucketId = Core.getInput('bucket_id')
   const chatId = Core.getInput('chat_id')
   const notifyOpen = Core.getBooleanInput('notify_open')
   const notifyOpenWhenDraft = Core.getBooleanInput('notify_open_when_draft')

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

   let message = undefined

   if (payload.action === 'opened' && pr?.draft === notifyOpenWhenDraft) {
      message = messageFactory(pr as PullRequestPayload, DEFAULT_MESSAGE_PR_OPEN)
   } else if (payload.action === 'ready_for_review') {
      message = messageFactory(pr as PullRequestPayload, DEFAULT_MESSAGE_READY_TO_REVIEW)
   } else {
      Core.setFailed('Payload type must be opened | ready_for_review')
      return
   }

   const config = {
      account_id: accountId,
      bucket_id: bucketId,
      chat_id: chatId,
      chatbot_key: basecamp_token
   }

   try {
      const response = await messageClient(message, config)
      
      Core.debug(response?.data)
   } catch (error) {
      Core.setFailed(error)
   }
   
}

run().catch(error => Core.setFailed("Workflow failed! " + error.message))