# Streamlabs Donation Printer

This is an electron app that you can connect to your Streamlabs account to print out donations from your real, physical printer. It will parse the donation message for a JPEG or PNG image link and include it in the print. The code I am using to do this is fairly strict. The link must begin with `http://` or `https://` and end with `.jpg` or `.png`. It has options for setting donation threshholds and black and white prints. I have added beta support for Youtube Super Chats via Streamlabs as well, but I currently do not have a way to test them, so attempt to use this with super chats at your own risk. Warning: there is no filter for image or message content, so whatever your donators send will just print.

## Installation and Usage

* Download the latest version from the [Releases Page](https://github.com/StewM/streamlabs-donations-printer/releases)
  * The installer will overwrite itself when you install a new version
* Run the app and click Config at the top right to open the configuration page
* Add your Streamlabs Socket API Token which you can get from the API Tokens tab in your [Streamlabs API Settings](https://streamlabs.com/dashboard#/settings/api-settings)
* Choose the printer you wish to print to from the dropdown
* Choose the currency for the minimum donation from the dropdown, this should be the same currency you choose for your donation settings in Streamlabs
  * The checkbox below this will only print donations in the same currency. This is to prevent comparing USD to JPY for example since I currently do not have a way to automatically convert for comparison in the app. If you're fine with this sort of comparison possibly happening, uncheck this box. Streamlabs seems to automatically convert donation amounts to your selected currency, but I am unsure if they do the same for Super Chats.
* Choose the minimum donation value you wish to print, and if you wish to print in color check the box and set the minimum for that as well
* If you want to use Super Chats, check the "Enable Super Chats" box
* Click Save and then click the title at the top left to return to the main page
* The Start Printer button should now be enabled, simply click the button to start listening for and printing donations

## Contribution

If you find a bug or want to contribute, please open an issue or a pull request with your fix. The project is built in electron with Vue for the frontend. If you have any questions feel free to reach out to me.

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production, webpack build and electron build are separated for CI/CD
npm run build
npm run builder
```
