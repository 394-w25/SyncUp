import { db } from '../firebase.config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const addParticipantToGroup = async (groupId, participant) => {
    if (!groupId) return;
    const groupRef = doc(db, 'groups', groupId);

    await updateDoc(groupRef, {
        participants: arrayUnion(participant)
    });
};