async function loadPrinters() {
    const res = await fetch('http://localhost:3000/printers');
    const data = await res.json();

    //get container from HTML
    const container = document.getElementById('container');
    container.innerHTML = '';

    data.forEach(p => {
        const div = document.createElement('div');

        // add (red vs green) depending on issue or not
        div.className = 'card ' + (p.is_error ? 'error' : 'ok');
        div.innerHTML = `
            <h3>${p.name}</h3>
            <p><b>IP:</b> ${p.ip}</p>
            <p><b>Location:</b> ${p.location}</p>
            <p><b>Status:</b> ${p.status}</p>
            <p><b>Pages:</b> ${p.page_count}</p>
        `;

        container.appendChild(div);
    });
}


loadPrinters();
setInterval(loadPrinters, 10000);