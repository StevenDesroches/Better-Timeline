export class Utils {
    static getFileKbSizeOfString(string: string) {
        const kb = 1024;
        let bytes = Buffer.byteLength(string);
        return bytes / kb;
    }
}