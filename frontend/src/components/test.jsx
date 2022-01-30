
import React from 'react';
import { Component } from 'react';
import FileBrowser, {Icons} from 'react-keyed-file-browser'
import {BsFileImage, BsFolderMinus, BsFolderPlus, BsImage} from 'react-icons/bs';
import { addMessage, MessageTypes } from '../api/aleart';
;


const explorerData = [
    {
        path: "Applied Energistigs",
        type: "tree",
        url: "https://api.github.com/repos/AppliedEnergistics/Applied-Energistics-2/git/trees/aabb99d9e6b1b331bed790b8581bc4857aa48bbb"
    },
    {
        path: "Open Computers",
        type: "tree",
        url: "https://api.github.com/repos/MightyPirates/OpenComputers/git/trees/8c2cf3aa5939f05d18f738c97f2a5b997fe97391"
    }
]

const fetchGitHub = async (url) => {
    try {
        console.log("Get: "+url);
        const request = await fetch(url, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'request'
            },

        });
        return {
            limit: request.headers.get("X-RateLimit-Remaining"),
            nextReset: new Date(request.headers.get("X-RateLimit-Reset") * 1000),
            data: await request.json()
        }
    } catch (e) {
        console.log(e);
    }
}

const getData = async (data) => {
    if (data.type === "tree" && data.tree === undefined) {
        const result = await fetchGitHub(data.url);
        console.log(result.limit);
        if (result.limit <= 0) {
            addMessage(`Failed to get data from GitHub, try again at ${result.nextReset.toLocaleTimeString()}.`, MessageTypes.DANGER)
            return
        }
        data.tree = result.data.tree;
    }
}

export class GitHubFiles extends Component {

    constructor(props) {
        super(props)
        this.state = {
            files: this.generateFiles()
        }
    }

    addFolder = (files, folder, parentPath = "") => {
        for (let i in folder) {
            const e = folder[i];
            const data = {
                key: parentPath+e.path,
                data: e
            };
            if (e.type === "tree") {
                console.log(e);
                data.key += "/";
                if (e.tree) {
                    this.addFolder(files, e.tree, data.key);
                }
            } else {
                data.size = e.size
            }
            if (e.type === "tree" || !e.path.endsWith(".mcmeta") )
            files.push(data);
        }
    }

    generateFiles = () => {
        const files = [];
        this.addFolder(files, explorerData)
        return files;
    }

    handleOpenFolder = async (entity) => {
        const key = entity.key;
        await getData(entity.data)
        console.log(this.state.files);
        this.setState({files: this.generateFiles()})
    }

    render() {
        return <FileBrowser files={this.state.files}
            onFolderOpen={this.handleOpenFolder}
            
        icons={{
            File: <i className="file" aria-hidden="true" />,
            Image: <BsFileImage className='me-2'/>,
            PDF: <i className="file-pdf" aria-hidden="true" />,
            Rename: <i className="i-cursor" aria-hidden="true" />,
            Folder: <BsFolderPlus className='me-2'/>,
            FolderOpen: <BsFolderMinus className='me-2' />,
            Delete: <i className="trash" aria-hidden="true" />,
            Loading: <i className="circle-notch spin" aria-hidden="true" />,
          }} />
    }
}
