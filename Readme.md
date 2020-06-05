# Telegram-text-analyser


This repo is a command line node script that reads telegram's exported data and outputs interesting aggregate data as json and a more simplified text chat. It _only analyses the metadata_ and not the text within and generates aggregate data on:

* Message count by 
    * **Members**
    * Year
    * **Months**   
    * **Hour of day**
    * **Day of the week**
    * Day of year
* First and last text times of each member
    * Mean time
    * **Median time**
* **Active days** (days that chat was active since creation)
    * Year
* **Voice messages**
    * Members
    * Year
* **Reply graph** (who replied to who how many times)

Bolded entries are also present on the simplified txt output.

## Requirements

1. [node](https://nodejs.org/en/download/)

# Setup

1. Install node
2. Clone this repostiory
3. [Export](https://telegram.org/blog/export-and-more) your chat data from telegram
4. Create a folder called data in the repo and copy the file downloaded (namely result.json) to the /data folder
5. Open the config.json file in the repo root directory and specify the folder name where you would like to see the output files
    * Make sure the folders exist (to be fixed)
6. Open command line (terminal) at the root directory and type:
    1. `npm i` - to install the dependencies
    2. `node index.js` - to start the application

Andddd that's it.

# Future Developments

* More metrics for better insights (obviously)
* Telegram bot for group chats (thanks Nahom)

_thanks for reading_