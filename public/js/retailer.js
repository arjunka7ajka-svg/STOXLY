let inventoryChart;
let stockChart;
let inventoryData = [];
async function loadRetailer() {

    // ==========================
    // Check Login
    // ==========================

    const me = await fetch("/api/me");
    const meData = await me.json();

    if (!meData.loggedIn) {
        window.location.href = "/login.html";
        return;
    }

    document.getElementById("avatar").textContent =
        (meData.user.fullname || "R")
        .charAt(0)
        .toUpperCase();

    // ==========================
    // Inventory
    // ==========================

    const res = await fetch("/api/inventory");

    inventoryData = await res.json();
const inventory = inventoryData;

    const tbody = document.querySelector("#inventoryTable tbody");

    tbody.innerHTML = "";

    let totalQty = 0;
let lowStock = 0;

    inventory.forEach(item => {

        totalQty += Number(item.quantity);
if (Number(item.quantity) <= 5) {
    lowStock++;
}
        tbody.innerHTML += `

        <tr>

            <td>${item.product}</td>

            <td>${item.category}</td>

            <td>${item.quantity}</td>

            <td>${item.unit}</td>

        </tr>

        `;

    });

    document.getElementById("productCount").textContent =
        inventory.length;

    document.getElementById("quantityCount").textContent =
        totalQty;

    // ==========================
    // Requests
    // ==========================

    const req = await fetch("/api/requests");

    const requests = await req.json();

    const myPending = requests.filter(r =>
    r.owner === meData.user.username &&
    r.status === "Pending"
);

document.getElementById("pendingCount").textContent =
myPending.length;
    // ==========================
// My Requests
// ==========================

const requestBody = document.querySelector("#requestTable tbody");

requestBody.innerHTML = "";

const myRequests = requests.filter(r => r.owner === meData.user.username);

myRequests.forEach(r => {

    requestBody.innerHTML += `

    <tr>

        <td>${r.product}</td>

        <td>${r.quantity}</td>

        <td>${r.reason}</td>

        <td>

            <span class="status ${r.status.toLowerCase()}">

                ${r.status}

            </span>

        </td>

    </tr>

    `;

});
    document.getElementById("lowStockCount").textContent = lowStock;

drawCharts(inventory);

}

// ============================
// Logout
// ============================

document.getElementById("logoutBtn").addEventListener("click", async (e)=>{

    e.preventDefault();

    await fetch("/api/logout");

    window.location.href="/login.html";

});

// ============================

document.getElementById("searchBox").addEventListener("keyup", function(){

    const value = this.value.toLowerCase();

    const rows = document.querySelectorAll("#inventoryTable tbody tr");

    rows.forEach(row=>{

        row.style.display =
            row.innerText.toLowerCase().includes(value)
            ? ""
            : "none";

    });

});

loadRetailer();

setInterval(loadRetailer,5000);
function drawCharts(data){

    const inventoryCanvas = document.getElementById("inventoryChart");
    const stockCanvas = document.getElementById("stockChart");

    if(!inventoryCanvas || !stockCanvas) return;

    if(inventoryChart) inventoryChart.destroy();
    if(stockChart) stockChart.destroy();

    const labels = data.map(i => i.product);
    const qty = data.map(i => Number(i.quantity));

    inventoryChart = new Chart(inventoryCanvas,{

        type:"doughnut",

        data:{
            labels:labels,
            datasets:[{
                data:qty
            }]
        }

    });

    stockChart = new Chart(stockCanvas,{

        type:"bar",

        data:{
            labels:labels,
            datasets:[{
                label:"Stock",
                data:qty
            }]
        }

    });

}
const modal = document.getElementById("productModal");

document.getElementById("addProductBtn").onclick = () => {

    modal.classList.add("show");

};

document.getElementById("closeModal").onclick = () => {

    modal.classList.remove("show");

};

const requestModal = document.getElementById("requestModal");

document.getElementById("requestProductBtn").onclick = () => {
    requestModal.classList.add("show");
};

document.getElementById("closeRequestModal").onclick = () => {
    requestModal.classList.remove("show");
};

window.addEventListener("click", (e) => {

    if (e.target === modal) {
        modal.classList.remove("show");
    }

    if (e.target === requestModal) {
        requestModal.classList.remove("show");
    }

});
// ===============================
// Save Product
// ===============================

document.getElementById("productForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const product = document.getElementById("product").value.trim();
    const category = document.getElementById("category").value.trim();
    const quantity = document.getElementById("quantity").value;
    const unit = document.getElementById("unit").value.trim();

    const response = await fetch("/api/inventory", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            product,
            category,
            quantity,
            unit
        })

    });

    const result = await response.json();

    if(result.success){

        document.getElementById("productForm").reset();

        modal.classList.remove("show");

        loadRetailer();

        showToast("✅ Product Added Successfully");

    }else{

        alert("Failed to add product.");

    }

});
function showToast(message){

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}
// ===============================
// Submit Product Request
// ===============================

document.getElementById("requestForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const product = document.getElementById("requestProduct").value.trim();
    const quantity = document.getElementById("requestQuantity").value;
    const reason = document.getElementById("requestReason").value.trim();

    const response = await fetch("/api/requests", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            product,
            quantity,
            reason
        })

    });

    const result = await response.json();

    if(result.success){

        document.getElementById("requestForm").reset();

        requestModal.classList.remove("show");

        showToast("📦 Product Request Sent");

        loadRetailer();

    }else{

        alert("Failed to send request.");

    }

});
const menuBtn=document.getElementById("menuBtn");

if(menuBtn){

menuBtn.onclick=()=>{

document.querySelector(".sidebar").classList.toggle("active");

};

}