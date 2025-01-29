import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function fetchGroupAvailabilityData(groupData) {
    const data = {};
    const querySnapshot = await getDocs(collection(db, "availability"));

    querySnapshot.forEach((doc) => {
      const userID = doc.id;
      if (groupData.memberIds.includes(userID)) {
        for (const date in doc.data()) {
          const slots = doc.data()[date]['data'];
          if (slots === undefined) continue;

          const compressedSlots = [];
          for (let i = 0; i < slots.length; i += 2) {
            const group = slots.slice(i, i + 2);
            compressedSlots.push(group.every(slot => slot === 1) ? 1 : 0);
          }

          if (date in data) {
            data[date] = data[date].map((num, index) => num + compressedSlots[index]);
          } else {
            data[date] = compressedSlots;
          }
        }}
    })
    return data;
}