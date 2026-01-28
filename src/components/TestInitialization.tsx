import { useState, useEffect } from "react";

// Simplified test component
export default function TestInitialization({ onSystemInitialized }: { onSystemInitialized?: () => void }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Test Initialization Component</h1>
      <p>If you see this, the component is loading correctly.</p>
      <button onClick={() => onSystemInitialized && onSystemInitialized()}>
        Test Callback
      </button>
    </div>
  );
}