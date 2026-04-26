async function loadPrinters() {
    const res = await fetch('http://localhost:3000/printers');
    const data = await res.json();

    const container = document.getElementById('container');
    container.innerHTML = '';

    //group by buildings
    const grouped = {};

    data.forEach(p => {
        const building = p.location.split('(')[0].trim();

        if (!grouped[building]) {
            grouped[building] = [];
        }

        grouped[building].push(p);
    });

    //render building sections and dropdowns
    Object.keys(grouped).forEach(building => {

        //building header
        const header = document.createElement('div');
        header.className = 'building-header';
        header.textContent = building + " ▼";

        //printer list
        const list = document.createElement('div');
        list.className = 'printer-list';
        list.style.display = 'none';

        //toggle dropdown
        header.onclick = () => {
            const isHidden = list.style.display === 'none';

            list.style.display = isHidden ? 'block' : 'none';
            header.textContent = building + (isHidden ? " ▲" : " ▼");
        };

        //add printers
        grouped[building].forEach(p => {
            const div = document.createElement('div');

            div.className = 'card ' + (p.is_error ? 'error' : 'ok');

            div.innerHTML = `
                <h3>${p.name}</h3>
                <p><b>IP:</b> ${p.ip}</p>
                <p><b>Location:</b> ${p.location}</p>
                <p><b>Status:</b> ${p.status}</p>
                <p><b>Pages:</b> ${p.page_count}</p>
            `;

            list.appendChild(div);
        });

        container.appendChild(header);
        container.appendChild(list);
    });
}

//auto refresh every 10 seconds
loadPrinters();
setInterval(loadPrinters, 10000);