import * as FileSystem from "expo-file-system";

// Expo SDK 54 type definitions workaround
const FS = FileSystem as typeof FileSystem & {
  documentDirectory: string | null;
  EncodingType: { UTF8: string };
  writeAsStringAsync: (
    fileUri: string,
    contents: string,
    options?: { encoding?: string }
  ) => Promise<void>;
};

export const getDocumentDirectory = (): string => {
  return FS.documentDirectory || "";
};

export const writeFile = async (
  fileName: string,
  content: string
): Promise<string> => {
  const filePath = getDocumentDirectory() + fileName;
  await FS.writeAsStringAsync(filePath, content, {
    encoding: FS.EncodingType.UTF8,
  });
  return filePath;
};
