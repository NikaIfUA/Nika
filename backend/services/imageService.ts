import { RouterContext } from "../dependencies.ts";
import { STORAGE_PATH, URL } from "../env.ts";
import { IImage } from "../model/IImage.ts";
import { dirname, fromFileUrl, join } from "../dependencies.ts";

class ImageService {
    public static async saveImage(
        fileContent: Uint8Array,
        originalFilename: string,
        altText: string
    ): Promise<IImage> {
        const imageId = globalThis.crypto.randomUUID();
        const fileExtension = originalFilename.split('.').pop() || 'png';
        const filename = `${imageId}.${fileExtension}`;

        const __dirname = dirname(fromFileUrl(import.meta.url));
        const projectRoot = join(__dirname, '..');

        const storageDir = join(projectRoot, 'storage', 'images');
        const filePath = join(storageDir, filename);

        await Deno.mkdir(storageDir, { recursive: true });

        await Deno.writeFile(filePath, fileContent);
        console.log(`Image saved to ${filePath}`);

        const newImage: IImage = {
            id: imageId,
            url: `${URL}${STORAGE_PATH}/images/${filename}`,
            altText: altText,
        };

        return newImage;
    }

    public static async uploadHandler(context: RouterContext<string>) {
        try {
            const body = context.request.body;

            if (body.type() !== "form-data") {
                context.response.status = 415;
                context.response.body = { error: "Request body must be multipart/form-data." };
                return;
            }
            
            const formData = await body.formData();
            const file = formData.get("imageFile") as File | null;
            const altText = formData.get("altText") as string || "No alt text provided";

            if (!file) {
                context.response.status = 400;
                context.response.body = { error: "Image file is missing." };
                return;
            }

            const fileContent = new Uint8Array(await file.arrayBuffer());
            const newImage = await this.saveImage(fileContent, file.name, altText);

            context.response.status = 201;
            context.response.body = newImage;

        } catch (error) {
            console.error("Error during image upload:", error);
            context.response.status = 500;
            context.response.body = { error: "An internal server error occurred." };
        }
    }
}

export default ImageService;