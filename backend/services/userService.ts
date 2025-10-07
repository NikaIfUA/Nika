import { IUser } from '../interfaces.ts';
import { RouterContext } from '../dependencies.ts';
import { Database } from '../db/crud.ts';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

class UserService {
  public static async register(ctx: RouterContext<string>) {
    try {
      const db = new Database();
      const body = await ctx.request.body({ type: 'json' }).value;
      const { username, email, password } = body;

      if (!username || !email || !password) {
        ctx.response.status = 400; // Bad Request
        ctx.response.body = { message: 'Username, email, and password are required.' };
        return;
      }

      const existingUser = await db.findUserByEmail(email);
      if (existingUser) {
        ctx.response.status = 409;
        ctx.response.body = { message: 'A user with this email already exists.' };
        return;
      }

      const passwordHash = await bcrypt.hash(password);
      const newUser = await db.createUser({
        id: crypto.randomUUID(),
        username,
        email,
        passwordHash,
      });

      ctx.response.status = 201; // Created
      ctx.response.body = { message: 'User registered successfully!', userId: newUser.id };
    } catch (error) {
      console.error('Registration error:', error);
      ctx.response.status = 500;
      ctx.response.body = { message: 'An unexpected error occurred during registration.' };
    }
  }
  
  async login(credentials: IUser): Promise<{ success: boolean; token?: string; userName?: string; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          token: data.token,
          userName: data.userName,
        };
      } else {
        return { success: false, error: data.message || 'Помилка входу' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Не вдалося підключитися до сервера.' };
    }
  }

  async logout(token: string): Promise<{ success: boolean }> {
    // TODO: Implement user logout logic
    return { success: false };
  }
}

export default UserService;
