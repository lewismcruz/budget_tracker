const request = indexedDB.open("budget", 1)
let db;

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", {
        autoIncrement: true
    });
      
    const budgetStore = db.createObjectStore("budget", {
        keyPath: "transactionID"
    });

    budgetStore.createIndex("statusIndex", "status");
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log(event.target.result);

    if (navigator.onLine) {
        checkDatabase();
        console.log("Line 25 db.js");
    }
};


request.onerror = function(event) {
    console.log("Error message here - This did not work.");
    console.log(event);
}

function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");
  const objectStore = transaction.objectStore("pending");

  objectStore.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["budget"], "readwrite");
    const objectStore = transaction.objectStore("budget");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const db = response.result;
                const transaction = db.transaction(["budget"], "readwrite");
                const budgetStore = transaction.objectStore("budget");
                const statusIndex = budgetStore.index("statusIndex");

                budgetStore.add({})

                const getCursorRequest = budgetStore.openCursor();
                getCursorRequest.onsuccess = event => {
                    if (cursor) {
                        console.log(cursor.value);
                        cursor.continue();
                    } else {
                        console.log("End of results");
                    }
                };

            })
        }
    }
}

window.addEventListener("online", checkDatabase);

