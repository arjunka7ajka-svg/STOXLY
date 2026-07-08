// ==========================
// STOXLY MVP - main.js
// ==========================

// ---------- Register ----------

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const fullname = document.getElementById("fullname").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fullname,
                username,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            alert("Account Created Successfully!");

            window.location.href = "/login.html";

        } else {

            alert(data.message);

        }

    });

}

// ---------- Login ----------

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })

        });

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        if (data.role === "admin") {

    window.location.href = "/admin.html";

} else {

    window.location.href = "/retailer.html";

}

    });

}