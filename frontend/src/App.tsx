// src/App.js

import React, { useEffect, useState } from 'react';

const App = () => {
  const [status, setStatus] = useState('');
  const [deviceData, setDeviceData] = useState([]);

  useEffect(() => {
    window.electron.ipcRenderer.on('device-data', (data) => {
      setDeviceData(data)
    })
  }, [])

  const connectDevice = async () => {
    const response = await window.electron.ipcRenderer.invoke('connect-device');
    setStatus(response.status === 'connected' ? 'Connected:' : `Error: ${response.message}`);
  };

  const openDevice = async () => {
    const response = await window.electron.ipcRenderer.invoke('open-device');
    setStatus(response.status === 'opened' ? 'Message Sent' : `Error: ${response.message}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Proteus Controller</h1>
        <div className="space-x-4">
          <button
            onClick={connectDevice}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Connect
          </button>
          <button
            onClick={openDevice}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Send Message
          </button>
        </div>
        {status && <p className="mt-4 text-lg">{status}</p>}
      </div>
    </div>
  );
};

export default App;
