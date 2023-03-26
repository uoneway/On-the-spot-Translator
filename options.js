function saveOptions() {
  chrome.storage.sync.set({
    metaKey: document.getElementById("meta_key").value,
    naver_api_client_id: document.getElementById("naver_api_client_id").value,
    naver_api_client_secret: document.getElementById("naver_api_client_secret").value,
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
    metaKey: 'Alt',
    naver_api_client_id: "",
    naver_api_client_secret: ""
  }, function (items) {
    document.getElementById("meta_key").value = items.metaKey;
    document.getElementById("naver_api_client_id").value = items.naver_api_client_id;
    document.getElementById("naver_api_client_secret").value = items.naver_api_client_secret;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("meta_key").addEventListener("change", saveOptions);
document.getElementById("naver_api_client_id").addEventListener("change", saveOptions);
document.getElementById("naver_api_client_secret").addEventListener("change", saveOptions);
// document.getElementById("meta_key_label").textContent = chrome.i18n.getMessage("meta_key");
