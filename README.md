# Streamlabs Donation Printer

This is an electron app that you can connect to your Streamlabs account to print out donations from your real, physical printer. It will parse the donation message for a JPEG or PNG image link and include it in the print. It has options for setting donation threshholds and black and white prints. Warning: there is no filter for image or message content, so whatever your donators send will just print.

## Installation and Usage

* Download the latest version from the [Releases Page](https://github.com/StewM/streamlabs-donations-printer/releases)
  * The installer will overwrite itself when you install a new version
* Run the app and click Config at the top right to open the configuration page
* Add your Streamlabs Socket API Token which you can get from the API Tokens tab in your [Streamlabs API Settings](https://streamlabs.com/dashboard#/settings/api-settings)
* Choose the printer you wish to print to from the dropdown
* Choose the minimum donation value you wish to print, and if you wish to print in color check the box and set the minimum for that as well
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
