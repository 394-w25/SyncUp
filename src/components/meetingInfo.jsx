import React from 'react';

const MeetingInfo = ({ meetingId, event, participants }) => {
  return (
    <div className="p-4 bg-white border border-gray-300 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Meeting Information</h2>
      <p className="text-gray-700"><strong>Meeting ID:</strong> {meetingId}</p>
      <p className="text-gray-700"><strong>Event:</strong> {event}</p>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Participants:</h3>
        {participants.map((participant, index) => (
          <div key={index} className="flex items-center mb-2">
            <img
              src={`https://ui-avatars.com/api/?name=${participant.name}`}
              alt={participant.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-gray-700 mr-2">{participant.name}</span>
            {participant.attending ? (
              <span className="text-green-500">✅</span>
            ) : (
              <span className="text-red-500">❌</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingInfo;