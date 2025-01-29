import { collection, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchGroupData = async (groupId) => {
    const docRef = doc(db, "groups", groupId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        console.log("No such document!");
        alert("Invalid Group!");
    }
    return docSnap.data();
}