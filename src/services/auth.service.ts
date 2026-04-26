import jwt from 'jsonwebtoken';
import { User, IUser } from '../db/models/User';
import { config } from '../config';
import { AppError } from '../utils/AppError';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: Omit<IUser, 'password'>;
}

const signToken = (userId: string): string =>
  jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });

const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const AuthService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = await User.create(input);
    const token = signToken(user._id.toString());

    return { token, user: sanitizeUser(user) as Omit<IUser, 'password'> };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    // Explicitly select password (was excluded by default)
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user._id.toString());
    return { token, user: sanitizeUser(user) as Omit<IUser, 'password'> };
  },
};
