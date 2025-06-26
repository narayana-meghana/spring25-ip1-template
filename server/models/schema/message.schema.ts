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
    msgFrom: { type: String, required: true },
    msg: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'msgDateTime', updatedAt: false },
    collection: 'Message',
  }
);

export default messageSchema;
