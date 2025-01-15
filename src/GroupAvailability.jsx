import React from 'react';
import "./GroupAvailability.css";

const data = [
  { available: 0, userCount: 0 },
  { available: 1, userCount: 1 },
  { available: 2, userCount: 3 },
  { available: 2, userCount: 3 },
  { available: 1, userCount: 1 },
  { available: 3, userCount: 3 },
  { available: 2, userCount: 3 },
  { available: 0, userCount: 0 },
  { available: 0, userCount: 0 },
  { available: 0, userCount: 0 },
  { available: 2, userCount: 3 },
  { available: 3, userCount: 3 },
  { available: 4, userCount: 3 },
];

const GroupAvailability = () => {
  return (
    <div className="group-availability">
      <h3>Group Availability</h3>
      {data.map((item, index) => (
        <div
          key={index}
          className={`availability-item ${
            item.available === 0
              ? "light-red"
              : item.available === 1
              ? "red"
              : item.available === 2
              ? "yellow"
              : item.available === 3
              ? "green"
              : "dark-green"
          }`}
        >
          <span className="availability-text">
            {item.available} available
          </span>
          <div className="user-count">
            {typeof item.userCount === "number" && item.userCount > 0
              ? Array(item.userCount)
                  .fill(0)
                  .map((_, i) => <span key={i} className="user-icon" />)
              : typeof item.userCount === "string"
              ? item.userCount
              : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupAvailability;