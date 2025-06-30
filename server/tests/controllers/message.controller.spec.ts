import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as util from '../../services/message.service';

const saveMessageSpy = jest.spyOn(util, 'saveMessage');
const getMessagesSpy = jest.spyOn(util, 'getMessages');

describe('POST /addMessage', () => {
  it('should add a new message', async () => {
    const validId = new mongoose.Types.ObjectId();
    const message = {
      _id: validId,
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
    };

    saveMessageSpy.mockResolvedValue(message);

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: message });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: message._id.toString(),
      msg: message.msg,
      msgFrom: message.msgFrom,
      msgDateTime: message.msgDateTime.toISOString(),
    });
  });

  it('should return bad request error if messageToAdd is missing', async () => {
    const response = await supertest(app).post('/messaging/addMessage').send({});

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return 400 if message has invalid fields', async () => {
    const badMsg = {
      msg: '',
      msgFrom: 'User1',
      msgDateTime: new Date(),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMsg });

    expect(response.status).toBe(400);
  });
  it('should return 500 if saveMessage returns an error', async () => {
    saveMessageSpy.mockResolvedValueOnce({ error: 'Failed to save' });

    const msg = {
      msg: 'Something',
      msgFrom: 'User1',
      msgDateTime: new Date(),
    };

    const response = await supertest(app).post('/messaging/addMessage').send({ messageToAdd: msg });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 if messageToAdd has missing required fields', async () => {
    const incompleteMsg = {
      msg: 'Hello',
      // missing msgFrom and msgDateTime
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: incompleteMsg });

    expect(response.status).toBe(400);
  });

  it('should return 400 if msgFrom is empty', async () => {
    const invalidMsg = {
      msg: 'Hello',
      msgFrom: '',
      msgDateTime: new Date(),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: invalidMsg });

    expect(response.status).toBe(400);
  });

  it('should return 400 if msgDateTime is invalid', async () => {
    const invalidMsg = {
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: 'invalid-date',
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: invalidMsg });

    expect(response.status).toBe(400);
  });

  it('should return 400 if msg is null or undefined', async () => {
    const invalidMsg = {
      msg: null,
      msgFrom: 'User1',
      msgDateTime: new Date(),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: invalidMsg });

    expect(response.status).toBe(400);
  });

  it('should return 400 if msgFrom is null or undefined', async () => {
    const invalidMsg = {
      msg: 'Hello',
      msgFrom: null,
      msgDateTime: new Date(),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: invalidMsg });

    expect(response.status).toBe(400);
  });

  it('should return 400 if msgDateTime is null or undefined', async () => {
    const invalidMsg = {
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: null,
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: invalidMsg });

    expect(response.status).toBe(400);
  });

  it('should return 400 if msg contains only whitespace', async () => {
    const invalidMsg = {
      msg: '   ',
      msgFrom: 'User1',
      msgDateTime: new Date(),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: invalidMsg });

    expect(response.status).toBe(400);
  });

  it('should return 400 if msgFrom contains only whitespace', async () => {
    const invalidMsg = {
      msg: 'Hello',
      msgFrom: '   ',
      msgDateTime: new Date(),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: invalidMsg });

    expect(response.status).toBe(400);
  });
});

describe('GET /getMessages', () => {
  it('should return all messages', async () => {
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

    getMessagesSpy.mockResolvedValue([message1, message2]);

    const response = await supertest(app).get('/messaging/getMessages');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        msg: message1.msg,
        msgFrom: message1.msgFrom,
        msgDateTime: message1.msgDateTime.toISOString(),
      },
      {
        msg: message2.msg,
        msgFrom: message2.msgFrom,
        msgDateTime: message2.msgDateTime.toISOString(),
      },
    ]);
  });

  it('should return empty array when no messages exist', async () => {
    getMessagesSpy.mockResolvedValue([]);

    const response = await supertest(app).get('/messaging/getMessages');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return 500 if getMessages service fails', async () => {
    getMessagesSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app).get('/messaging/getMessages');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('should return messages sorted by date in ascending order', async () => {
    const message1 = {
      msg: 'First message',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-01'),
    };

    const message2 = {
      msg: 'Second message',
      msgFrom: 'User2',
      msgDateTime: new Date('2024-06-02'),
    };

    const message3 = {
      msg: 'Third message',
      msgFrom: 'User3',
      msgDateTime: new Date('2024-06-03'),
    };

    getMessagesSpy.mockResolvedValue([message1, message2, message3]);

    const response = await supertest(app).get('/messaging/getMessages');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(new Date(response.body[0].msgDateTime)).toEqual(message1.msgDateTime);
    expect(new Date(response.body[1].msgDateTime)).toEqual(message2.msgDateTime);
    expect(new Date(response.body[2].msgDateTime)).toEqual(message3.msgDateTime);
  });

  it('should handle messages with same timestamp', async () => {
    const sameDate = new Date('2024-06-04');
    const message1 = {
      msg: 'First message',
      msgFrom: 'User1',
      msgDateTime: sameDate,
    };

    const message2 = {
      msg: 'Second message',
      msgFrom: 'User2',
      msgDateTime: sameDate,
    };

    getMessagesSpy.mockResolvedValue([message1, message2]);

    const response = await supertest(app).get('/messaging/getMessages');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].msg).toBe('First message');
    expect(response.body[1].msg).toBe('Second message');
  });
});

afterEach(() => {
  jest.clearAllMocks();
});