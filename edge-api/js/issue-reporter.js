
 function getTabId()
 {
   return parseInt(location.search.replace(/^\?/, ""), 10);
 }

 const datas = [
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
  }
];

let resText = "";
function apiTest(api, args, prop)
{
  const [apiName, method] = api.split(".");
  browser[apiName][method](...args, (result) => {
    if (prop && !result)
    {
      result = result[prop];
    }
    else if (prop == "stringify")
    {
      result = JSON.stringify(result);
    }
    resText += `${api}: ${result}<br> <br>`
    document.querySelector("#result").innerHTML = resText;
  });
  
}

for (const {api, args, prop} of datas)
{
  apiTest(api, args, prop);
}
