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
}

export default MainService;
