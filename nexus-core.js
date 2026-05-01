// ==========================================
// PROJECT NEXUS - CLOUD CORE ENGINE (V2 STABLE)
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCr-HdTaoK0esCrTvfle7jaP2d0J1tklMU",
  authDomain: "project-nexus-a44ba.firebaseapp.com",
  projectId: "project-nexus-a44ba",
  storageBucket: "project-nexus-a44ba.firebasestorage.app",
  messagingSenderId: "781925379084",
  appId: "1:781925379084:web:56723e3c12a086dad09229"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("NEXUS CORE: Firebase Online.");

let myVaultKey = localStorage.getItem('nexus_vault_key');

// --- 1. STABILIZED SYNC ENGINE ---
async function checkSync() {
    if (!myVaultKey) {
        console.log("NEXUS: Running in Local-Only mode.");
        return; 
    }

    // FEEDBACK LOOP PREVENTION: Check if we just refreshed from a sync
    if (sessionStorage.getItem('nexus_sync_lock')) {
        console.log("Sync lock active for this tab session.");
        return;
    }

    try {
        const docSnap = await getDoc(doc(db, "private_vaults", myVaultKey));
        
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            let changed = false;
            
            // Sync Main Database
            if (cloudData.nexus_db) {
                const cloudDbStr = JSON.stringify(cloudData.nexus_db);
                if (localStorage.getItem('nexus_db') !== cloudDbStr) {
                    localStorage.setItem('nexus_db', cloudDbStr);
                    changed = true;
                }
            }
            
            // Sync Terminal Tasks
            if (cloudData.terminal_tasks) {
                const cloudTasksStr = JSON.stringify(cloudData.terminal_tasks);
                if (localStorage.getItem('skTasks_v2') !== cloudTasksStr) {
                    localStorage.setItem('skTasks_v2', cloudTasksStr);
                    changed = true;
                }
            }
            
            if (changed) {
                console.log("New cloud data detected. Updating and locking...");
                sessionStorage.setItem('nexus_sync_lock', 'true');
                location.reload();
            }
        }
    } catch (error) {
        console.error("Cloud sync failed:", error);
    }
}

// --- 2. OPT-IN VAULT GENERATION ---
window.generateCloudVault = async function() {
    if (confirm("Initialize Cloud Sync? This will back up your data and allow you to link other devices.")) {
        const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
        const newKey = "NEXUS-" + randomStr;
        
        await setDoc(doc(db, "private_vaults", newKey), {
            nexus_db: JSON.parse(localStorage.getItem('nexus_db')) || {},
            terminal_tasks: JSON.parse(localStorage.getItem('skTasks_v2')) || [],
            createdAt: new Date().toISOString()
        });

        localStorage.setItem('nexus_vault_key', newKey);
        alert("CLOUD ONLINE. Your Master Key: " + newKey + "\n\nSave this key to link your phone!");
        location.reload();
    }
};

// --- 3. LINKING PROTOCOL ---
window.linkDevice = function() {
    const existingKey = prompt("Enter your 12-character NEXUS Vault Key:");
    if (existingKey && existingKey.startsWith("NEXUS-")) {
        localStorage.setItem('nexus_vault_key', existingKey.trim().toUpperCase());
        alert("VAULT LINKED. Fetching cloud data...");
        location.reload();
    } else {
        alert("Invalid Key Format.");
    }
};

// Initialize
checkSync();

// Global Utilities
window.db = db;
window.myVaultKey = myVaultKey;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
