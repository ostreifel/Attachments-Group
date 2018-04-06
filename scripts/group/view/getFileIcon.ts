export type FileIcon = {
    type: "name"
    name: string;
} | {
    type: "url";
    url: string;
};
export function getFileIcon(fileName: string): FileIcon {
    const icon = (name: string): FileIcon => ({ type: "name", name });
    const image = (url: string): FileIcon => ({ type: "url", url });
    const officeDocImage = (name: string): FileIcon => image(
        `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${name}_48x1.svg`,
    );
    const officeProdImage = (name: string): FileIcon => image(
        `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/svg/${name}_48x1.svg`,
    );
    const match = /^.*\.(.+?)$/.exec(fileName);
    const ext = match && match[1].toLowerCase();
    switch (ext) {
        // these have specific file icons
        case "accdb":
        case "csv":
        case "docx":
        case "dotx":
        case "mpp":
        case "mpt":
        case "odp":
        case "ods":
        case "odt":
        case "one":
        case "onepkt":
        case "onetoc":
        case "potx":
        case "ppsx":
        case "pptx":
        case "pub":
        case "vsdx":
        case "vssx":
        case "vstx":
        case "xls":
        case "xlsx":
        case "xltx":
        case "xsn":
            return officeDocImage(ext);
        // otherwise use the product image
        case "doc":
        case "dot":
        case "wbk":
        case "docx":
        case "docm":
        case "dotx":
        case "dotm":
        case "docb":
            return officeProdImage("word");
        case "xls":
        case "xlt":
        case "xlm":
        case "xlsx":
        case "xlsm":
        case "xltx":
        case "xltm":
        case "xlsb":
        case "xla":
        case "xlam":
        case "xll":
        case "xlw":
            return officeProdImage("excel");
        case "ppt":
        case "pot":
        case "pps":
        case "pptx":
        case "pptm":
        case "potx":
        case "potm":
        case "ppam":
        case "ppsx":
        case "ppsm":
        case "sldx":
        case "sldm":
            return officeProdImage("powerpoint");
        // other icon types
        case "msg":
            return icon("Mail");
        case "sql":
            return icon("FileSQL");
        case "ts":
        case "tsx":
            return icon("TypeScriptLanguage");
        case "js":
            return icon("JavaScriptLanguage");
        case "java":
            return icon("FileJAVA");
        case "cs":
            return icon("CSharpLanguage");
        case "htm":
        case "html":
            return icon("FileHTML");
        case "md":
            return icon("MarkDownLanguage");
        case "xml":
            return icon("FileCode");
        case "scss":
            return icon("FileSass");
        case "css":
            return icon("FileCSS");
        case "aspx":
            return icon("FileASPX");
        case "soln":
            return icon("FileTypeSolution");
        case "svg":
            return icon("FileImage");
        case "zip":
            return icon("ZipFolder");
        case "json":
        case "jsonc":
            return icon("Code");
        case "txt":
        case "log":
            return icon("TextDocument");
        case "rtf":
            return officeDocImage("docx");
        default:
            return icon("Page");
    }
}
