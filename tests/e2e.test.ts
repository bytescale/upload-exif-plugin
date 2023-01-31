import plugin from "upload-exif-plugin";
import { Transformation, FunctionInvocationFilePaths } from "upload-plugin-sdk";
import path from "path";
import { promises as fsAsync } from "fs";

const tmpDirRoot = path.join(__dirname, "../.tmp/tests/e2e");
const tmpDir = path.join(tmpDirRoot, "1");

describe("Extract EXIF from JPEG", () => {
  test("Extract and correctly store Norwegian characters", async () => {
    await beforeTest();
    const inputFile = path.join(__dirname, "assets/norwegian-keywords.jpg");
    const outputFile = await extractMetadata(inputFile);
    const actualContent: string[] = JSON.parse((await fsAsync.readFile(outputFile)).toString()).Keywords;
    const expectedContent = ["bjølsen", "oslo", "sommer", "sushi rose bjølsen"];
    // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
    expect(actualContent.sort()).toEqual(expectedContent.sort());
  });
});

async function extractMetadata(filePath: string): Promise<string> {
  const transformation: Transformation = {
    type: "Transformation",
    definition: {
      transformationId: "exif",
      slug: "exif",
      description: "exif",
      caching: undefined,
      steps: [
        {
          plugin: {
            packageAuthors: ["upload-io"],
            packageVersion: "1.3.0",
            packageName: "upload-exif-plugin"
          },
          params: {}
        }
      ]
    }
  };
  const paths = await makePaths(tmpDir, filePath, "text/plain");
  await plugin({
    transformation,
    step: transformation.definition.steps[0],
    paths,
    estimationResult: { estimation: undefined },
    download: async () => ({} as any),
    type: "TransformationStep",
    previousAsyncSteps: []
  });

  return paths.originalFile;
}

async function beforeTest(): Promise<void> {
  await fsAsync.rm(tmpDirRoot, { recursive: true, force: true });
  await fsAsync.mkdir(tmpDirRoot, { recursive: true });
  await fsAsync.mkdir(tmpDir);
}

async function makePaths(tmpDir: string, filePath: string, filePathMime: string): Promise<FunctionInvocationFilePaths> {
  const paths: FunctionInvocationFilePaths = {
    fileData: {
      apexFileDir: path.join(tmpDir, "data", "apex/"),
      namedFileDir: path.join(tmpDir, "data", "named/")
    },
    fileMetadata: {
      apexFileDir: path.join(tmpDir, "meta", "apex/"),
      namedFileDir: path.join(tmpDir, "meta", "named/")
    },
    originalFile: path.join(tmpDir, "data", "apex", "index")
  };
  await fsAsync.mkdir(paths.fileData.apexFileDir, { recursive: true });
  await fsAsync.mkdir(paths.fileData.namedFileDir, { recursive: true });
  await fsAsync.mkdir(paths.fileMetadata.apexFileDir, { recursive: true });
  await fsAsync.mkdir(paths.fileMetadata.namedFileDir, { recursive: true });

  await fsAsync.copyFile(filePath, paths.originalFile);
  await fsAsync.writeFile(
    path.join(paths.fileMetadata.apexFileDir, "index"),
    JSON.stringify({ contentType: filePathMime })
  );

  return paths;
}
