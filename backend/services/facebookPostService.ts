import { RouterContext } from '../dependencies.ts';
import {
  createFacebookPost,
  getFacebookPosts,
  updateFacebookPost,
  deleteFacebookPost
} from '../db/crud/facebookPostCrud.ts';

class FacebookPostService {
  public static async saveFacebookPost({ request, response }: RouterContext<string>): Promise<void> {
    try {
      const body = await request.body.json();
      const { title, embed_html, position } = body;

      if (!embed_html || !embed_html.trim()) {
        response.status = 400;
        response.body = { error: 'embed_html is required' };
        return;
      }

      const newPost = await createFacebookPost({
        id: globalThis.crypto.randomUUID(),
        title: title?.trim() || undefined,
        embed_html: embed_html.trim(),
        position: position ?? 0,
      });

      response.status = 201;
      response.body = newPost;
    } catch (err) {
      console.error('saveFacebookPost error:', err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      response.status = 500;
      response.body = { error: 'Unable to save facebook post', details: errorMessage };
    }
  }

  public static async getFacebookPosts({ response }: RouterContext<string>): Promise<void> {
    try {
      const posts = await getFacebookPosts();
      response.body = posts;
    } catch (err) {
      console.error('getFacebookPosts error:', err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      if (String(errorMessage).includes('relation') && String(errorMessage).includes('does not exist')) {
        response.status = 200;
        response.body = [];
        return;
      }
      response.status = 500;
      response.body = { error: 'Internal Server Error', message: errorMessage };
    }
  }

  public static async updateFacebookPost({ params, request, response }: RouterContext<string>): Promise<void> {
    try {
      const postId = params.id;
      const body = await request.body.json();
      const { title, embed_html, position } = body;

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title?.trim() || null;
      if (embed_html !== undefined) updateData.embed_html = embed_html.trim();
      if (position !== undefined) updateData.position = position;

      const updated = await updateFacebookPost(postId, updateData);

      if (!updated) {
        response.status = 404;
        response.body = { error: 'Facebook post not found' };
        return;
      }

      response.status = 200;
      response.body = updated;
    } catch (err) {
      console.error('updateFacebookPost error:', err);
      response.status = 500;
      response.body = { error: 'Unable to update facebook post' };
    }
  }

  public static async deleteFacebookPost({ params, response }: RouterContext<string>): Promise<void> {
    try {
      const postId = params.id;
      await deleteFacebookPost(postId);
      response.status = 200;
      response.body = { message: 'Facebook post deleted successfully' };
    } catch (err) {
      console.error('deleteFacebookPost error:', err);
      response.status = 500;
      response.body = { error: 'Unable to delete facebook post' };
    }
  }
}

export default FacebookPostService;
