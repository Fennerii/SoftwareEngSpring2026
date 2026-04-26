const cron = require('node-cron');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

//connect database
const db = mysql.createPool({
    host: 'localhost',
    user: 'appuser',
    password: 'pass123',
    database: 'proto_pd'
});

async function sync() {
    try {
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

        for (const p of allPrinters) {

            p.black = p.black != null ? parseInt(p.black) : null;
            p.cyan = p.cyan != null ? parseInt(p.cyan) : null;
            p.magenta = p.magenta != null ? parseInt(p.magenta) : null;
            p.yellow = p.yellow != null ? parseInt(p.yellow) : null;
            
            console.log(p);
            await db.execute(`
                INSERT INTO printers 
                (serial_number, name, ip, location, status, uptime, hardware, page_count, color, is_error, black, cyan, magenta, yellow)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    ip = VALUES(ip),
                    location = VALUES(location),
                    status = VALUES(status),
                    uptime = VALUES(uptime),
                    hardware = VALUES(hardware),
                    page_count = VALUES(page_count),
                    color = VALUES(color),
                    is_error = VALUES(is_error),
                    black = VALUES(black),
                    cyan = VALUES(cyan),
                    magenta = VALUES(magenta),
                    yellow = VALUES(yellow)
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
                p.is_error,
                p.black,
                p.cyan,
                p.magenta,
                p.yellow
            ]);
        }

        console.log("SYNC COMPLETE:", allPrinters.length);

    } catch (err) {
        console.error("SYNC ERROR:", err.message);
    }
}

//run on start
console.log("!Starting initial sync!");
sync();

//syncs every 2 mins
cron.schedule('*/2 * * * *', () => {
    console.log("Running scheduled sync...");
    sync();
});


//get all printers
app.get('/printers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM printers');
        res.json(rows);
    } catch (err) {
        res.status(500).send("Error");
    }
});

//get history for a printer (with username)
app.get('/history/:serial', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                wh.work_id,
                wh.notes,
                wh.created_at,
                u.username
            FROM work_history wh
            JOIN users u ON wh.user_id = u.user_id
            WHERE wh.printer_serial = ?
            ORDER BY wh.created_at DESC
        `, [req.params.serial]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching history");
    }
});


//post new history entry
app.post('/history', async (req, res) => {
    try {
        const { printer_serial, user_id, notes } = req.body;

        //basic validation
        if (!printer_serial || !user_id || !notes) {
            return res.status(400).send("Missing fields");
        }

        await db.execute(`
            INSERT INTO work_history (printer_serial, user_id, notes)
            VALUES (?, ?, ?)
        `, [printer_serial, user_id, notes]);

        res.send("History added");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding history");
    }
});


//start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});