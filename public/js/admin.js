let inventoryChart;
let requestChart;

async function loadDashboard() {

    // ==========================
    // Check Login
    // ==========================

    const me = await fetch("/api/me");
    const meData = await me.json();

    if (!meData.loggedIn) {
        window.location.href = "/login.html";
        return;
    }

    // ==========================
    // Dashboard Stats
    // ==========================

    const stats = await fetch("/api/stats");
    const statsData = await stats.json();

    document.getElementById("userCount").textContent =
        statsData.totalUsers || 0;

    document.getElementById("inventoryCount").textContent =
        statsData.totalProducts || 0;

    document.getElementById("requestCount").textContent =
        statsData.totalRequests || 0;

    drawCharts(statsData);

    // ==========================
    // Requests
    // ==========================

    const req = await fetch("/api/requests");
    const requests = await req.json();

    const tbody = document.querySelector("#requestTable tbody");

    tbody.innerHTML = "";

    requests
    .filter(r => r.status === "Pending")
    .forEach(r => {

        let actionButtons = "";

        if (r.status === "Pending") {

            actionButtons = `
                <button class="approve-btn"
                    onclick="updateStatus(${r.id},'Approved')">
                    ✓ Approve
                </button>

                <button class="reject-btn"
                    onclick="updateStatus(${r.id},'Rejected')">
                    ✕ Reject
                </button>
            `;

        } else if (r.status === "Approved") {

            actionButtons = `
                <span class="status approved">
                    ✔ Completed
                </span>
            `;

        } else {

            actionButtons = `
                <span class="status rejected">
                    ✖ Rejected
                </span>
            `;

        }

        tbody.innerHTML += `

        <tr>

            <td>${r.owner}</td>

            <td>${r.product}</td>

            <td>${r.quantity}</td>

            <td>
                <span class="status ${r.status.toLowerCase()}">
                    ${r.status}
                </span>
            </td>

            <td>
                ${actionButtons}
            </td>

        </tr>

        `;

    });

}

// ==========================
// Update Status
// ==========================

async function updateStatus(id, status) {

    await fetch(`/api/requests/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            status
        })

    });

    loadDashboard();

}

// ==========================
// Logout
// ==========================

document.getElementById("logoutBtn").addEventListener("click", async (e) => {

    e.preventDefault();

    await fetch("/api/logout");

    window.location.href = "/login.html";

});

// ==========================
// Charts
// ==========================

function drawCharts(stats) {

    const inv = document.getElementById("inventoryChart");
    const req = document.getElementById("requestChart");

    if (!inv || !req) return;

    if (inventoryChart) inventoryChart.destroy();
    if (requestChart) requestChart.destroy();

    inventoryChart = new Chart(inv, {

        type: "doughnut",

        data: {

            labels: ["Products", "Users"],

            datasets: [{

                data: [
                    stats.totalProducts,
                    stats.totalUsers
                ]

            }]

        }

    });

    requestChart = new Chart(req, {

        type: "bar",

        data: {

            labels: ["Pending Requests"],

            datasets: [{

                label: "Requests",

                data: [
                    stats.totalRequests
                ]

            }]

        }

    });

}

// ==========================

loadDashboard();

setInterval(loadDashboard, 5000);
const menuBtn=document.getElementById("menuBtn");

if(menuBtn){

menuBtn.onclick=()=>{

document.querySelector(".sidebar").classList.toggle("active");

};

}