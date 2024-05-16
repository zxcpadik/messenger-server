import { generate as randomString } from "randomstring";
import { Meta } from "../entities/file-meta";
import { MetaRepo } from "./db-service";
import { Express } from "express";
import { TokenManager } from "./auth-service";
import { UploadFileResultCode } from "../declarations/enums";
import * as fs from 'node:fs'
import path from "node:path";
import { MD5 } from '../utils/hash-file'



export module StorageService {
  function storagePath(descriptor?: string): string {
    return path.join(__dirname, 'storage', ...(descriptor ? [descriptor] : []));
  }
  async function createDescriptor(userid: number, type: string) {
    let m = new Meta();
    m.owner = userid;
    m.type = type;
    m.descriptor = randomString(32);

    return (await MetaRepo.save(m)).descriptor;
  }

  export async function DownloadFile(token?: string, descriptor?: string) {

  }

  export async function UploadFile(token?: string, descriptor?: string, temppath?: string, hash?: string) {
    try {
      if (token == undefined || descriptor == undefined || temppath == undefined || hash == undefined) return new UploadFileResult(false, UploadFileResultCode.NullParameter);

      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new UploadFileResult(false, UploadFileResultCode.NoAuth);
      
      let meta = await MetaRepo.findOneBy({ descriptor: descriptor });
      if (meta == null) return new UploadFileResult(false, UploadFileResultCode.NoDescriptor);
      if (meta.size != -1) return new UploadFileResult(false, UploadFileResultCode.AlreadyUpload);
  
      let stat = fs.statSync(temppath);
      if ((stat.size / 1048576) > 128) return new UploadFileResult(false, UploadFileResultCode.TooLarge);
  
      let path = storagePath(meta.descriptor);
      fs.copyFileSync(temppath, storagePath(meta.descriptor));
      let _hash = await MD5(path);
      if (!_hash) return new UploadFileResult(false, UploadFileResultCode.InternalError);
      if (_hash !== hash) return new UploadFileResult(false, UploadFileResultCode.HashNotSame);
  
      return new UploadFileResult(true, UploadFileResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] StorageService::UploadFile\n${err}`);
      return new UploadFileResult(false, UploadFileResultCode.InternalError);
    }
  }

  export async function RemoveFile(descriptor?: string) {

  }
}


export class UploadFileResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}

export class DownloadFileResult {
  public ok: boolean;
  public status: number;
  public _filepath?: string;

  constructor (ok: boolean, status: number, _filepath?: string) {
    this.ok = ok;
    this.status = status;
    this._filepath = _filepath;
  }
}