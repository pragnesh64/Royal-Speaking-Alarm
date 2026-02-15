import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeCapacitor } from "./lib/capacitor";
import './plugins/TestAlarm'; // Import test alarm for debugging
import './plugins/CleanupOldAlarms'; // Import cleanup function for old alarms

initializeCapacitor().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
