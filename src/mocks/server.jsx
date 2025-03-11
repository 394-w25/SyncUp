import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getGoogleCalendarEvents } from '../services/googleCalender';

const startDate = new Date();
const endDate = new Date();
endDate.setDate(endDate.getDate() + 1);

const handlers = [
  getGoogleCalendarEvents(startDate, endDate), (info) => {
    return info.res(
      http.response(
        new HttpResponse(200, 'OK', {
          events: [
            {
              title: 'Test Event',
              start: new Date(),
              end: new Date(),
              isGoogleCalEvent: true,
              googleCalEventId: '12345',
              lastSync: new Date()
            }
          ]
        })
      )
    );
  }
];

export const server = setupServer(...handlers);