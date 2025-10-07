import { RouterContext } from '../dependencies.ts';
import { Database } from '../db/crud.ts';
import { bcrypt } from '../dependencies.ts';

class UserService {
  public static async register(ctx: RouterContext<string>) {
    try {
      const db = new Database();
      const body = ctx.request.body;

      const jsonData = await body.json();
      console.log('Register payload received:', jsonData);

      const nameRaw = jsonData.name ?? jsonData.username;
      const name = typeof nameRaw === 'string' ? nameRaw.trim() : undefined;
      const emailRaw = jsonData.email;
      const email = typeof emailRaw === 'string' ? emailRaw.trim() : undefined;
      const passwordEntry = jsonData.password;
      const password = typeof passwordEntry === 'string' ? passwordEntry : undefined;
      if (!name || !email || !password) {
        ctx.response.status = 400; // Bad Request
        ctx.response.body = { message: 'Name, email, and password are required.' };
        return;
      }

      const existingUser = await db.findUserByEmail(email as string);
      if (existingUser) {
        ctx.response.status = 409;
        ctx.response.body = { message: 'A user with this email already exists.' };
        return;
      }

      const passwordHash = await bcrypt.hash(password); //TODO: add salt
      const newUser = await db.createUser({
        name,
        email,
        passwordHash,
      });

      ctx.response.status = 201; // Created
      ctx.response.body = { message: 'User registered successfully!', newUser };
      } catch (error) {
        console.error('Registration error:', error);
        ctx.response.status = 500;
        ctx.response.body = { message: 'An unexpected error occurred during registration.' };
      }
    }

  public static async login(ctx: RouterContext<string>): Promise<{ success: boolean; token?: string; userName?: string; error?: string }> {
    try {
      const db = new Database();
      const body = ctx.request.body;

      const jsonData = await body.json();
      console.log('Login payload received:', jsonData);

      const emailRaw = jsonData.email;
      const email = typeof emailRaw === 'string' ? emailRaw.trim() : undefined;
      const passwordEntry = jsonData.password;
      const password = typeof passwordEntry === 'string' ? passwordEntry : undefined;


      const user = await db.findUserByEmail(email);
      if (!user) {
        ctx.response.status = 401;
        return { success: false, error: 'Invalid email or password.' };
      }
      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        ctx.response.status = 401;
        return { success: false, error: 'Invalid email or password.' };
      }
      ctx.response.status = 200;
      ctx.response.body = { success: true, token: 'some-jwt-token', userName: user.name };
      return { success: true, token: 'some-jwt-token', userName: user.name };

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
