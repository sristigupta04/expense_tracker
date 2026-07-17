import React, { useState, useEffect } from 'react';
import './Loader.css'; // Import the styling

export default function App() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then((res) => res.json())
      .then((json) => {
        setData(json.slice(0, 5));
        setIsLoading(false); // Stop loading once data arrives
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Conditional Rendering
  return (
    <div className="container">
      {isLoading ? (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="content">
          <h1>Data Loaded Successfully!</h1>
          {data.map(post => <p key={post.id}>{post.title}</p>)}
        </div>
      )}
    </div>
  );
}


