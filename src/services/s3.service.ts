import crypto from "node:crypto";
import path from "node:path";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { UploadedFile } from "express-fileupload";

import { configs } from "../configs/config";

export enum EFileType {
  Post = "post",
  User = "user",
}

class S3Service {
  constructor(
    private client = new S3Client({
      region: configs.AWS_S3_REGION,
      credentials: {
        accessKeyId: configs.AWS_S3_ACCESS_KEY,
        secretAccessKey: configs.AWS_S3_SECRET_KEY,
      },
    }),
  ) {}

  public async uploadFile(
    file: UploadedFile,
    itemType: EFileType,
    itemId: string,
  ) {
    const filePath = this.buildFilePath(itemType, itemId, file.name);

    await this.client.send(
      new PutObjectCommand({
        Key: filePath,
        Bucket: configs.AWS_S3_BUCKET_NAME,
        Body: file.data,
        ContentType: file.mimetype,
        ACL: "public-read",
      }),
    );

    return filePath;
  }

  public async deleteFile(filePath: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Key: filePath,
        Bucket: configs.AWS_S3_BUCKET_NAME,
      }),
    );
  }

  private buildFilePath(itemType: EFileType, itemId: string, fileName: string) {
    return `${itemType}/${itemId}/${crypto.randomUUID()}${path.extname(fileName)}`;
  }
}

export const s3Service = new S3Service();
