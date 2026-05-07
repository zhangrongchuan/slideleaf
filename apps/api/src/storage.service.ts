import { Injectable, OnModuleInit } from "@nestjs/common";
import { createStorageFromEnv, type ObjectStorage } from "@slideleaf/storage";

@Injectable()
export class StorageService implements OnModuleInit {
  readonly storage: ObjectStorage = createStorageFromEnv();

  async onModuleInit(): Promise<void> {
    await this.storage.ensureBucket?.();
  }
}
