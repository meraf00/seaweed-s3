export type FileInfo = {
  bucketName?: string;
  filepath?: string;
  contentType?: string;
  orginalname?: string;
};

export abstract class S3Client {
  abstract presignedPutObject(
    bucketName: string,
    objectName: string,
    contentType: string,
    duration: number,
  ): Promise<string>;

  abstract presignedGetObject(
    bucketName: string,
    objectName: string,
    contentType: string,
    duration: number,
  ): Promise<string>;

  abstract deleteObject(bucketName: string, objectName: string): Promise<void>;

  abstract getObject(fileInfo: FileInfo);

  abstract putObject(
    bucketName: string,
    objectName: string,
    data: any,
  ): Promise<void>;
}
