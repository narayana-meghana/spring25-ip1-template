import express, { Response, Router } from 'express';
import { UserRequest, User, UserCredentials, UserByUsernameRequest } from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  loginUser,
  saveUser,
  resetPassword
} from '../services/user.service';

const userController = (): Router => {
  const router: Router = express.Router();

  /**
 * Validates that the request body contains all required fields for a user.
 * @param req The incoming request containing user data.
 * @returns `true` if the body contains valid user fields; otherwise, `false`.
 */
  const isUserBodyValid = (req: UserRequest): boolean => {
    const { username, password } = req.body;
    return typeof username === 'string' && typeof password === 'string';
  };


  /**
   * Handles the creation of a new user account.
   * @param req The request containing username, email, and password in the body.
   * @param res The response, either returning the created user or an error.
   * @returns A promise resolving to void.
   */
  const createUser = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).send('Invalid user body');
      return;
    }

    const { username, password } = req.body;

    const result = await saveUser({ username, password, dateJoined: new Date() });

    if ('error' in result) {
      res.status(500).json(result);
    } else {
      res.status(200).json(result);
    }
  };

  /**
    * Handles user login by validating credentials.
    * @param req The request containing username and password in the body.
    * @param res The response, either returning the user or an error.
    * @returns A promise resolving to void.
    */
  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).send('Invalid user body');
      return;
    }

    const { username, password } = req.body;

    const result = await loginUser({ username, password });

    if ('error' in result) {
      res.status(401).json(result);
    } else {
      res.status(200).json(result);
    }
  };

  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    const { username } = req.params;

    const result = await getUserByUsername(username);

    if ('error' in result) {
      res.status(404).json(result);
    } else {
      res.status(200).json(result);
    }
  };

  /**
    * Deletes a user by their username.
    * @param req The request containing the username as a route parameter.
    * @param res The response, either the successfully deleted user object or returning an error.
    * @returns A promise resolving to void.
    */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    const { username } = req.params;

    const result = await deleteUserByUsername(username);

    if ('error' in result) {
      res.status(404).json(result);
    } else {
      res.status(200).json(result);
    }
  };
  
  /**
    * Resets a user's password.
    * @param req The request containing the username and new password in the body.
    * @param res The response, either the successfully updated user object or returning an error.
    * @returns A promise resolving to void.
    */
  const resetPasswordHandler = async (req: UserRequest, res: Response): Promise<void> => {
    const { username, password: newPassword } = req.body;

    if (typeof username !== 'string' || typeof newPassword !== 'string') {
      res.status(400).send('Invalid user body');
      return;
    }

    const result = await resetPassword(username, newPassword); 

    if ('error' in result) {
      res.status(404).json(result);
    } else {
      res.status(200).json(result);
    }
  };  

  // Define routes for the user-related operations.
  router.post('/signup', createUser);
  router.post('/login', userLogin);
  router.get('/getUser/:username', getUser);
  router.delete('/deleteUser/:username', deleteUser);
  router.patch('/resetPassword', resetPasswordHandler);

  return router;
};

export default userController;
