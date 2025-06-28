import MessageModel from '../models/messages.model';
import { Message, MessageResponse } from '../types/types';

/**
 * Saves a new message to the database.
 *
 * @param {Message} message - The message to save
 *
 * @returns {Promise<MessageResponse>} - The saved message or an error message
 */
export const saveMessage = async (message: Message): Promise<MessageResponse> => {
  try {
    const created = await MessageModel.create(message);
    return {
      _id: created._id,
      msg: created.msg,
      msgFrom: created.msgFrom,
      msgDateTime: created.msgDateTime,
    };
  } catch (error) {
    return { error: `Failed to save message` };
  }
};

/**
 * Retrieves all messages from the database, sorted by date in ascending order.
 *
 * @returns {Promise<Message[]>} - An array of messages. If an error occurs, an empty array is returned.
 */
export const getMessages = async (): Promise<Message[]> => {
  try {
    const messages = await MessageModel.find().sort({ msgDateTime: 1 });
    return messages.map(msgDoc => ({
      _id: msgDoc._id,
      msg: msgDoc.msg,
      msgFrom: msgDoc.msgFrom,
      msgDateTime: msgDoc.msgDateTime,
    }));
  } catch (err) {
    return [];
  }
};
