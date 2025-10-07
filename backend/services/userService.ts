import { RouterContext } from '../dependencies.ts';
import { Database } from '../db/crud.ts';
import { bcrypt } from '../dependencies.ts';
import { generateToken, blacklistToken } from "../util/jwt.ts";

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

      const saltRoundsString = "10";
      const saltRounds = parseInt(saltRoundsString);
      const salt = await bcrypt.genSalt(saltRounds);
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = await db.createUser({
        name,
        email,
        passwordHash,
      });

      try {
        const tempUser = { id: newUser, name, email } as any;
        const token = await generateToken(tempUser);
        await blacklistToken(token, newUser);
      } catch (e) {
        console.warn('Failed to generate/blacklist token for new user', e);
      }

      ctx.response.status = 201; // Created
      ctx.response.body = { message: 'User registered successfully!', newUser };
      } catch (error) {
        console.error('Registration error:', error);
        ctx.response.status = 500;
        ctx.response.body = { message: 'An unexpected error occurred during registration.' };
      }
    }

  public static async login(ctx: RouterContext<string>) {
    try {
      const db = new Database();
      const body = ctx.request.body;
      const jsonData = await body.json();

      const email = jsonData.email?.trim();
      const password = jsonData.password;

      if (!email || !password) {
        ctx.response.status = 400;
        ctx.response.body = { message: 'Email and password are required.' };
        return;
      }

      const userFromDb = await db.findUserByEmail(email);

      if (!userFromDb) {
        ctx.response.status = 401; // Unauthorized
        ctx.response.body = { message: 'Invalid email or password.' };
        return;
      }

      const passwordMatches = userFromDb ? await bcrypt.compare(password, userFromDb.passwordHash) : false;

      if (!passwordMatches) {
        ctx.response.status = 401; // Unauthorized
        ctx.response.body = { message: 'Invalid email or password.' };
        return;
      }

      const userResponse = {
        id: userFromDb.id,
        name: userFromDb.name,
        email: userFromDb.email, 
      };

      ctx.response.status = 200; // OK
      const token = await generateToken(userFromDb);
      ctx.response.body = {
        message: 'Login successful!',
        token,
        user: userResponse,
      };

    } catch (error) {
      console.error('Login failed:', error);
      ctx.response.status = 500;
      ctx.response.body = { message: 'An internal server error occurred.' };
    }
  }

  public static async logout(ctx: RouterContext<string>) {
    try {
      const auth = ctx.request.headers.get('Authorization') || '';
      let token: string | null = null;
      const parts = auth.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      } else {
        // fallback to body
        const body = ctx.request.body;
        const data = await body.json().catch(() => null);
        token = data?.token ?? null;
      }

      if (!token) {
        ctx.response.status = 400;
        ctx.response.body = { message: 'No token provided for logout' };
        return;
      }

      await blacklistToken(token);
      ctx.response.status = 200;
      ctx.response.body = { success: true };
    } catch (err) {
      console.error('Logout failed:', err);
      ctx.response.status = 500;
      ctx.response.body = { success: false, message: 'Logout failed' };
    }
  }

  // Check auth endpoint: verifies token and blacklist status
  public static async checkAuth(ctx: any) {
    try {
      const auth = ctx.request.headers.get('Authorization') || '';
      const parts = auth.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        ctx.response.status = 401;
        ctx.response.body = { allowed: false, message: 'Missing Authorization header' };
        return;
      }

      const token = parts[1];
      const { verifyToken, isTokenBlacklisted } = await import('../util/jwt.ts');
      const result = await verifyToken(token);
      if (!result.valid) {
        ctx.response.status = 401;
        ctx.response.body = { allowed: false, message: 'Invalid token' };
        return;
      }

      const userId = result.payload?.id;
      // user with id '1' is whitelisted
      if (userId !== '1') {
        const blacklistedToken = await isTokenBlacklisted(token);
        const { Database } = await import('../db/crud.ts');
        const db = new Database();
        const blacklistedUser = await db.isUserBlacklisted(String(userId));
        if (blacklistedToken || blacklistedUser) {
          ctx.response.status = 401;
          ctx.response.body = { allowed: false, message: 'Token is blacklisted or user is blacklisted' };
          return;
        }
      }

      ctx.response.status = 200;
      ctx.response.body = { allowed: true, user: result.payload };
    } catch (err) {
      console.error('checkAuth failed', err);
      ctx.response.status = 500;
      ctx.response.body = { allowed: false, message: 'Internal error' };
    }
  }
}

export default UserService;
