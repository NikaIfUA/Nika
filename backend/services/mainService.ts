import { Database } from "../db/crud.ts";
import { RouterContext } from "../dependencies.ts";
import { STORAGE_PATH } from "../env.ts";

class MainService {
  public static fetchInfo({ response }: RouterContext<string>): void {
    try {
      response.body = "Hello from Deno!";
    } catch (err) {
      console.log(err);
      response.body = "Error: " + err;
    }
  }

  public static async fetchFileContent({ response, params }: RouterContext<string>): Promise<void> {
    try {
      const fileName = params.fileName;
      const fileContent = await Deno.readTextFile(`${STORAGE_PATH}${fileName}`);
      response.body = fileContent;
    } catch (err) {
      console.log(err);
      response.body = "Error: " + err;
    }
  }

  public static async getCategories({ response }: RouterContext<string>): Promise<void> {
    try {
      const db = new Database();
      const categories = await db.getCategories();

      response.body = categories;
    } catch (err) {
      console.log(err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      // If the relation doesn't exist, return empty array instead of 500 so frontend can proceed
      if (String(errorMessage).includes('relation') && String(errorMessage).includes('does not exist')) {
        response.status = 200;
        response.body = [];
        return;
      }
      response.status = 500;
      response.body = { error: "Internal Server Error", message: errorMessage };
    }
  }

  public static async getMaterials({ response }: RouterContext<string>): Promise<void> {
    try {
      const db = new Database();
      const materials = await db.getMaterials();

      response.body = materials;
    } catch (err) {
      console.log(err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      if (String(errorMessage).includes('relation') && String(errorMessage).includes('does not exist')) {
        response.status = 200;
        response.body = [];
        return;
      }
      response.status = 500;
      response.body = { error: "Internal Server Error", message: errorMessage };
    }
  }
}

export default MainService;
