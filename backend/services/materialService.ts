import { RouterContext } from '../dependencies.ts';
import { Database } from '../db/crud.ts';

class MaterialService {
  public static async saveMaterial({ request, response }: RouterContext<string>): Promise<void> {
    try {
      const body = request.body;
      let name = '';
      const type = body.type && typeof body.type === 'function' ? body.type() : undefined;

      if (type === 'form-data') {
        const form = await body.formData();
        const val = form.get('name');
        name = val ? String(val) : '';
      } else {
        const txt = await body.text();
        if (txt) {
          const parsed = JSON.parse(txt);
          name = parsed?.name ? String(parsed.name) : '';
        }
      }

      if (!name || !name.trim()) {
        response.status = 400;
        response.body = { error: 'Material name is required' };
        return;
      }

      const db = new Database();
      const newMaterial = await db.createMaterial({ id: globalThis.crypto.randomUUID(), name: name.trim() });

      response.status = 201;
      response.body = newMaterial;
    } catch (err) {
      console.error('saveMaterial error:', err);
      response.status = 500;
      response.body = { error: 'Unable to save material' };
    }
  }
}

export default MaterialService;
