// nexus-core.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCr-HdTaoK0esCrTvfle7jaP2d0J1tklMU",
  authDomain: "project-nexus-a44ba.firebaseapp.com",
  projectId: "project-nexus-a44ba",
  storageBucket: "project-nexus-a44ba.firebasestorage.app",
  messagingSenderId: "781925379084",
  appId: "1:781925379084:web:56723e3c12a086dad09229"
};


// 1. Initialize Cloud Connection
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("NEXUS CORE: Firebase Online.");

// 2. The Anonymous Vault System
let myVaultKey = localStorage.getItem('nexus_vault_key');

async function initializeVault() {
    if (!myVaultKey) {
        // Generate new key
        const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
        myVaultKey = "NEXUS-" + randomStr;
        localStorage.setItem('nexus_vault_key', myVaultKey);
        
        // Create empty vault in the cloud
        await setDoc(doc(db, "private_vaults", myVaultKey), {
            personal_tasks: [],
            checked_global_tasks: [],
            createdAt: new Date().toISOString()
        });
        
        console.log("NEW VAULT CREATED: " + myVaultKey);
        alert("SYSTEM NOTICE: Your secure cloud vault is ready.\n\nYour Key: " + myVaultKey + "\n\nSave this key to sync your other devices.");
    } else {
        console.log("VAULT RECOGNIZED: " + myVaultKey);
    }
}

initializeVault();

// 3. Expose to the Window object so your HTML files can use them
window.db = db;
window.myVaultKey = myVaultKey;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
