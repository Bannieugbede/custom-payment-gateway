import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCcV2wPeCQYwEJVsu3axkDPV109f2w0tIs",
    authDomain: "custom-payment-gateway.firebaseapp.com",
    projectId: "custom-payment-gateway",
    storageBucket: "custom-payment-gateway.firebasestorage.app",
    messagingSenderId: "946525314804",
    appId: "1:946525314804:web:f231c49906d0440bc1c8a1",
    measurementId: "G-WVH37F3VMM",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword };