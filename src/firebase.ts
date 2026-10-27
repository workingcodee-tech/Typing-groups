import { initializeApp } from 'firebase/app';
import { initializeFirestore, setLogLevel, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Configure log level to suppress non-fatal connection warnings
setLogLevel('error');

const app = initializeApp(firebaseConfig);

// Use experimentalAutoDetectLongPolling for ultra low latency WebSockets streaming,
// with graceful fallback only if streaming is unavailable
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
