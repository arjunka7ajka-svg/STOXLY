const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// Middleware
// ======================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "stoxly-secret-key",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "public")));

// ======================
// Helpers
// ======================

const usersFile = path.join(__dirname, "data", "users.json");

function getUsers() {
    return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// ======================
// Pages
// ======================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/admin.html", (req, res) => {

    if (!req.session.user)
        return res.redirect("/login.html");

    if (req.session.user.role !== "admin")
        return res.redirect("/login.html");

    res.sendFile(path.join(__dirname, "public", "admin.html"));

});

app.get("/retailer.html", (req, res) => {

    if (!req.session.user)
        return res.redirect("/login.html");

    res.sendFile(path.join(__dirname, "public", "retailer.html"));

});

// ======================
// Register
// ======================

app.post("/api/register", (req, res) => {

    const { fullname, username, password } = req.body;

    const users = getUsers();

    if (users.find(u => u.username === username)) {

        return res.json({
            success: false,
            message: "Username already exists."
        });

    }

    users.push({
        fullname,
        username,
        password,
        role: "retailer"
    });

    saveUsers(users);

    res.json({
        success: true
    });

});

// ======================
// Login
// ======================

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    const users = getUsers();

    const user = users.find(
        u =>
        u.username === username &&
        u.password === password
    );

    if (!user) {

        return res.json({
            success: false,
            message: "Invalid username or password."
        });

    }

    req.session.user = user;

    res.json({
        success: true,
        role: user.role,
        fullname: user.fullname || "Admin"
    });

});

// ======================
// Current User
// ======================

app.get("/api/me", (req, res) => {

    if (!req.session.user) {

        return res.json({
            loggedIn: false
        });

    }

    res.json({
        loggedIn: true,
        user: req.session.user
    });

});

// ======================
// Dashboard Data
// ======================

app.get("/api/users", (req, res) => {

    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    res.json(getUsers());

});

app.get("/api/stats", (req, res) => {

    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const users = getUsers();

    const inventory = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, "data", "inventory.json"),
            "utf8"
        )
    );

    const requests = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, "data", "requests.json"),
            "utf8"
        )
    );

   const pendingRequests = requests.filter(
    r => r.status === "Pending"
).length;

res.json({
    totalUsers: users.length,
    totalProducts: inventory.length,
    totalRequests: pendingRequests
});

});

// ======================
// Inventory APIs
// ======================

const inventoryFile = path.join(__dirname, "data", "inventory.json");

function getInventory() {
    return JSON.parse(fs.readFileSync(inventoryFile, "utf8"));
}

function saveInventory(data) {
    fs.writeFileSync(inventoryFile, JSON.stringify(data, null, 2));
}

// Get logged-in retailer's inventory
app.get("/api/inventory", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({ success: false });
    }

    const inventory = getInventory();

    // Admin sees everything
    if (req.session.user.role === "admin") {
        return res.json(inventory);
    }

    // Retailer sees only own products
    const myProducts = inventory.filter(
        item => item.owner === req.session.user.username
    );

    res.json(myProducts);

});

// Add product
app.post("/api/inventory", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({ success: false });
    }

    const { product, category, quantity, unit } = req.body;

    const inventory = getInventory();

    inventory.push({

        id: Date.now(),

        owner: req.session.user.username,

        product,

        category,

        quantity,

        unit

    });

    saveInventory(inventory);

    res.json({
        success: true
    });

});

// Delete product
app.delete("/api/inventory/:id", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({ success: false });
    }

    let inventory = getInventory();

    inventory = inventory.filter(
        item => item.id != req.params.id
    );

    saveInventory(inventory);

    res.json({
        success: true
    });

});

// ======================
// Logout
// ======================

app.get("/api/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/login.html");

    });

});

// ======================
// Transfer Request APIs
// ======================

const requestsFile = path.join(__dirname, "data", "requests.json");

function getRequests() {
    return JSON.parse(fs.readFileSync(requestsFile, "utf8"));
}

function saveRequests(data) {
    fs.writeFileSync(requestsFile, JSON.stringify(data, null, 2));
}

// Get Requests
app.get("/api/requests", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({ success: false });
    }

    const requests = getRequests();

    if (req.session.user.role === "admin") {
        return res.json(requests);
    }

    const myRequests = requests.filter(
        r => r.owner === req.session.user.username
    );

    res.json(myRequests);

});

// Add Request
app.post("/api/requests", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({ success: false });
    }

    const { product, quantity, reason } = req.body;

    const requests = getRequests();

    requests.push({

        id: Date.now(),

        owner: req.session.user.username,

        product,

        quantity,

        reason,

        status: "Pending"

    });

    saveRequests(requests);

    res.json({
        success: true
    });

});
// Update Request Status

app.put("/api/requests/:id", (req, res) => {

    if (!req.session.user || req.session.user.role !== "admin") {

        return res.status(403).json({
            success: false
        });

    }

    const { status } = req.body;

    const requests = getRequests();

    const request = requests.find(r => r.id == req.params.id);

    if (!request) {

        return res.status(404).json({
            success: false
        });

    }

    request.status = status;

    // ==========================================
    // AUTO TRANSFER INVENTORY AFTER APPROVAL
    // ==========================================

    if (status === "Approved") {

        const inventory = getInventory();

        const existing = inventory.find(item =>

            item.owner === request.owner &&
            item.product.toLowerCase() === request.product.toLowerCase()

        );

        if (existing) {

            existing.quantity =
                Number(existing.quantity) +
                Number(request.quantity);

        } else {

            inventory.push({

                id: Date.now(),

                owner: request.owner,

                product: request.product,

                category: "Transferred",

                quantity: request.quantity,

                unit: "pcs"

            });

        }

        saveInventory(inventory);

    }

    saveRequests(requests);

    res.json({
        success: true
    });

});
// ======================
// Server
// ======================

app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("🚀 STOXLY MVP SERVER RUNNING");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("======================================");
    console.log("");
});