<div align="center">

# Basecamp Pull Request Ready for Review Notifier

### Use basecamp chatbots to notify when a PR are ready to review

</div>

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
        uses: pmqueiroz/basecamp-ready-for-review@v1
        env:
           BASECAMP_CHATBOT_SECRET: ${{ secrets.BASECAMP_CHATBOT_KEY }}
        with:
           chatlines_url: "https://3.basecamp.com/7777777/integrations/${basecampApiKey}/buckets/88888888/chats/9999999999/lines"

```