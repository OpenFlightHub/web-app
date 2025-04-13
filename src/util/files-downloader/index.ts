// TODO once available, we should set up persistent version of the "grant access to local folder" popup: https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api

import { ApiResponse_WorkspaceMyworkspacesGet } from "openflighthub-api-client-sdk";
import { createFileStreamInDirectory, DirectoryPicker_StartIn, filesApiIsSupported, selectFolderToSaveFilesTo } from "./util.js";

/**
 * use FilesDownloader.askUserToSelectFolder() as an entry point
 */
export default class FilesDownloader {

    private readonly globalFolderHandle: FileSystemDirectoryHandle

    constructor(folderHandle: FileSystemDirectoryHandle){
        this.globalFolderHandle = folderHandle
    }

    async setWorkspaces(workspaces: ApiResponse_WorkspaceMyworkspacesGet){
        for(const workspace of workspaces){

            let workspaceFolderHandle = await this.getWorkspaceFolderAndRenameIfRequired(workspace.id, workspace.name)

            if(workspaceFolderHandle === false){
                workspaceFolderHandle = await this.createWorkspaceFolder(workspace.id, workspace.name)
            }
        }
    }

    private makeWorkspaceDirectoryName(id: number, name: string){
        return '' + id + '_' + name
    }

    private async getWorkspaceFolder(workspaceId: number){
        for await (const entry of this.globalFolderHandle.entries()){
            const name = entry[0]
            const handle = entry[1]

            const nameSplit = name.split('_')
            if(nameSplit[0] === ('' + workspaceId)){
                // exists
                return await this.globalFolderHandle.getDirectoryHandle(name)
            }
        }

        return false
    }


    private async getWorkspaceFolderAndRenameIfRequired(workspaceId: number, workspaceName: string){

        const folder = await this.getWorkspaceFolder(workspaceId)

        if(folder === false){
            return false
        }

        const folderNameSplit = folder.name.split('_')

        folderNameSplit.splice(0, 1)
        const existingWorkspaceName = folderNameSplit.join('_')

        if(existingWorkspaceName !== workspaceName){
            //TODO implement (chrome does not currently support this!)
        }

        return folder
    }

    private async createWorkspaceFolder(workspaceId: number, workspaceName: string){
        return await this.globalFolderHandle.getDirectoryHandle(this.makeWorkspaceDirectoryName(workspaceId, workspaceName), {
            create: true
        })
    }

    /**
     *
     * @param fileOrUrl File, Blob or url to file
     */
    async saveFileToWorkspace(workspaceId: number, fileOrUrl: File | Blob | string, fileName: string){
        let folder = await this.getWorkspaceFolder(workspaceId)

        if(folder === false){
            folder = await this.createWorkspaceFolder(workspaceId, 'unknown')
        }

        const fs = await createFileStreamInDirectory(fileName, folder)

        if(fileOrUrl instanceof File || fileOrUrl instanceof Blob){
            await fileOrUrl.stream().pipeTo(fs)
        } else {
            const fe = await fetch(fileOrUrl)

            const blob = new Blob([await fe.arrayBuffer()])

            await blob.stream().pipeTo(fs)
        }
    }

    async fileExists(workspaceId: number, fileName: string){
        const folder = await this.getWorkspaceFolder(workspaceId)

        if(folder === false){
            return false
        }

        try {
            const file = await folder.getFileHandle(fileName)
            return true
        } catch (err){
            return false
        }
    }

    static async askUserToSelectFolder(id?: string, startIn?: DirectoryPicker_StartIn){
        const handle = await selectFolderToSaveFilesTo(id, startIn)

        return new FilesDownloader(handle)
    }

    static isSupported(){
        return filesApiIsSupported()
    }
}
