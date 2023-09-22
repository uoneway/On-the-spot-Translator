let options;
updateOptions();

function updateOptions() {
    chrome.storage.sync.get(null, function (_options) {
        options = _options;
    });
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName == "sync") {
        updateOptions();
    }
});
class Translator {
    static url = "http://127.0.0.1:8000/translate";
    static headers = {
        'content-type': 'application/json; charset=UTF-8',
    };

    async translate(src_text) {
        if (!src_text) {
            throw new Error('Search src_text should be provided as lookup arguments');
        }

        let translator_client_info;
        if (options.switch_deepl && options.deepl_api_key) {
            translator_client_info = {
                "translator_type": "deepl",
                "api_key": options.deepl_api_key,
            };
        } else if (options.switch_papago && options.papago_secret_key && options.papago_api_key) {
            translator_client_info = {
                "translator_type": "papago",
                "api_key": options.papago_api_key,
                "secret_key": options.papago_secret_key
            };
        } else {
            translator_client_info = {
                "translator_type": "google"
            };
        }

        const params = JSON.stringify({
            "translate_request": {
                "src_text": src_text,
                "tgt_lang": null
            },
            "user_option": {
                "main_tgt_lang": options.main_lang,
                "sub_tgt_lang": options.sub_lang,
                "translator_client_info": translator_client_info
            }
        });

        const response = await fetch(Translator.url, {
            method: "POST",
            headers: Translator.headers,
            body: params
        });

        const data = await response.json();
        return data;
    }
}

let translator = new Translator();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.reqType == "spot") {
        console.log("Request:", request);
        console.log("Current Option:", options);

        translator.translate(request.srcText)
            .then(response => {
                console.log("Translation response:", response);
                sendResponse(response);
            })
            .catch(error => {
                console.error("Translation error:", error);
                sendResponse({
                    "text": "Translation error",
                    "status_msg": error.message,
                });
            });
        return true;  // Indicates that the response is sent asynchronously
    } else if (request.reqType == "whole") {
        // TO-DO
    }
});


chrome.runtime.onInstalled.addListener(function(details) {
    // Default values for each key
    const defaultOptionValues = {
        meta_key: 'Alt',
        main_lang: 'ko',
        sub_lang: 'en',
        deepl_api_key: '',
        switch_deepl: false,
        papago_api_key: '',
        papago_secret_key: '',
        switch_papago: false,
      };

    if (details.reason == "install") {
        // 이 확장 프로그램이 처음 설치될 때 실행됩니다.
        chrome.storage.sync.set(defaultOptionValues, function() {
            console.log("Set up default settings.");
        });
    } else if (details.reason == "update") {
        // 각 키별로 체크합니다.
        for (let key in defaultOptionValues) {
            chrome.storage.sync.get(key, function(result) {
                if (!result[key]) {
                    // 해당 키의 값이 없는 경우 초기값으로 설정합니다.
                    let obj = {};
                    obj[key] = defaultOptionValues[key];
                    chrome.storage.sync.set(obj, function() {
                        console.log(`Default value set for ${key} after update.`);
                    });
                }
            });
        }
    }
});
