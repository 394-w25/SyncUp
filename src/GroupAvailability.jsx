import React from 'react';
import "./GroupAvailability.css";

// groupAvailability: {
//   groupId_date: {  // Composite key
//     groupId: string,
//     date: timestamp,
//     slots: [{
//       start: timestamp,
//       end: timestamp,
//       availableUsers: [userId1, userId2, ...],
//       count: number  // Number of available users
//     }],
//     lastUpdate: timestamp
//   }

const data = [
  { available: 0},
  { available: 1},
  { available: 2},
  { available: 2},
  { available: 1},
  { available: 3},
  { available: 2},
  { available: 0},
  { available: 0},
  { available: 0},
  { available: 2},
  { available: 3},
  { available: 4},
];

const numUsers = 4;

const GroupAvailability = () => {
  return (
    <div className="group-availability">
      <h3>Group Availability</h3>
      {data.map((item, index) => (
        <div
          key={index}
          className={`availability-item ${
              item.available / numUsers < 0.2
              ? "very-low-availability"
              : item.available / numUsers < 0.4
              ? "low-availability"
              : item.available / numUsers < 0.6
              ? "med-availability"
              : item.available / numUsers < 1
              ? "high-availability"
              : "full-availability"
          }`}
        >
          <span className="availability-text">
            {item.available} available
          </span>
          {/* <div className="user-count">
            {typeof item.userCount === "number" && item.userCount > 0
              ? Array(item.userCount)
                  .fill(0)
                  .map((_, i) => <span key={i} className="user-icon" />)
              : typeof item.userCount === "string"
              ? item.userCount
              : null}
          </div> */}
        </div>
      ))}
    </div>
  );
};

export default GroupAvailability;