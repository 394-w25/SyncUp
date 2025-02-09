import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function fetchGroupData(groupId) {
    if (!groupId) return;
    const docRef = doc(db, "groups", groupId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        console.error("No such document!");
        alert("Invalid Group! Check the URL and try again.");
    }
    return docSnap.data();
}

export async function fetchGroupAvailability(groupData) {
    const groupAvailabilityData = {};  
    const data = {};
    const querySnapshot = await getDocs(collection(db, "availability"));
    // console.log('group data: ', groupData);

    querySnapshot.forEach((doc) => {
      // console.log(doc.data());
      const userID = doc.id;
      if (groupData.participants && groupData.participants.includes(userID)) {
        for (const dateStr in doc.data()) {
          const slots = doc.data()[dateStr]['data'];
          if (slots === undefined) continue;

          const compressedSlots = [];
          for (let i = 0; i < slots.length; i += 2) {
            const group = slots.slice(i, i + 2);
            compressedSlots.push(group.every(slot => slot === 1) ? 1 : 0);
          }

          if (dateStr in data) {
            data[dateStr] = data[dateStr].map((num, index) => num + compressedSlots[index]);
          } else {
            data[dateStr] = compressedSlots;
          }
        }}
      })
      
    groupAvailabilityData['intervalMins'] = 30;
    groupAvailabilityData['data'] = data;
    groupAvailabilityData['numMembers'] = groupData.participants.length;
    groupAvailabilityData['startTime'] = groupData.proposedStart;
    
    return groupAvailabilityData;
}

export async function fetchUserDataInGroup(participants) {
  const data = {};
  const querySnapshot = await getDocs(collection(db, "users"));

  for (const userId of participants) {
    querySnapshot.forEach((doc) => {
      if (doc.id === userId) {
        data[userId] = doc.data();
      }
    });
  }

  return data;
}