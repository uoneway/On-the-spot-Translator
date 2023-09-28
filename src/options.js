const optionsForm = document.getElementById("optionsForm");

function addChangeListener(element, optionKey) {
  element.addEventListener("change", (event) => {
    chrome.storage.sync.set({ [optionKey]: event.target.value });
  });
}

const switchKeys = ['switch_deepl', 'switch_papago'];
const switchToInputsMapping = {
  'switch_deepl': ['deepl_api_key'],
  'switch_papago': ['papago_api_key', 'papago_secret_key']
};
function addSwitchChangeListener(element, optionKey) {
  element.addEventListener("change", (event) => {
    chrome.storage.sync.set({ [optionKey]: event.target.checked });
  });
}


addChangeListener(optionsForm.meta_key, 'meta_key');
addChangeListener(optionsForm.main_lang, 'main_lang');
addChangeListener(optionsForm.sub_lang, 'sub_lang');

addSwitchChangeListener(optionsForm.switch_deepl, 'switch_deepl');
addChangeListener(optionsForm.deepl_api_key, 'deepl_api_key');

addSwitchChangeListener(optionsForm.switch_papago, 'switch_papago');
addChangeListener(optionsForm.papago_api_key, 'papago_api_key');
addChangeListener(optionsForm.papago_secret_key, 'papago_secret_key');

// Default values for each key
const defaultOptionValues = {
  meta_key: 'Alt',
  main_lang: 'ko',
  sub_lang: 'en-us',
  deepl_api_key: '',
  switch_deepl: false,
  papago_api_key: '',
  papago_secret_key: '',
  switch_papago: false,
};

// Initialize the form with the user's option settings
async function restoreOptions() {
  for (const [key, defaultValue] of Object.entries(defaultOptionValues)) {
    const value = await new Promise(resolve => {
      chrome.storage.sync.get([key], result => {
        resolve(result[key]);
        // if (result[key] === undefined) {
        //   chrome.storage.sync.set({ [key]: defaultValue });
        //   resolve(defaultValue);
        // } else {
        //   resolve(result[key]);
        // }
      });
    });
    
    if (switchKeys.includes(key)) {
      optionsForm[key].checked = value;

      // 스위치의 체크 상태에 따라 관련된 입력 필드의 class에 disabled 추가/제거
      if (switchToInputsMapping[key]) {
        switchToInputsMapping[key].forEach(inputId => {
          const inputElement = document.getElementById(inputId);
          if (value) {
            inputElement.classList.remove('disabled');
          } else {
            inputElement.classList.add('disabled');
          }
        });
      }

    } else {
      optionsForm[key].value = value;
    }
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


document.addEventListener("DOMContentLoaded", function () {
    const mainLangSelect = document.getElementById("main_lang");
    const subLangSelect = document.getElementById("sub_lang");

    function updateSubLangOptions() {
        const selectedMainLang = mainLangSelect.value;
        
        subLangSelect.querySelectorAll('option').forEach(option => {
            option.disabled = option.value === selectedMainLang;
        });
    }

    mainLangSelect.addEventListener('change', updateSubLangOptions);

    // 페이지 로드 시 subLang의 옵션을 초기화
    updateSubLangOptions();
});

