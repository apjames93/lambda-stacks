import method from '../example';
import eventObj from './events/event';
import { constructAPIGwEvent } from '../../../../test-helpers/constructAPIGwEvent';

describe('function', () => {
  describe('success', () => {
    it('should return a 200', async () => {
      const event = constructAPIGwEvent(eventObj());
      const result = await method(event);

      expect(result.statusCode).toBe(200);
    });
  });
});
