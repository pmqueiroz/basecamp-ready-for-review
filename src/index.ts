import * as Core from '@actions/core'
import * as Github from '@actions/github'
import { dynamicTemplate } from './utils/dynamic-string'

import { messageClient } from './utils/client'
import { customTemplateFactory, applyCustomTemplate } from './utils/custom-template'
import { PullRequestPayload } from './types/interface'
import { version } from '../package.json'

const DEFAULT_READY_TO_REVIEW_PREFIX = '✨'
const DEFAULT_PR_OPEN_PREFIX = '🚀'
const DEFAULT_PR_CLOSED_PREFIX = '❌'
const DEFAULT_PR_MERGED_PREFIX = '🎈'

const DEFAULT_MESSAGE_READY_TO_REVIEW = '<p>${prefix} pull request <b>${pr_title}#${pr_number}</b> is ${action} <a href="${html_url}">↗</a></p>'
const DEFAULT_PR_ACTIONS = '<p>${prefix} ${pr_author} ${action} pull request <b>${pr_title}#${pr_number}</b> <a href="${html_url}">↗</a></p>'

const PR_ACTIONS = {
   READY_FOR_REVIEW: {
      action: 'ready for review',
      prefix: DEFAULT_READY_TO_REVIEW_PREFIX,
      defaultMessage: DEFAULT_MESSAGE_READY_TO_REVIEW
   },
   OPENED: {
      action: 'opened',
      prefix: DEFAULT_PR_OPEN_PREFIX,
      defaultMessage: DEFAULT_PR_ACTIONS
   },
   MERGED: {
      action: 'merged',
      prefix: DEFAULT_PR_MERGED_PREFIX,
      defaultMessage: DEFAULT_PR_ACTIONS
   },
   CLOSED: {
      action: 'closed',
      prefix: DEFAULT_PR_CLOSED_PREFIX,
      defaultMessage: DEFAULT_PR_ACTIONS
   },
}

const messageFactory = (pull: PullRequestPayload, prAction: keyof typeof PR_ACTIONS, customTemplate: Record<string, any>) => {
   const { html_url, number: pr_number, title: pr_title, user: { login: pr_author } } = pull

   const mergedTemplate = applyCustomTemplate(PR_ACTIONS, customTemplate)

   Core.debug(JSON.stringify(mergedTemplate))
   Core.debug(JSON.stringify(mergedTemplate[prAction]))

   const { action, defaultMessage, prefix } = mergedTemplate[prAction]

   return dynamicTemplate(defaultMessage, { pr_title, pr_number, html_url, pr_author, action, prefix })
}

Core.debug('Running action on version ' + version)

async function run() {
   const basecamp_token = process.env.BASECAMP_CHATBOT_SECRET
   const accountId = Core.getInput('account_id', { required: true })
   const bucketId = Core.getInput('bucket_id', { required: true })
   const chatId = Core.getInput('chat_id', { required: true })
   const notifyOpen = Core.getBooleanInput('notify_open')
   const notifyOpenWhenDraft = Core.getBooleanInput('notify_open_when_draft')
   const customTemplateInput = Core.getMultilineInput('custom_template')

   Core.debug(JSON.stringify({
      basecamp_token,
      accountId,
      bucketId,
      chatId,
      customTemplateInput
   }))

   if (Github.context.eventName !== "pull_request") {
      Core.setFailed('This workflow can only run on pull requests')
      return
   }

   if (!basecamp_token) {
      Core.setFailed('Missing BASECAMP_CHATBOT_SECRET environment variable. Eg: \nenv:\n\tBASECAMP_CHATBOT_SECRET: ${{ secrets.BASECAMP_CHATBOT_KEY }}\n ')
      return
   }

   const parsedTemplate = customTemplateFactory(customTemplateInput)
   
   const payload = Github.context.payload
   const pr = payload.pull_request

   let message = undefined

   if (payload.action === 'opened' && notifyOpen && pr?.draft === notifyOpenWhenDraft) {
      message = messageFactory(pr as PullRequestPayload, "OPENED", parsedTemplate)
   } else if (payload.action === 'ready_for_review') {
      message = messageFactory(pr as PullRequestPayload, "READY_FOR_REVIEW", parsedTemplate)
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