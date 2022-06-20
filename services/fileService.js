const fs = require("fs"); //work with files
const File = require("../models/File");
const config = require("config");

class FileService {
  createDir(req, file) {
    const filePath = this.getPath(req, path);
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(filePath)) {
          // return true if path exist
          fs.mkdirSync(filePath); //not async create folder
          return resolve({ message: "File was created" });
        } else {
          return reject({ message: "File already exist" });
        }
      } catch (error) {
        return reject({ message: "File error" });
      }
    });
  }
  deleteFile(req, file) {
    const path = this.getPath(req, file);
    if (file.type === "dir") {
      fs.rmdirSync(path);
    } else {
      fs.unlinkSync(path);
    }
  }

  getPath(req, file) {
    return req.filePath + "\\" + file.user + "\\" + file.path;
  }
}

module.exports = new FileService();
