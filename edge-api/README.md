# Test case for Edge and Chrome tabs apis inconsistencies

## Background 
Currently [Adblock Plus Issue reporter](https://issues.adblockplus.org/ticket/7175) doesn't work on Microsoft Edge.

Seems like that somehow conected to the `tabs` api having inconsistent result with other Browsers.

## How to reproduce

1. Install the extension on Edge and Chrome
2. Navigate to any site ex.: https://google.com.
3. Open the popup and click on `Report Issue` -> A new tab will open
4. Navigate to that tab and observe the results

## Observed behavior

`tabs.create` and `tabs.captureVisibleTab` Callbacks doesn't return a result in Edge while they do return Tab and dataUrl in the Chrome accordingly.

## Expected behavior

`tabs.create` Callback suppose to pass the TabId and `tabs.captureVisibleTab` Callback dataUrl both in Chrome and Edge, as specified in the documentation.


## Reference to the documentation

tabs.create -> https://developer.chrome.com/extensions/tabs#method-create

tabs.captureVisibleTab -> https://developer.chrome.com/extensions/tabs#method-captureVisibleTab

## Reproduction video

https://www.youtube.com/watch?v=9CkdZWLoOWE
