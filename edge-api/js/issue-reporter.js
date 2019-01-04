
if (typeof browser == "undefined")
  window.browser = chrome;

function getTabId()
{
  return parseInt(location.search.replace(/^\?/, ""), 10);
}

const apiList = [
  {
    api: "tabs.create",
    args: [{'active': false, 'url': 'http://google.com'}],
    prop: "stringify"
  },
  {
    api: "tabs.get",
    args: [getTabId()],
    prop: "stringify"
  },
  {
    api: "tabs.getCurrent",
    args: [],
    prop: "stringify"
  },
  {
    api: "tabs.query",
    args: [{active: true}],
    prop: "stringify"
  },
  {
    api: "tabs.reload",
    args: [getTabId()]
  },
  {
    api: "tabs.captureVisibleTab",
    args: [null, {format: "png"}],
    prop: "stringify"
  }
];

let resText = "";
function apiTest(api, args, prop)
{
  const [apiName, method] = api.split(".");
  browser[apiName][method](...args, (result) => {
    if (prop == "stringify")
    {
      result = JSON.stringify(result);
    }
    else if (prop)
    {
      result = result[prop];
    }
    resText += `${api}: ${result}<br> <br>`
    document.querySelector("#result").innerHTML = resText;
  });
}

for (const {api, args, prop} of apiList)
{
  apiTest(api, args, prop);
}
