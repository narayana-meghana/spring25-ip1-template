import UserModel from '../models/users.model';
import { SafeUser, User, UserCredentials, UserResponse } from '../types/types';

/**
 * Saves a new user to the database.
 *
 * @param {User} user - The user object to be saved, containing user details like username, password, etc.
 * @returns {Promise<UserResponse>} - Resolves with the saved user object (without the password) or an error message.
 */
export const saveUser = async (user: User): Promise<UserResponse> => {
  try {
    const createdUser = await UserModel.create(user);
    return {
      username: createdUser.username,
      dateJoined: createdUser.dateJoined,
    };
  } catch (error) {
    return { error: `Failed to save user` };
  }
};

/**
 * Retrieves a user from the database by their username.
 *
 * @param {string} username - The username of the user to find.
 * @returns {Promise<UserResponse>} - Resolves with the found user object (without the password) or an error message.
 */
export const getUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({ username });
    if (!user) return { error: 'User not found' };

    return {
      username: user.username,
      dateJoined: user.dateJoined,
    };
  } catch (error) {
    return { error: `Error fetching user` };
  }
};

/**
 * Authenticates a user by verifying their username and password.
 *
 * @param {UserCredentials} loginCredentials - An object containing the username and password.
 * @returns {Promise<UserResponse>} - Resolves with the authenticated user object (without the password) or an error message.
 */
export const loginUser = async (loginCredentials: UserCredentials): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({
      username: loginCredentials.username,
      password: loginCredentials.password,
    });

    if (!user) return { error: 'Invalid username or password' };

    return {
      username: user.username,
      dateJoined: user.dateJoined,
    };
  } catch (error) {
    return { error: `Login failed` };
  }
};

/**
 * Deletes a user from the database by their username.
 *
 * @param {string} username - The username of the user to delete.
 * @returns {Promise<UserResponse>} - Resolves with the deleted user object (without the password) or an error message.
 */
export const deleteUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const deletedUser = await UserModel.findOneAndDelete({ username });

    if (!deletedUser) return { error: 'User not found' };

    return {
      username: deletedUser.username,
      dateJoined: deletedUser.dateJoined,
    };
  } catch (error) {
    return { error: `Failed to delete user` };
  }
};

/**
 * Updates user information in the database.
 *
 * @param {string} username - The username of the user to update.
 * @param {Partial<User>} updates - An object containing the fields to update and their new values.
 * @returns {Promise<UserResponse>} - Resolves with the updated user object (without the password) or an error message.
 */
export const updateUser = async (
  username: string,
  updates: Partial<User>,
): Promise<UserResponse> => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate({ username }, updates, { new: true });

    if (!updatedUser) return { error: 'User not found' };

    return {
      username: updatedUser.username,
      dateJoined: updatedUser.dateJoined,
    };
  } catch (error) {
    return { error: `Failed to update user` };
  }
};

/**
 * Updates a user's password.
 *
 * @param username - The username of the user whose password is being reset
 * @param newPassword - The new password to set
 * @returns The updated user object or an error
 */
export const resetPassword = async (
  username: string,
  newPassword: string,
): Promise<SafeUser | { error: string }> => {
  try {
    const updated = await UserModel.findOneAndUpdate(
      { username },
      { password: newPassword },
      { new: true },
    );

    if (!updated) {
      return { error: 'User not found' };
    }

    return {
      username: updated.username,
      dateJoined: updated.dateJoined,
    };
  } catch (error) {
    return { error: `Failed to reset password` };
  }
};
