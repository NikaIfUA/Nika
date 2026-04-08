import { RouterContext } from "../dependencies.ts";
import { STORAGE_PATH } from "../env.ts";
import InfoTreeService from "./infoTreeService.ts";

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

  public static async fetchInfoTree({ response }: RouterContext<string>): Promise<void> {
    try {
      const payload = await InfoTreeService.getInfoTree();
      response.status = 200;
      response.body = payload;
    } catch (err) {
      console.error("fetchInfoTree error:", err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      response.status = 500;
      response.body = { error: "Unable to fetch info tree", message: errorMessage };
    }
  }

  public static async fetchInfoTreeChildren({ response, request }: RouterContext<string>): Promise<void> {
    try {
      const url = request.url;
      const typeParam = url.searchParams.get("type");
      const parentIdParam = url.searchParams.get("parentId");

      if (typeParam !== "material" && typeParam !== "technology") {
        response.status = 400;
        response.body = { error: "Query param 'type' must be 'material' or 'technology'" };
        return;
      }

      const parentId = parentIdParam && parentIdParam !== "null" ? parentIdParam : null;
      const payload = await InfoTreeService.getInfoTreeChildren(typeParam, parentId);
      response.status = 200;
      response.body = payload;
    } catch (err) {
      console.error("fetchInfoTreeChildren error:", err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      response.status = 500;
      response.body = { error: "Unable to fetch info tree children", message: errorMessage };
    }
  }
}

export default MainService;
