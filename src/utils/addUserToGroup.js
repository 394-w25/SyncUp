import { db } from '../firebase.config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const addParticipantToGroup = async (groupId, participant) => {
    const groupRef = doc(db, 'groups', groupId);

    await updateDoc(groupRef, {
        participants: arrayUnion(participant)
    });

    // console.log('Participant added to group:', groupId);
    // console.log('Participant:', participant);
};