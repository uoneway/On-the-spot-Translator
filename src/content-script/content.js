let MAX_REQ_LEN = 3000
let TGT_LANG = "ko"


// Set a meta key from icon popup
let spotWorks;
let metaKey;
updateMetaKey();

chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName == "sync") {
        updateMetaKey();
    }
})

function updateMetaKey() {
    chrome.storage.sync.get({
        metaKey: 'Alt',
        // naver_api_client_id: '',
        // naver_api_client_secret: '',
    }, function (items) {
        metaKey = items.metaKey;
        // naver_api_client_id = items.naver_api_client_id;
        // naver_api_client_secret = items.naver_api_client_secret;
    });
};


// SourceBox
let sourceBoxActivated = false;

document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("mouseover", function (event) {
        // console.log("mouseover")
        if (sourceBoxActivated) {
            drawSourceBox(event.target);
            event.preventDefault();
        }
    }, false);

    document.addEventListener("keydown", function (event) {
        // console.log("keydown")
        if ((event.altKey && metaKey == "Alt")
            || (event.ctrlKey && metaKey == "Ctrl")
            || (event.shiftKey && metaKey == "Shift")) {
            let elements = document.querySelectorAll(":hover");
            if (elements.length > 0) {
                drawSourceBox(elements[elements.length - 1]);
                sourceBoxActivated = true;
            }
        }
    }, true);

    document.addEventListener("keyup", function (event) {
        // console.log("keyup")
        if ((!event.altKey && metaKey == "Alt")
            || (!event.ctrlKey && metaKey == "Ctrl")
            || (!event.shiftKey && metaKey == "Shift")) {
            sourceBoxActivated = false;
            $(".sourceBox").remove();
            event.preventDefault();
        }
    }, true);
});

function drawSourceBox(overedElement) {
    // Remove before sourceBox
    $(".sourceBox").remove();

    let rect = overedElement.getBoundingClientRect();
    let sourceBox = document.createElement("div");
    sourceBox.className = "sourceBox";
    sourceBox.style.top = (rect.top + window.scrollY) + "px";
    sourceBox.style.left = (rect.left + window.scrollX) + "px";
    sourceBox.style.width = (rect.width - 4) + "px";
    sourceBox.style.height = (rect.height - 4) + "px";
    document.body.appendChild(sourceBox);

    // $(sourceBox).fadeIn(300, "swing").delay(600).fadeOut(500, "swing");
}


// Req and Resp
document.addEventListener("DOMContentLoaded", function () {
    // document.addEventListener("keydown", function (event) {
    //     if (((event.altKey && metaKey == "Alt")
    //         || (event.ctrlKey && metaKey == "Ctrl")
    //         || (event.shiftKey && metaKey == "Shift")) && event.key == "1") {
    //         insertSpotBox(event.target);
    //         event.preventDefault();  //클릭 시 보통 발생하는 링크 이동 등을 막아주기 위해
    //     }
    // }, false);
    document.addEventListener("click", function (event) {
        if ((event.altKey && metaKey == "Alt")
            || (event.ctrlKey && metaKey == "Ctrl")
            || (event.shiftKey && metaKey == "Shift")) {
            insertSpotBox(event.target);
            event.preventDefault();  //클릭 시 보통 발생하는 링크 이동 등을 막아주기 위해
        }
    }, false);
});

async function insertSpotBox(clickedElement) {

    let spotBox = document.createElement("div");
    spotBox.className = "spotBox";

    let text = getText(clickedElement.firstChild, "\n").trim();  // "\r\n"
    // console.log("text1", text)


    try {
        clickedElement.appendChild(spotBox);

        if (text.length > MAX_REQ_LEN) {
            let error_text = "Only can translate up to " + MAX_REQ_LEN + " characters at once."
            // console.error(error_text)
            $(spotBox).text(error_text);
            return false
        }

        req_server("spot", text, TGT_LANG, spotBox)

    } finally {
        $(".borderBox").remove();
        // console.log(spotBox);
    }
}

//goes to bg_page.js. 크롬 익스텐션에서는 그냥 sendMessage 보내면 backgroud.js로 보내는걸로 정해져 있는듯함
async function req_server(reqType, srcText, tgtLang, tgtBoxCls) {
    await chrome.runtime.sendMessage({
        reqType: reqType,
        srcText: srcText,  // data로 묶기
        tgtLang: tgtLang,
        tgtBoxCls: tgtBoxCls
    },
        function (response) {
            // papago에 바로 요청할 때
            // if (response.text != undefined){
            //     console.log(response.ext_api_code)
            //     $(tgtBoxCls).text("✔ " + response.text);
            // }else{
            //     console.log(response.error);
            //     $(tgtBoxCls).text(response.error);
            // }

            if (response.text != undefined) {  // ok
                $(tgtBoxCls).text("✔ " + response.text);

            } else {
                if (response.ext_api_code != undefined) {  // heroku는 괜찮은데 papago 문제일 때
                    console.log(response.ext_api_code);
                    error_msg = convert_papago_error_to_msg(response.ext_api_code); //, "❗ ")
                    $(tgtBoxCls).html(error_msg);
                } else {
                    console.log(response.error);
                    $(tgtBoxCls).text(response.error);
                }
            }
            // console.log(response);  
        });
}

// https://developers.naver.com/docs/common/openapiguide/errorcode.md#%EC%98%A4%EB%A5%98-%EB%A9%94%EC%8B%9C%EC%A7%80-%ED%98%95%EC%8B%9D
function convert_papago_error_to_msg(error_code, prefix = '') {
    let forForDetail = "</br>For more details, click <a target='_blank' href='https://www.notion.so/uoneway/On-the-spot-Translator-1826d87aa2d845d093793cee0ca11b29' style='color: #008eff; pointer-events: all;'><u>here</u></a>"
    if (error_code == '401') {
        error_msg = "🔧 Authentication failed: </br>Please make sure you enter correct 'Naver API application info(Client ID and Client Secret)' in the option popup." + forForDetail;
    } else if (error_code == '403') {
        error_msg = "🔧 You don't have the 'Papago Translation API' permission: </br>Please add 'Papago Translation' on 'API setting' tab in the Naver Developer Center website." + forForDetail;
    } else if (error_code == '429') {
        error_msg = "⏳ Used up all your daily usage: </br>This translator use Naver Papago API which provide only 10,000 characters translation per a day.";
    } else {
        error_msg = "❗ Error: </br>Some problem occured at Naver Papago API application. Please try again in a few minutes";
    };
    return prefix + error_msg
}

function getText(node, lineSeparator) {
    let text = "";
    while (node != null) {
        if (node.nodeType == Node.TEXT_NODE) {
            text += removeLineSeparator(node.nodeValue) // node.nodeValue.trim();
        } else if (node.nodeType == Node.ELEMENT_NODE) {
            if ($(node).is(':visible')) {
                let childText = "";
                if (node.firstChild != null) {
                    if (node.parentNode.nodeName == "SELECT" && node.nodeName == "OPTION") {
                        // Get selected option text only
                        if (node.parentNode[node.parentNode.selectedIndex] == node) {
                            childText = getText(node.firstChild, lineSeparator);
                        }
                    } else {
                        childText = getText(node.firstChild, lineSeparator);
                    }
                }

                if (childText != "") {
                    text += removeLineSeparator(childText);
                }

                if (node.nodeName == "BR" || window.getComputedStyle(node, null).display.indexOf("inline") === -1) {
                    text += lineSeparator;
                }
            }
        }

        node = node.nextSibling;
    }

    return text.trim();
}

function removeLineSeparator(text) {
    return text.replace(/\n/g, ' ');
}
