const request = require("request-promise");
const path = require("path");
const {createWriteStream, createReadStream} = require("fs");
const {outputFileSync, removeSync} = require("fs-extra");
const argv = require("minimist")(process.argv.slice(2));
const admZip = require("adm-zip");

// Authentication 
const {getToken, restApiUrl} = require("./authentication");

// New project creation data
const name = "Created by API";
const sourceLanguage = "en_US";
const targetLanguages = ["de_DE", "es_ES", "ru_RU"];
const customerId = 23;
const localesDir = "locales";
const workflowId = 2926;
const sourceFile = "desktop-options.json";

// Used for download and upload
const projectId = 5559;

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
  getToken().then(({token}) =>
  {
    const createProjectOption = {
      method: "POST",
      uri: `${restApiUrl}/projects`,
      formData: {
        customerId, name, sourceLanguage, targetLanguages, workflowId,
        "translationFiles[0].file": createReadStream(path.join(localesDir, sourceLanguage, sourceFile))
      },
      headers: generateAuthHeader(token),
      json: true
    };
    return request(createProjectOption);
  }).then(({projectId}) =>
  {
    console.log(`project: ${projectId} is created`);
  }).catch((err) =>
  {
    err;
  });
}

/**
 * Download the project target files and extract the content
 */
function downloadProject()
{
  getToken().then(({token}) =>
  {
    const downloadTargetOption = {
      method: "GET",
      uri: `${restApiUrl}/projects/${projectId}/files/download?fileType=TARGET`,
      headers: generateAuthHeader(token)
    };
    request(downloadTargetOption).pipe(createWriteStream(tempZip)).on("close", () => 
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
