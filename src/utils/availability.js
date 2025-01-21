export const calculateAvailability = (events) => {
  const availabilityByDate = {};

  events.forEach(event => {
    if (!event.start.dateTime || !event.end.dateTime) {
      console.warn('Skipping event without proper start or end time:', event);
      return;
    }

    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);
    const date = eventStart.toISOString().split('T')[0]; // Get date as YYYY-MM-DD

    // Initialize the day's availability
    if (!availabilityByDate[date]) {
      const startOfDay = new Date(date);
      startOfDay.setHours(6, 0, 0, 0); // Start of the day: 6:00 AM
      const endOfDay = new Date(date);
      endOfDay.setHours(12, 0, 0, 0); // End of the day: 12:00 PM
      availabilityByDate[date] = [{ start: startOfDay, end: endOfDay }];
    }

    // Subtract event times from availability
    availabilityByDate[date] = availabilityByDate[date].flatMap(slot => {
      if (eventStart >= slot.end || eventEnd <= slot.start) {
        // No overlap
        return [slot];
      } else if (eventStart <= slot.start && eventEnd >= slot.end) {
        // Event completely covers the slot
        return [];
      } else if (eventStart > slot.start && eventEnd < slot.end) {
        // Event is within the slot
        return [
          { start: slot.start, end: eventStart },
          { start: eventEnd, end: slot.end }
        ];
      } else if (eventStart <= slot.start) {
        // Event overlaps the start of the slot
        return [{ start: eventEnd, end: slot.end }];
      } else {
        // Event overlaps the end of the slot
        return [{ start: slot.start, end: eventStart }];
      }
    });
  });

  // Format the availability slots
  const formattedAvailability = Object.entries(availabilityByDate).map(([date, slots]) => ({
    date,
    slots: slots.map(slot => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
    })),
  }));

  console.log('Calculated availability:', formattedAvailability);
  return formattedAvailability;
};