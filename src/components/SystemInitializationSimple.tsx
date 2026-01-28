import { useState, useEffect } from "react";

// Basic test component to see if it loads
export default function SystemInitialization({ onSystemInitialized }: { onSystemInitialized?: () => void } = {}) {
  const [status, setStatus] = useState("checking");
  
  useEffect(() => {
    // Simulate checking system status
    setTimeout(() => {
      setStatus("ready"); // Change to "ready" to simulate system ready state
    }, 1000);
  }, []);

  if (status === "checking") {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Checking system status...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>System Initialization Component Loaded!</h1>
      <p>Status: {status}</p>
      <button onClick={() => onSystemInitialized && onSystemInitialized()}>
        Go to Login
      </button>
    </div>
  );
}