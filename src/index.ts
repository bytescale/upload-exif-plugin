import { Params } from "upload-exif-plugin/types/Params";
import { transform } from "upload-plugin-sdk";
import exifr from "exifr";
import { promises as fsAsync } from "fs";

export default transform<Params>({
  run: async ({ resolve, setMetadata }) => {
    const originalFilePath = resolve("/");
    try {
      const imageMetadata = await exifr.parse(originalFilePath, true as any);
      const imageMetadataJson = JSON.stringify(imageMetadata, (_k, value) => {
        const isBuffer = Buffer.isBuffer(value) || ArrayBuffer.isView(value);
        return isBuffer ? undefined : value;
      });
      await fsAsync.writeFile(originalFilePath, imageMetadataJson);
      await setMetadata("/", {
        contentType: "application/json"
      });
    } catch (e) {
      throw new Error(`Unable to extract EXIF from image: ${(e as Error).message}`);
    }
  }
});
