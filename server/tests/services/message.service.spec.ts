import MessageModel from '../../models/messages.model';
import { getMessages, saveMessage } from '../../services/message.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const message1 = {
  msg: 'Hello',
  msgFrom: 'User1',
  msgDateTime: new Date('2024-06-04'),
};

const message2 = {
  msg: 'Hi',
  msgFrom: 'User2',
  msgDateTime: new Date('2024-06-05'),
};

describe('Message model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveMessage', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved message', async () => {
      mockingoose(MessageModel).toReturn(message1, 'create');

      const savedMessage = await saveMessage(message1);

      expect(savedMessage).toMatchObject(message1);
    });
    it('should return an error when saving fails', async () => {
      mockingoose(MessageModel).toReturn(new Error('Save failed'), 'create');

      const result = await saveMessage(message1);
      expect(result).toHaveProperty('error');
      expect((result as any).error).toContain('Failed to save message');
    });
  });

  describe('getMessages', () => {
    it('should return all messages, sorted by date', async () => {
      mockingoose(MessageModel).toReturn([message2, message1], 'find');

      const messages = await getMessages();

      expect(messages).toMatchObject([message1, message2]);
    });
    it('should return an empty array if fetch fails', async () => {
      mockingoose(MessageModel).toReturn(new Error('Fetch failed'), 'find');

      const messages = await getMessages();
      expect(messages).toEqual([]);
    });
  });
});
