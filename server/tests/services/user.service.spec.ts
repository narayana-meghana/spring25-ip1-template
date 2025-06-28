import UserModel from '../../models/users.model';
import {
  deleteUserByUsername,
  getUserByUsername,
  loginUser,
  saveUser,
  updateUser,
  resetPassword,
} from '../../services/user.service';
import { SafeUser, User, UserCredentials } from '../../types/user';
import { user, safeUser } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved user', async () => {
      mockingoose(UserModel).toReturn(user, 'create');

      const savedUser = (await saveUser(user)) as SafeUser;

      expect(savedUser.username).toEqual(user.username);
      expect(savedUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should return error if save fails', async () => {
      jest.spyOn(UserModel, 'create').mockRejectedValue(new Error('Duplicate key'));

      const result = await saveUser(user);
      expect('error' in result).toBe(true);

      jest.restoreAllMocks();
    });
  });
});

describe('getUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the matching user', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');

    const retrievedUser = (await getUserByUsername(user.username)) as SafeUser;

    expect(retrievedUser.username).toEqual(user.username);
    expect(retrievedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should return error if user is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const result = await getUserByUsername('nouser');
    expect('error' in result).toBe(true);
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the user if authentication succeeds', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');

    const credentials: UserCredentials = {
      username: user.username,
      password: user.password,
    };

    const loggedInUser = (await loginUser(credentials)) as SafeUser;

    expect(loggedInUser.username).toEqual(user.username);
    expect(loggedInUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should return error if credentials are wrong', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const result = await loginUser({ username: 'user1', password: 'wrong' });
    expect('error' in result).toBe(true);
  });
});

describe('deleteUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the deleted user when deleted succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');

    const deletedUser = (await deleteUserByUsername(user.username)) as SafeUser;

    expect(deletedUser.username).toEqual(user.username);
    expect(deletedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should return error if user does not exist for delete', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndDelete');

    const result = await deleteUserByUsername('nouser');
    expect('error' in result).toBe(true);
  });
});

describe('updateUser', () => {
  const updatedUser: User = {
    ...user,
    password: 'newPassword',
  };

  const safeUpdatedUser: SafeUser = {
    username: user.username,
    dateJoined: user.dateJoined,
  };

  const updates: Partial<User> = {
    password: 'newPassword',
  };

  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the updated user when updated succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUpdatedUser, 'findOneAndUpdate');

    const result = (await updateUser(user.username, updates)) as SafeUser;

    expect(result.username).toEqual(user.username);
    expect(result.username).toEqual(updatedUser.username);
    expect(result.dateJoined).toEqual(user.dateJoined);
    expect(result.dateJoined).toEqual(updatedUser.dateJoined);
  });

  it('should return error if user does not exist for update', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const result = await updateUser('nouser', { password: 'newpass' });
    expect('error' in result).toBe(true);
  });
});

describe('resetPassword', () => {
  const newPassword = 'updatedPassword';

  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the updated user when password reset succeeds', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOneAndUpdate');

    const result = (await resetPassword(user.username, newPassword)) as SafeUser;

    expect(result.username).toEqual(user.username);
    expect(result.dateJoined).toEqual(user.dateJoined);
  });

  it('should return error if user is not found during password reset', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const result = await resetPassword('nouser', newPassword);

    expect('error' in result).toBe(true);
  });
});
