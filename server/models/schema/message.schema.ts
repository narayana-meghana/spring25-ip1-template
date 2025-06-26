import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Message collection.
 *
 * This schema defines the structure of a message in the database.
 * Each message includes the following fields:
 * - `msg`: The text of the message.
 * - `msgFrom`: The username of the user sending the message.
 * - `msgDateTime`: The date and time the message was sent.
 */
const messageSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    text: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'sentAt', updatedAt: false },
    collection: 'Message',
  }
);

export default messageSchema;
