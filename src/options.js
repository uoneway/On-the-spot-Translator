// In-page cache of the user's options
const options = {};
const optionsForm = document.getElementById("optionsForm");

// Immediately persist options changes
function addChangeListener(element, optionKey) {
  element.addEventListener("change", (event) => {
      options[optionKey] = event.target.value;
      chrome.storage.sync.set({ options });
  });
}

addChangeListener(optionsForm.meta_key, 'meta_key');
addChangeListener(optionsForm.main_lang, 'main_lang');
addChangeListener(optionsForm.sub_lang, 'sub_lang');
addChangeListener(optionsForm.deepl_api_key, 'deepl_api_key');
addChangeListener(optionsForm.naver_api_client_id, 'naver_api_client_id');
addChangeListener(optionsForm.naver_api_client_secret, 'naver_api_client_secret');

// Initialize the form with the user's option settings
async function restoreOptions() {
  const data = await chrome.storage.sync.get("options");
  Object.assign(options, data.options);
  optionsForm.meta_key.value = options.meta_key || 'Alt';
  optionsForm.main_lang.value = options.main_lang || 'ko';
  optionsForm.sub_lang.value = options.sub_lang || 'en';
  optionsForm.deepl_api_key.value = options.deepl_api_key || '';
  optionsForm.naver_api_client_id.value = options.naver_api_client_id || '';
  optionsForm.naver_api_client_secret.value = options.naver_api_client_secret || '';
}

document.addEventListener('DOMContentLoaded', restoreOptions);


// function saveOptions() {
//   chrome.storage.sync.set({
//     metaKey: document.getElementById("meta_key").value,
//     naver_api_client_id: document.getElementById("naver_api_client_id").value,
//     naver_api_client_secret: document.getElementById("naver_api_client_secret").value,
//   });
// }
// document.getElementById("meta_key").addEventListener("change", saveOptions);
// document.getElementById("naver_api_client_id").addEventListener("change", saveOptions);
// document.getElementById("naver_api_client_secret").addEventListener("change", saveOptions);
// // document.getElementById("meta_key_label").textContent = chrome.i18n.getMessage("meta_key");

// function updateOption(event) {
//   options[event.target.name] = event.target.checked || event.target.value;
//   chrome.storage.sync.set({ options });
// }


$(function () {
  // 페이지 로드 시 모든 .activate-api 체크박스를 확인하고 관련 인풋 박스를 비활성화
  $(".activate-api").each(function () {
      var inputBox = $(this).closest('.api-info').find(".input_box");
      inputBox.addClass("disabled").prop("disabled", true);
  });

  $(".activate-api").change(function () {
      // 체크박스 변경 로직은 동일
      var inputBox = $(this).closest('.api-info').find(".input_box");
      if ($(this).prop("checked")) {
          inputBox.removeClass("disabled").prop("disabled", false);
      } else {
          inputBox.addClass("disabled").prop("disabled", true);
      }
  });
});