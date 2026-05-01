// ==========================================
// PROJECT NEXUS - CLOUD CORE ENGINE
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 1. FIREBASE CONFIGURATION


const firebaseConfig = {
  apiKey: "AIzaSyCr-HdTaoK0esCrTvfle7jaP2d0J1tklMU",
  authDomain: "project-nexus-a44ba.firebaseapp.com",
  projectId: "project-nexus-a44ba",
  storageBucket: "project-nexus-a44ba.firebasestorage.app",
  messagingSenderId: "781925379084",
  appId: "1:781925379084:web:56723e3c12a086dad09229"
};

// 2. INITIALIZE CLOUD CONNECTION
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("NEXUS CORE: Firebase Online.");

// 3. THE ANONYMOUS VAULT SYSTEM
let myVaultKey = localStorage.getItem('nexus_vault_key');

async function initializeVault() {
    if (!myVaultKey) {
        // A. Generate a new secure key
        const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
        myVaultKey = "NEXUS-" + randomStr;
        localStorage.setItem('nexus_vault_key', myVaultKey);
        
        // B. Create the cloud vault AND upload their current local data so they lose nothing
        await setDoc(doc(db, "private_vaults", myVaultKey), {
            nexus_db: JSON.parse(localStorage.getItem('nexus_db')) || {},
            terminal_tasks: JSON.parse(localStorage.getItem('skTasks_v2')) || [],
            createdAt: new Date().toISOString()
        });
        
        console.log("NEW VAULT CREATED: " + myVaultKey);
        alert("SYSTEM NOTICE: Your secure cloud vault is ready.\n\nYour Key: " + myVaultKey + "\n\nSave this key to sync your phone or other devices.");
    } else {
        console.log("VAULT RECOGNIZED: " + myVaultKey);
        
        // C. The "Eventual Consistency" Sync Protocol (Cloud -> Local)
        try {
            const docSnap = await getDoc(doc(db, "private_vaults", myVaultKey));
            
            if (docSnap.exists()) {
                const cloudData = docSnap.data();
                let changed = false;
                
                // Compare and sync the Main Database (Syllabus, Resources, Subjects)
                if (cloudData.nexus_db) {
                    const cloudDbStr = JSON.stringify(cloudData.nexus_db);
                    if (localStorage.getItem('nexus_db') !== cloudDbStr) {
                        localStorage.setItem('nexus_db', cloudDbStr);
                        changed = true;
                    }
                }
                
                // Compare and sync the Terminal Tasks
                if (cloudData.terminal_tasks) {
                    const cloudTasksStr = JSON.stringify(cloudData.terminal_tasks);
                    if (localStorage.getItem('skTasks_v2') !== cloudTasksStr) {
                        localStorage.setItem('skTasks_v2', cloudTasksStr);
                        changed = true;
                    }
                }
                
                // If the Cloud had newer data, silently reboot the UI to show it
                if (changed) {
                    console.log("Cloud sync complete. Updating UI...");
                    location.reload();
                }
            }
        } catch (error) {
            console.error("Failed to sync from cloud:", error);
        }
    }
}

// Boot up the vault system
initializeVault();

// 4. DEVICE LINKING PROTOCOL (Exposed to HTML)
window.linkDevice = function() {
    const existingKey = prompt("Enter your 12-character NEXUS Vault Key (e.g., NEXUS-A1B2C3D4):");
    
    if (existingKey && existingKey.startsWith("NEXUS-")) {
        // Overwrite the local cache with the imported key
        localStorage.setItem('nexus_vault_key', existingKey.trim().toUpperCase());
        alert("DEVICE LINKED. Fetching cloud data...");
        // Reload the page so initializeVault() runs with the new key and pulls down the data
        location.reload();
    } else {
        alert("Invalid Key Format. Must start with NEXUS-");
    }
};

// 5. EXPOSE FIREBASE UTILITIES TO GLOBAL WINDOW
// This allows your data.js and terminal.html files to push to the cloud
window.db = db;
window.myVaultKey = myVaultKey;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
