const request = require("request-promise");
const path = require("path");
const {createWriteStream, createReadStream} = require("fs");
const {outputFileSync, removeSync} = require("fs-extra");
const argv = require("minimist")(process.argv.slice(2));
const admZip = require("adm-zip");
const {promisify} = require("util");
const glob = promisify(require("glob").glob);

// Authentication 
const {getToken, restApiUrl} = require("./authentication");

const sourceLanguage = "en_US";
const targetLanguages = ["de_DE", "es_ES", "ru_RU"];
const localesDir = "locales";

// Temporary file for downloading locales
const tempZip = "temp.zip";

// Map TMX locales to ABPUI locales
const tmxToLocalesMap = 
{
  "de_DE": "de",
  "es_ES": "es",
  "fr_FR": "fr",
  "it_IT": "it",
  "pl_PL": "pl",
  "ru_RU": "ru",
  "tr_TR": "tr"
};

// CLI
if (argv.create)
{
  createProject();
}
else if (argv.update)
{
  updateProject();
}
else if (argv.download)
{
  downloadProject();
}

function generateAuthHeader(token)
{
  return {Authorization: `XTM-Basic ${token}`};
}

/**
 * Creates project with the source file
 * see -> https://wstest2.xtm-intl.com/rest-api/#operation/createProjectUsingPOST
 */
function createProject()
{
  const name = "Created by API";
  const customerId = 23;
  const workflowId = 2926;
  const sourceFile = "desktop-options.json";

  getToken().then(({token}) =>
  {
    const dataCreateProject = {
      method: "POST",
      uri: `${restApiUrl}/projects`,
      formData: {
        customerId, name, sourceLanguage, targetLanguages, workflowId,
        "translationFiles[0].file": createReadStream(path.join(localesDir, sourceLanguage, sourceFile))
      },
      headers: generateAuthHeader(token),
      json: true
    };
    return request(dataCreateProject);
  }).then(({projectId}) =>
  {
    console.log(`project: ${projectId} is created`);
  }).catch((err) =>
  {
    err;
  });
}

/**
 * Add source files to the project
 * see -> https://wstest2.xtm-intl.com/rest-api/#operation/uploadFilesUsingPOST
 */
function updateProject()
{
  const projectId = 10704;
  let filesToUpload = [];
  glob(`${localesDir}/${sourceLanguage}/*.json`).then((files) =>
  {
    filesToUpload = files.reduce((acc, file) =>
    {
      const index = Object.keys(acc).length;
      acc[`files[${index}].file`] = createReadStream(file);
      return acc;
    }, {});
    return getToken();
  }).then(({token}) => 
  {
    filesToUpload.matchType = "MATCH_NAMES"; // Overwrite files
    const dataUpdateProject = {
      method: "POST",
      uri: `${restApiUrl}/projects/${projectId}/files/upload`,
      formData: filesToUpload,
      headers: generateAuthHeader(token)
    };
    return request(dataUpdateProject);
  }).then((response) =>
  {
    response;
  }).catch((err) =>
  {
    err;
  });
}

/**
 * Download the project target files and extract the content
 * https://wstest2.xtm-intl.com/rest-api/#operation/downloadFilesUsingGET
 */
function downloadProject()
{
  const projectId = 5559;
  getToken().then(({token}) =>
  {
    const dataDownloadProject = {
      method: "GET",
      uri: `${restApiUrl}/projects/${projectId}/files/download?fileType=TARGET`,
      headers: generateAuthHeader(token)
    };
    request(dataDownloadProject).pipe(createWriteStream(tempZip)).on("close", () => 
    {
      console.log("Zip file Downloaded");
      const zip = new admZip(tempZip);
      const zipEntries = zip.getEntries();
      for (const zipEntry of zipEntries)
      {
        const tmxFilePath = zipEntry.entryName;
        const tmxFilename = path.parse(tmxFilePath).base;
        const tmxLocale = path.dirname(tmxFilePath);
        const locale = tmxToLocalesMap[tmxLocale];
        const target = path.join(localesDir, locale, tmxFilename);
        console.log(`${target} updated with content of ${tmxFilePath}`);
        outputFileSync(target, zipEntry.getData());
      }
      removeSync(tempZip);
      console.log("Extracted");
    });
  }).catch((err) =>
  {
    console.log(err);
  });
}
