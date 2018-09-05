const request = require("request-promise");

// Authentication 
const restApiUrl = "";
const client = "";
const password = "";
const userId = 0;

const getToken = ()=>
{
  const getTokenOptions = {
    method: "POST",
    uri: `${restApiUrl}/auth/token`,
    body: {client, password, userId},
    json: true
  };
  return request(getTokenOptions);
}

module.exports = {getToken, restApiUrl};