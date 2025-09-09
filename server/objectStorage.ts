import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";


// Use environment variables for Google Cloud Storage configuration
export const objectStorageClient = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME || "default-bucket";
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    contentType: string
  ): Promise<string> {
    try {
      const bucket = objectStorageClient.bucket(this.bucketName);
      const file = bucket.file(filename);

      await file.save(fileBuffer, {
        metadata: { contentType },
        resumable: false,
      });

      // Make the file publicly readable
      await file.makePublic();

      return `https://storage.googleapis.com/${this.bucketName}/${filename}`;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async getFile(filename: string): Promise<File> {
    const bucket = objectStorageClient.bucket(this.bucketName);
    const file = bucket.file(filename);

    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }

    return file;
  }

  async getSignedUrl(filename: string): Promise<string> {
    try {
      const bucket = objectStorageClient.bucket(this.bucketName);
      const file = bucket.file(filename);

      const [exists] = await file.exists();
      if (!exists) {
        throw new ObjectNotFoundError();
      }

      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      return url;
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        throw error;
      }
      console.error("Error generating signed URL:", error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const bucket = objectStorageClient.bucket(this.bucketName);
      const file = bucket.file(filename);

      const [exists] = await file.exists();
      if (!exists) {
        throw new ObjectNotFoundError();
      }

      await file.delete();
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        throw error;
      }
      console.error("Error deleting file:", error);
      throw error;
    }
  }
}