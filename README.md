# flipper-badusb-exfil

A script for the Flipper Zero written using its JavaScript SDK that orchestrates Bad USB scripts and exfiltrates data to Flipper.

## Installation

Installing the script is easy! Follow the steps below.

1. **Obtain the compiled script:** you will need the JavaScript file that runs on Flipper, `badusb_exfil.js`, which you can get in two ways: compile the project yourself by cloning this repository (then just run `npm i` and `npm run build`), or find the latest version in our releases.

2. **Transfer the script to Flipper:** this can be done using the qFlipper desktop app, or by removing the SD card from Flipper and transferring the script to the SD card. The script should be copied to `/ext/apps/Scripts/` on Flipper.

That's if, you're ready to go!

## Usage

This script is designed to be a version of the Bad USB utility that allows for automatic exfiltration of data to Flipper. Let's get started!

1. **Run the script.** It will be shown under Apps > Scripts > `badusb_exfil.js` on your Flipper.

2. **Select a platform.** _Currently, only Windows is supported as a target platform._ However, adaptation of Mac and Linux scripts may come in the future.

3. **Select a Bad SUB script.** This script will be run on the target device, and the results will be exfiltrated to Flipper.

4. **Wait for exfiltration to complete.** Some additional time is needed to run the Bad USB script and then transfer data to Flipper. You will be notified when transfer is complete.
