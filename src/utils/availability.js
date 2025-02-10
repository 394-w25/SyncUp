import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from '../firebase';

export const calculateAvailability = (events, userId, startHour = 8, endHour = 18, intervalMins = 15) => {
  const availabilityByDate = {};

  // Helper function to convert fractional hours into a time string
  const formatTime = (date, fractionalHour) => {
    const hours = Math.floor(fractionalHour);
    const minutes = Math.round((fractionalHour % 1) * 60);
    const formattedDate = new Date(date);
    formattedDate.setHours(hours, minutes, 0, 0); // Set hours and minutes
    return formattedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Helper function to calculate interval-based slots available
  const calculateIntervals = (slots, startHour, endHour, intervalMins) => {
    const numIntervals = Math.floor(((endHour - startHour) * 60) / intervalMins);
    const data = Array(numIntervals).fill(1);

    slots.forEach((slot) => {
      const startIndex = Math.floor(((slot.start - startHour) * 60) / intervalMins);
      const endIndex = Math.ceil(((slot.end - startHour) * 60) / intervalMins);

      for (let i = startIndex; i < endIndex; i++) {
        data[i] = 0; // mark as unavailable
      }
    });

    return { intervalMins, data };
  };

  // Group events by date and calculate availability
  events.forEach((event) => {
    const eventDate = new Date(event.start.dateTime);
    if (isNaN(eventDate.getTime())) {
      console.warn("Invalid date for event:", event.start.dateTime);
      return; // Skip this event if the date is invalid
    }
    const eventDateString = eventDate.toISOString().split("T")[0];

    if (!availabilityByDate[eventDate]) {
      availabilityByDate[eventDate] = [{ start: startHour, end: endHour }];
    }

    const eventStart = new Date(event.start.dateTime).getHours() + new Date(event.start.dateTime).getMinutes() / 60;
    const eventEnd = new Date(event.end.dateTime).getHours() + new Date(event.end.dateTime).getMinutes() / 60;

    availabilityByDate[eventDate] = availabilityByDate[eventDate].flatMap((slot) => {
      const { start, end } = slot;

      // No overlap
      if (eventEnd <= start || eventStart >= end) {
        return [slot];
      }

      // Overlap
      const newSlots = [];
      if (eventStart > start) {
        newSlots.push({ start, end: eventStart });
      }
      if (eventEnd < end) {
        newSlots.push({ start: eventEnd, end });
      }

      return newSlots;
    });
  });

  // Create a single document for the user
  const availabilityCollection = {};

  Object.entries(availabilityByDate).forEach(([date, slots]) => {
    const data = calculateIntervals(slots, startHour, endHour, intervalMins);

    availabilityCollection[date] = {
      date: date,
      startTime: Timestamp.fromMillis(new Date(date).setHours(startHour, 0, 0, 0)),
      endTime: Timestamp.fromMillis(new Date(date).setHours(endHour, 0, 0, 0)),
      intervalMins,
      data,
    };
  });

  // Write the availability collection to Firestore
  const writeAvailabilityToFirestore = async (userId, availabilityCollection) => {
    const docId = userId;
    const availabilityDoc = {
      userId,
      availability: availabilityCollection,
    };

    try {
      await setDoc(doc(db, "availability", docId), availabilityDoc);
      // console.log("Availability written to Firestore:", availabilityDoc);
    } catch (error) {
      console.error("Error writing availability to Firestore:", error);
    }
  };

  writeAvailabilityToFirestore(userId, availabilityCollection);
};