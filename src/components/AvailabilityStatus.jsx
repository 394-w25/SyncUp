import React from 'react';
import './AvailabilityStatus.css';
const AvailabilityStatus = () => {
  return (
    <div className="availability-status">
      <div className="status-box">
        <div className="status-item">
          <div className="avatar neutral"></div>
          <span className="status-text">Your events</span>
        </div>
        <div className="status-item">
          <div className="avatar blue"></div>
          <span className="status-text">Your availability</span>
        </div>
        <div className="status-item">
          <div className="avatar gradient"></div>
          <div className="status-text-container">
            <span className="status-text">0/4 available</span>
            <span className="status-text">4/4 available</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AvailabilityStatus;