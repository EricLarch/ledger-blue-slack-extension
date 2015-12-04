injectScript(chrome.extension.getURL( "/" ), "inject.js");

function injectScript (aBasePath, aScriptURL) {
  var codeInjection = document.createElement("script");
  codeInjection.src = aBasePath + aScriptURL;
  codeInjection.async = false;
  (document.body || document.head || document.documentElement).appendChild(codeInjection);
}