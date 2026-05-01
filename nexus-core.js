// ==========================================
// PROJECT NEXUS - CLOUD CORE ENGINE (V4 REAL-TIME)
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
console.log("NEXUS CORE: Firebase Online. Real-time protocols standing by.");

let myVaultKey = localStorage.getItem('nexus_vault_key');

// --- 1. THE GATEKEEPER OVERLAY ---
if (!myVaultKey) {
    window.addEventListener('DOMContentLoaded', () => {
        const gateway = document.createElement('div');
        gateway.id = 'nexus-gateway';
        gateway.style.cssText = 'position:fixed; inset:0; background:#050508; z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(15px); font-family: sans-serif;';
        
        gateway.innerHTML = `
            <div style="background: rgba(15, 15, 18, 0.95); padding: 40px; border-radius: 12px; border: 1px solid #00f0ff; text-align: center; width: 90%; max-width: 420px; box-shadow: 0 0 40px rgba(0, 240, 255, 0.15);">
                <h2 style="color: #00f0ff; margin-top: 0; letter-spacing: 3px; font-weight: 800;">SYSTEM LOCK</h2>
                <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 30px; line-height: 1.5;">Establish a secure connection. Enter your existing Vault Key to sync, or initialize a fresh databank.</p>
                
                <input type="text" id="gw-key" placeholder="NEXUS-XXXXXXXX" style="width: 100%; padding: 14px; margin-bottom: 20px; background: rgba(0,0,0,0.6); border: 1px solid #334155; color: #fff; text-align: center; font-family: monospace; font-size: 1.2rem; border-radius: 6px; box-sizing: border-box; outline: none;">
                
                <button onclick="window.gwSubmit()" style="width: 100%; padding: 14px; background: rgba(0, 240, 255, 0.1); color: #00f0ff; border: 1px solid #00f0ff; border-radius: 6px; cursor: pointer; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px; transition: all 0.3s ease;">[ 🔗 ] LINK EXISTING VAULT</button>
                
                <div style="display: flex; align-items: center; margin: 20px 0;">
                    <div style="flex: 1; height: 1px; background: #334155;"></div>
                    <span style="padding: 0 15px; color: #64748b; font-size: 0.8rem; font-weight: bold;">OR</span>
                    <div style="flex: 1; height: 1px; background: #334155;"></div>
                </div>
                
                <button onclick="window.gwGenerate()" style="width: 100%; padding: 14px; background: rgba(255, 184, 0, 0.05); color: #ffb800; border: 1px solid #ffb800; border-radius: 6px; cursor: pointer; font-weight: bold; letter-spacing: 1px; transition: all 0.3s ease;">[ + ] CREATE FRESH VAULT</button>
            </div>
        `;
        document.body.appendChild(gateway);
    });
} else {
    // Fire up the real-time sync engine immediately
    startRealTimeSync();
}

// --- 2. GATEWAY ACTIONS ---
window.gwSubmit = function() {
    const val = document.getElementById('gw-key').value.trim().toUpperCase();
    if (val.startsWith("NEXUS-") && val.length > 8) {
        localStorage.setItem('nexus_vault_key', val);
        alert("CREDENTIALS ACCEPTED. Fetching cloud data...");
        location.reload();
    } else {
        alert("INVALID KEY FORMAT. Must match: NEXUS-XXXXXXXX");
    }
};

window.gwGenerate = async function() {
    if (confirm("INITIALIZE FRESH VAULT? This will secure your current progress to the cloud.")) {
        document.getElementById('nexus-gateway').innerHTML = `<h3 style="color:#00f0ff; font-family:monospace; text-shadow: 0 0 10px #00f0ff;">INITIALIZING SECURE PROTOCOLS...</h3>`;
        
        const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
        const newKey = "NEXUS-" + randomStr;
        
        try {
            await setDoc(doc(db, "private_vaults", newKey), {
                nexus_db: JSON.parse(localStorage.getItem('nexus_db')) || {},
                terminal_tasks: JSON.parse(localStorage.getItem('skTasks_v2')) || [],
                createdAt: new Date().toISOString()
            });

            localStorage.setItem('nexus_vault_key', newKey);
            alert("VAULT ESTABLISHED.\n\nYour Master Key: " + newKey + "\n\nStore this key safely to link your other devices.");
            location.reload();
        } catch (error) {
            alert("NETWORK FAILURE: Could not connect to Firebase.");
            console.error(error);
            location.reload();
        }
    }
};

// --- 3. REAL-TIME SYNC ENGINE ---
// --- 3. REAL-TIME SYNC ENGINE (V5 STABILIZED) ---
function startRealTimeSync() {
    if (!myVaultKey) return; 

    console.log("NEXUS: Real-time telemetry established.");

    // includeMetadataChanges allows us to detect who triggered the sync
    onSnapshot(doc(db, "private_vaults", myVaultKey), { includeMetadataChanges: true }, (docSnap) => {
        
        // 1. THE ECHO FILTER: Ignore data pushes that came from our own device
        if (docSnap.metadata.hasPendingWrites) {
            return; 
        }

        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            
            // 2. THE DEBOUNCER: Hard lock against runaway infinite loops
            const lastSync = sessionStorage.getItem('nexus_cooldown');
            const now = Date.now();
            if (lastSync && (now - parseInt(lastSync)) < 3000) {
                return; // Suppress any rapid-fire syncs under 3 seconds
            }

            let changed = false;
            
            if (cloudData.nexus_db) {
                const cloudStr = JSON.stringify(cloudData.nexus_db);
                if (localStorage.getItem('nexus_db') !== cloudStr) {
                    localStorage.setItem('nexus_db', cloudStr);
                    changed = true;
                }
            }
            
            if (cloudData.terminal_tasks) {
                const cloudStr = JSON.stringify(cloudData.terminal_tasks);
                if (localStorage.getItem('skTasks_v2') !== cloudStr) {
                    localStorage.setItem('skTasks_v2', cloudStr);
                    changed = true;
                }
            }
            
            if (changed) {
                console.log("Incoming transmission... Updating UI.");
                sessionStorage.setItem('nexus_cooldown', now.toString());
                
                // 3. THE SOFT-LOADER: Update the screen without flashing the browser tab
                if (typeof window.renderDashboard === 'function') {
                    window.renderDashboard(); 
                } else {
                    location.reload(); // Fallback for the terminal page
                }
            }
        }
    });
}

// Global Utilities
window.db = db;
window.myVaultKey = myVaultKey;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
