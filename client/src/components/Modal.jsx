import React from "react";

function Modal({ isOpen, onClose, title, message, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          width: "350px",
        }}
      >
        <h2>{title}</h2>

        <p>{message}</p>

        {children}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Modal;