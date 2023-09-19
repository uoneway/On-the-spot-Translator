const optionsForm = document.getElementById("optionsForm");

// Immediately persist options changes
function addChangeListener(element, optionKey) {
  element.addEventListener("change", (event) => {
    chrome.storage.sync.set({ [optionKey]: event.target.value });
  });
}

addChangeListener(optionsForm.meta_key, 'meta_key');
addChangeListener(optionsForm.main_lang, 'main_lang');
addChangeListener(optionsForm.sub_lang, 'sub_lang');
addChangeListener(optionsForm.deepl_api_key, 'deepl_api_key');
addChangeListener(optionsForm.naver_api_client_id, 'naver_api_client_id');
addChangeListener(optionsForm.naver_api_client_secret, 'naver_api_client_secret');

// Default values for each key
const defaultOptionValues = {
  meta_key: 'Alt',
  main_lang: 'ko',
  sub_lang: 'en',
  deepl_api_key: '',
  naver_api_client_id: '',
  naver_api_client_secret: ''
};

// Initialize the form with the user's option settings
async function restoreOptions() {
  for (const [key, defaultValue] of Object.entries(defaultOptionValues)) {
    const value = await new Promise(resolve => {
      chrome.storage.sync.get([key], result => {
        if (result[key] === undefined) {
          chrome.storage.sync.set({ [key]: defaultValue });
          resolve(defaultValue);
        } else {
          resolve(result[key]);
        }
      });
    });
    // options[key] = value;
    optionsForm[key].value = value;
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);


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