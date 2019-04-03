/*
    The DATA folder in this project is used to store the airtable
    data and a few other files to help manage the project.

    In the ".gitignore" file you will see and entry for this folder
    because we don't want to polute the repository with files from
    the user or server or service. :-)
*/

var fs = require("fs");
var path = require("path");


/*
    Common configs...
*/
const CONFIG_INFO = {
    FolderPath: path.join(__dirname, '../DATA/'),
    SecretFolder: path.join(__dirname, '../DATA/SECRET/')
};
exports.CONFIG_INFO = CONFIG_INFO;


/*
     Read all the JSON files in our DATA folder
     and return as JSON object...
 */
function ReadJSONFiles(FolderPath) {
    const AllData = {};
    fs.readdirSync(FolderPath).forEach(file => {
        const extName = path.extname(file);
        if (extName == ".json") {
            const FileName = file.replace(".json", "");
            try {

                const fileContents = JSON.parse(fs.readFileSync(FolderPath + file, "utf8"));
                AllData[FileName] = fileContents;
            } catch (errReadFile) {
                console.log(errReadFile);
                process.exit(1);
            }
        }
    });
    return AllData;
}
exports.ReadJSONFiles = ReadJSONFiles;





/*
    Simple util to get data in and out of the disk rather than the API.
*/
const Disk = {
    /*
        Save time and money by storing the results of the data
        to the disk. How often does the data really changes?
    */
    SaveData(FileName, FileData) {
        //Strip spaces in filenames because of OS issues...
        FileName = FileName.replace(/ /g, '');


        try {
            const targetFile = path.join(CONFIG_INFO.FolderPath + FileName + '.json');

            if (typeof (FileData) != "string") {
                FileData = JSON.stringify(FileData)
            }

            fs.writeFileSync(targetFile, FileData, { flag: 'w' });

        } catch (err) {
            console.log('Error writting to file!');
            console.log(err.message);
            debugger;

        }
    },
    GetData(FileName) {
        //Strip spaces in filenames because of OS issues...
        FileName = FileName.replace(/ /g, '');



        const targetFile = path.join(CONFIG_INFO.FolderPath + FileName + '.json');

        try {

            const data = fs.readFileSync(targetFile, "utf8");
            return JSON.parse(data);
        } catch (err) {

            console.log("You must change the 'CONFIG.UseDisk' setting and get data before you can read it!");
            // console.log(err);
            console.log('File not found! ' + targetFile);
            // console.log(CONFIG.UseDisk);
            debugger;
            process.exit(1);
        }

    }
};

exports.Disk = Disk;




/*
    Do they have the folder?
*/
if (!fs.existsSync(CONFIG_INFO.FolderPath)) {
    fs.mkdirSync(CONFIG_INFO.FolderPath);
}

/*
    Create the folders we need if the user didn't do it on their own. This happens
    when they don't actually read the README. :-)
*/

if (!fs.existsSync(CONFIG_INFO.SecretFolder)) {
    fs.mkdirSync(CONFIG_INFO.SecretFolder);
}
