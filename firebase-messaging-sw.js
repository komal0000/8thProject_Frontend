importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDyeHO51_sL_jZ-bZ4GqoAQwAg9W2BRjfQ",
  authDomain: "tasky101-16282.firebaseapp.com",
  projectId: "tasky101-16282",
  storageBucket: "tasky101-16282.firebasestorage.app",
  messagingSenderId: "515334120543",
  appId: "1:515334120543:web:f408ae313356ecdc4ca7ea",
  measurementId: "G-L2NZMYR56Z"
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
