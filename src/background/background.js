const defaultOptionValues = {
  meta_key: "Alt",
  main_lang: "ko",
  sub_lang: "en-us",
  deepl_api_key: "",
  switch_deepl: false,
  papago_api_key: "",
  papago_secret_key: "",
  switch_papago: false,
};

let options = {};

async function getOptionsFromStorage(defaults) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(defaults, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(result);
      }
    });
  });
}

async function updateOptions() {
  options = await getOptionsFromStorage(defaultOptionValues);
}

// 최초 실행 시 옵션 업데이트
(async function initialize() {
  await updateOptions();
})();

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "sync") {
    updateOptions();
  }
});

class Translator {
  // static url = "http://127.0.0.1:8000/translate";
  static url = "http://158.179.194.39:8000/translate";
  static headers = {
    "content-type": "application/json; charset=UTF-8",
  };

  async translate(src_text) {
    if (!src_text) {
      throw new Error("Source text should be provided as lookup arguments");
    }

    let translator_client_info;
    if (options.switch_deepl && options.deepl_api_key) {
      translator_client_info = {
        translator_type: "deepl",
        api_key: options.deepl_api_key,
      };
    } else if (
      options.switch_papago &&
      options.papago_api_key &&
      options.papago_secret_key
    ) {
      translator_client_info = {
        translator_type: "papago",
        api_key: options.papago_api_key,
        secret_key: options.papago_secret_key,
      };
    } else {
      translator_client_info = {
        translator_type: "google",
      };
    }

    const params = JSON.stringify({
      translate_request: {
        src_text: src_text,
        tgt_lang: null,
      },
      user_option: {
        main_tgt_lang: options.main_lang || defaultOptionValues.main_lang,
        sub_tgt_lang: options.sub_lang || defaultOptionValues.sub_lang,
        translator_client_info: translator_client_info,
      },
    });

    const response = await fetch(Translator.url, {
      method: "POST",
      headers: Translator.headers,
      body: params,
    });

    const data = await response.json();
    return data;
  }
}

let translator = new Translator();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.reqType === "spot") {
    console.log("Request:", request);

    translator
      .translate(request.srcText)
      .then((response) => {
        console.log("Translation response:", response);
        sendResponse(response);
      })
      .catch((error) => {
        console.error("Translation error:", error);
        sendResponse({
          text: null,
          status_msg: error.message,
          translator_type: null,
        });
      });
    return true; // Indicates that the response is sent asynchronously
  }
  // TODO: 다른 요청 유형 처리 (예: "whole")
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.storage.sync.set(defaultOptionValues, function () {
      console.log("Newly installed! Set up with default settings.");
      updateOptions();
    });
  } else if (details.reason === "update") {
    updateOptions();
  }
});
