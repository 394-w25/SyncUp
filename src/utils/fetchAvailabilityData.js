import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchAvailabilityData = async () => {
  const querySnapshot = await getDocs(collection(db, "availability"));
  const data = querySnapshot.docs.map(doc => doc.data());
  console.log("Fetched availability data:", data); // Log the fetched data
  return data;
};