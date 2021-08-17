<div align="center">

# Basecamp Pull Request Ready for Review Notifier

### Use basecamp chatbots to notify when a PR are ready to review

</div>

## Setup

* Create a chatbot on your basecamp follows this [article](https://3.basecamp-help.com/article/160-chatbots-and-webhooks)

* Add your chatbot key to github secret. Click on <kbd>Settings</kbd> > <kbd>Secrets</kbd>

* Create `.github/workflows/main.yml` file and follows the usage below

## Usage

```yaml
on:
   pull_request:
      types: [ready_for_review]
name: Basecamp RfR Notify
jobs:
   notifyBasecamp:
      name: Notify Basecamp
      runs-on: ubuntu-latest
      steps:
      - uses: actions/checkout@v2
      - name: Notify Basecamp
        uses: pmqueiroz/basecamp-ready-for-review@v0.1
        env:
           BASECAMP_CHATBOT_SECRET: ${{ secrets.BASECAMP_CHATBOT_KEY }}
        with:
           # https://3.basecampapi.com/ACCOUNT_ID/integrations/BASECAMP_CHATBOT_SECRET/buckets/BUCKET_ID/chats/CHAT_ID/lines.json
           account_id: "7777777"
           bucket_id: "7777777"
           chat_id: "7777777"
```
