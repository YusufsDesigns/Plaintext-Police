import * as path from 'path';
import { exec } from 'child_process';
import * as vscode from 'vscode';

export function playAlert(context: vscode.ExtensionContext) {
    const audioPath = path.join(context.extensionPath, 'media', 'siren.wav');

    let command: string;

    switch (process.platform) {
        case 'win32':  // Windows
            command = `powershell -c (New-Object Media.SoundPlayer '${audioPath}').PlaySync()`;
            break;
        case 'darwin':  // Mac
            command = `afplay "${audioPath}"`;
            break;
        case 'linux':  // Linux
            command = `aplay "${audioPath}"`;
            break;
        default:
            console.warn('Audio not supported on this platform');
            return;
    }

    exec(command, (error) => {
        if (error) {
            console.error('Audio playback failed:', error);
        }
    });
}