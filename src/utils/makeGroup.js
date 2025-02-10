import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";


function generateUniqueId() {
    return `${Math.random().toString(36).substring(2, 9)}`;
}

function generateGroupLink(groupId) {
    return `${window.location.origin}/group/${groupId}`;
}

export const createGroup = async (groupData) => {
    const groupId = generateUniqueId();
    const groupLink = generateGroupLink(groupId);

    await setDoc(doc(db, 'groups', groupId), {
        groupId: groupId,
        title: groupData.title || 'Untitled Group',
        proposedDays: groupData.proposedDays || [], 
        proposedStart: groupData.proposedStart,
        proposedEnd: groupData.proposedEnd,
        createdAt: serverTimestamp(),
        creator: groupData.creator || null,
        participants: groupData.participants || [],
    });

    // console.log('Group created:', groupLink);
    return { link: groupLink, id: groupId };
};