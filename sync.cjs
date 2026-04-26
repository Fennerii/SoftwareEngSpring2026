const cron = require('node-cron');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

//Connection to the proto_pd DB
const db = mysql.createPool({
    host: 'localhost',
    user: 'appuser',
    password: 'pass123',
    database: 'proto_pd'
});

//Data sync
async function sync() {
    try {
        //gets data from school printer API's json file
        //kinda messy but works lol
        const res = await axios.get('https://print.newpaltz.edu/api/data/acs_printer_data.json');
        const data = res.data;

        let allPrinters = [];

        for (let p of data.devices) {
            p.is_error = false;
            allPrinters.push(p);
        }

        for (let p of data.devices_error) {
            p.is_error = true;
            allPrinters.push(p);
        }
        

        //for below using ON DUPLICATE KEY so if serial_number already exists, it just updates the row ;)
        //instead of inserting the same printer again
        for (const p of allPrinters) { 
            await db.execute(`
                INSERT INTO printers 
                (serial_number, name, ip, location, status, uptime, hardware, page_count, color, is_error)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    ip = VALUES(ip),
                    location = VALUES(location),
                    status = VALUES(status),
                    uptime = VALUES(uptime),
                    hardware = VALUES(hardware),
                    page_count = VALUES(page_count),
                    color = VALUES(color),
                    is_error = VALUES(is_error)
            `, [
                p.serial_number || p.name,
                p.name,
                p.ip,
                p.location,
                p.status || "OK",
                p.uptime,
                p.hardware || null,
                parseInt(p.page_count) || 0,
                p.color || false,
                p.is_error
            ]);
        }
        console.log("SYNC COMPLETE:", allPrinters.length);
    } catch (err) {
        console.error("SYNC ERROR:", err.message);
    }
}

//run on start-up
console.log("!Starting initial sync!");
sync();

//refresh every 2 mins (original site updates every 5 btw)
cron.schedule('*/2 * * * *', () => {
    console.log("Running scheduled sync...");
    sync();
});

//API route
app.get('/printers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM printers');
        res.json(rows);
    } catch (err) {
        res.status(500).send("Error");
    }
});

//start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});