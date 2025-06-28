import express, { Response, Request } from 'express';
import { FakeSOSocket } from '../types/socket';
import { AddMessageRequest, Message } from '../types/types';
import { saveMessage, getMessages } from '../services/message.service';

const messageController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided message request contains the required fields.
   *
   * @param req The request object containing the message data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isRequestValid = (req: AddMessageRequest): boolean => {
    const m = req.body?.messageToAdd;
    return (
      m !== undefined &&
      typeof m.msgFrom === 'string' &&
      typeof m.msg === 'string' &&
      m.msgFrom.trim().length > 0 &&
      m.msg.trim().length > 0
    );
  };

  /**
   * Validates the structure of a Message object.
   */
  const isMessageValid = (message: Message): boolean =>
    typeof message.msgFrom === 'string' &&
    typeof message.msg === 'string' &&
    message.msgFrom.trim().length > 0 &&
    message.msg.trim().length > 0;

  /**
   * Handles adding a new message. The message is first validated and then saved.
   * If the message is invalid or saving fails, the HTTP response status is updated.
   *
   * @param req The AddMessageRequest object containing the message and chat data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addMessageRoute = async (req: AddMessageRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid message body');
      return;
    }

    const newMessage: Message = {
      ...req.body.messageToAdd,
      msgDateTime: new Date(),
    };

    if (!isMessageValid(newMessage)) {
      res.status(400).send('Invalid message content');
      return;
    }

    const msgFromDb = await saveMessage(newMessage);

    if ('error' in msgFromDb) {
      res.status(500).json(msgFromDb);
    } else {
      socket.emit('messageUpdate', { msg: msgFromDb });
      res.status(200).json(msgFromDb);
    }
  };

  /**
   * Fetch all messages in descending order of their date and time.
   * @param req The request object.
   * @param res The HTTP response object used to send back the messages.
   * @returns A Promise that resolves to void.
   */
  const getMessagesRoute = async (_req: Request, res: Response): Promise<void> => {
    const messages = await getMessages();

    if (Array.isArray(messages)) {
      res.status(200).json(messages);
    } else {
      res.status(500).json(messages); // contains { error: string }
    }
  };

  // Add appropriate HTTP verbs and their endpoints to the router
  router.post('/addMessage', addMessageRoute);
  router.get('/getMessages', getMessagesRoute);

  return router;
};

export default messageController;
