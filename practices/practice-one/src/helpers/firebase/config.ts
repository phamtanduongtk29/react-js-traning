import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FB_API_KEY,
    authDomain: process.env.REACT_APP_FB_API_AUTH,
    projectId: process.env.REACT_APP_FB_API_PROJECTID,
    storageBucket: process.env.REACT_APP_FB_API_STORAGE,
    messagingSenderId: process.env.REACT_APP_FB_API__MESSAGE,
    appId: process.env.REACT_APP_FB_API_APP_ID,
    measurementId: process.env.REACT_APP_FB_API_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const database = getDatabase(app);