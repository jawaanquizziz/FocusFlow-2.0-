import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    try {
        // Vercel Environment Variable
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
        
        if (!serviceAccountJson) {
            throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
        }

        const serviceAccount = JSON.parse(serviceAccountJson);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Firebase Admin Initialization Error:", error);
    }
}

export default async function handler(req, res) {
    // 1. Only allow POST or DELETE methods
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Extract the UID from the request
    const uid = req.body?.uid || req.query?.uid;

    if (!uid) {
        return res.status(400).json({ error: 'Missing UID' });
    }

    // 3. Delete the user
    try {
        const db = admin.firestore();
        const auth = admin.auth();

        // Delete from Auth
        await auth.deleteUser(uid);
        
        // Delete from Firestore
        await db.collection("users").doc(uid).delete();

        return res.status(200).json({ success: true, message: `User ${uid} completely deleted.` });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
