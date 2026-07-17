export default function ProgressBar({ percentage }) {
  let color = "green";

  if (percentage >= 90) {
    color = "red";
  } else if (percentage >= 60) {
    color = "orange";
  }

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: "20px",
          background: "#ddd",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: color,
            borderRadius: "10px",
          }}
        ></div>
      </div>

      <p>{percentage.toFixed(0)}%</p>
    </div>
  );
}