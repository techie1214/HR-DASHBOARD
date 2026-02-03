// Import createRoot function from React DOM client library
// This is used to create a root for rendering the React application in the browser
import { createRoot } from "react-dom/client";

// Import the main App component from the App.tsx file
// This is the root component of the HR dashboard application
import App from "./App.tsx";

// Import the AuthProvider from AuthContext
import { AuthProvider } from "./AuthContext";

// Import the global CSS styles from index.css
// This includes base styles and Tailwind CSS for the entire application
import "./index.css";

// Create a React root attached to the DOM element with id 'root'
// The exclamation mark asserts that getElementById will not return null
// Wrap the App component with AuthProvider to provide authentication context
// Render the App component inside this root, starting the React application
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);