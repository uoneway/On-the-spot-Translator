let options;

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
        if (options.deepl_api_key) {
            translator_client_info = {
                "translator_type": "deepl",
                "api_key": options.deepl_api_key,
            };
        } else if (options.papago_secret_key && options.papago_api_key) {
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
        console.log("Translation response:", data);
        return data;
    }
}

let translator = new Translator();
updateOptions();

chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName == "sync") {
        updateOptions();
    }
});

function updateOptions() {
    chrome.storage.sync.get(null, function (_options) {
        options = _options;
    });
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.reqType == "spot") {
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
