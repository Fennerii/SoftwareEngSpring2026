## Prototype version of SE Project - by Joshua Alfarano


This is a prototype version that I worked on before my team and I began brainstorming how the final version of the project will function and be implemented.  

This prototype builds off an existing system used for printer status tracking and was created to explore improvements and different approaches for handling the data.  

Special thanks to ResNet Manager Brendan Lowe for allowing our team to use his pre-existing site for printer information.

### How Brendan's site works

url to his site : https://print.newpaltz.edu/status/ 

url for the JSON file : https://print.newpaltz.edu/api/data/acs_printer_data.json

(!IMPORTANT NOTE! You must be connected to SUNY New Paltz’s network to access the JSON data, it is restricted and will block requests from off-campus users, so the data will not load unless you are on campus (or using a campus network/VPN))

The existing system runs a PHP script on a cron job. That script pulls device data from a TeamDynamix asset report (IP addresses, device names, etc.). It then uses SNMP walk on each device to get status/info from the chassis.

After that, everything gets converted into a JSON file, which the current status page reads from to display device info.

### How the Prototype works

For the prototype, it takes that JSON file and pumps it into a MySQL database using a Node.js script. The script reads/parses the JSON and inserts or updates the data in the database.

From there, I have a simple API (/printers) that pulls the data from MySQL, and the frontend uses fetch() to display it on the page (cards with name, IP, status, etc.).

Brendan’s site updates the printer chassis information every 5 minutes through its cron job. For my prototype, I set up my sync script to run every 2 minutes, so the database stays more frequently updated with the latest data.

This way, instead of relying directly on a static JSON file, the data is stored in a database and can be queried/updated more easily while still staying in sync with the cron job.

## Setup / Installation and Running the Prototype

To run this prototype, you will need Node.js and MySQL installed.

### Setup

Initialize the project:
npm init -y

Install required dependencies:
npm install express axios mysql2 node-cron cors http-proxy-middleware

If needed (Windows PowerShell only):
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned (self note no idea why i did this lol)

### Running the Prototype

Once everything is set up, you can run the project:

1. Start the sync script (this loads the JSON data into MySQL):
   node sync.js

2. Start the server:
   node server.js

3. Open the frontend in your browser, use VScode live server extension
