import { useState } from "react";
import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetch('https://example.com')
      .then(response => response.json())
      .then(data => {
        setUserData(data);
        setLoading(false); // डेटा लोड होने के बाद लोडर हटा दें
      });
  }, []);

  // अगर लोडिंग चल रही है, तो लोडर दिखाएं
  if (loading) {
    return <h2>Loading profile...</h2>; 
  }

  // डेटा आने के बाद UI दिखाएं
  return (
    <div>
      <h1>{userData?.name}</h1>
    </div>
  );
}
