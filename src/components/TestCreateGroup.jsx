import React from 'react';
import { createGroup } from '../utils/makeGroup';
import { Timestamp } from 'firebase/firestore';

const CreateGroupButton = () => {
    const handleCreateGroup = async () => {
        const proposedDays = [
            Timestamp.fromDate(new Date(Date.UTC(2025, 0, 1))), // January 1, 2025
            Timestamp.fromDate(new Date(Date.UTC(2025, 0, 2))), // January 2, 2025
            Timestamp.fromDate(new Date(Date.UTC(2025, 0, 3))), // January 3, 2025
            Timestamp.fromDate(new Date(Date.UTC(2025, 0, 4))), // January 4, 2025
            Timestamp.fromDate(new Date(Date.UTC(2025, 0, 5)))  // January 5, 2025
        ];

        const groupData = {
            title: 'Team Meeting', // Replace with user input
            proposedDays: proposedDays,
            proposedStart: '9:00 AM',
            proposedEnd: '6:00 PM'
        };

        try {
            const groupLink = await createGroup(groupData);
            console.log('Group link:', groupLink);
            
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    return (
        <button onClick={handleCreateGroup}>Create A Group</button>
    );
};
export default CreateGroupButton;