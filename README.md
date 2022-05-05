# Still Life

## Running Locally

Make sure you have `node` installed.

In `client` run `yarn` and then `yarn dev` to run the client locally

In `extension` run `yarn`, `yarn build`, and then `yarn start`. This should fire up an instance of Firefox.

Enable the extension by clicking on its icon and then the button in the popup.

When you navigate to a website, ex. https://wikipedia.com, the extension will redirect you to http://localhost:3000/room/?url=https://wikipedia.com
