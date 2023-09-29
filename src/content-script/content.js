const MAX_REQ_LEN = 3000
const translatorIcon = {
    'deepl': '../images/translator_icons/deepl_icon.png',
    'papago':'../images/translator_icons/papago_icon.png',
    'google':'../images/translator_icons/google_icon.png'
  };

// let spotWorks;
let metaKey;
updateMetaKey();

chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName == "sync") {
        updateMetaKey();
    }
})

function updateMetaKey() {
    chrome.storage.sync.get({
        meta_key: 'Alt',
    }, function (items) {
        metaKey = items.meta_key;
    });
};


// SourceBox
let sourceBoxActivated = false;
let metaKeyPressed = false; // Move this to the global scope

document.addEventListener("DOMContentLoaded", function () {

    document.addEventListener("mouseover", function (event) {
        if (sourceBoxActivated) {
            drawSourceBox(event.target);
            event.preventDefault();
        }
    }, false);

    // Bind the keydown event to the window instead of document
    window.addEventListener("keydown", function (event) {
        if ((event.altKey && metaKey == "Alt")
            || (event.ctrlKey && metaKey == "Ctrl")
            || (event.shiftKey && metaKey == "Shift")) {
            metaKeyPressed = true; // Set the flag to true when meta key is pressed
        }
    }, true);

    window.addEventListener("keyup", function (event) {
        if ((!event.altKey && metaKey == "Alt")
            || (!event.ctrlKey && metaKey == "Ctrl")
            || (!event.shiftKey && metaKey == "Shift")) {
            metaKeyPressed = false; // Set the flag to false when meta key is released
            sourceBoxActivated = false;
            $(".sourceBox").remove();
            event.preventDefault();
        }
    }, true);

    document.addEventListener("mousemove", function (event) {
        if (metaKeyPressed) { // Check if meta key is pressed
            let elements = document.querySelectorAll(":hover");
            if (elements.length > 0) {
                drawSourceBox(elements[elements.length - 1]);
                sourceBoxActivated = true;
            }
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
    //         insertWholeBox(event.target);
    //         event.preventDefault();
    //     }
    // }, false);
    document.addEventListener("click", function (event) {
        if ((event.altKey && metaKey == "Alt")
            || (event.ctrlKey && metaKey == "Ctrl")
            || (event.shiftKey && metaKey == "Shift")) {
                $(".sourceBox").remove();
            insertSpotBox(event.target);
            event.preventDefault();  //클릭 시 보통 발생하는 링크 이동 등을 막아주기 위해
        }
    }, false);
});

async function insertSpotBox(clickedElement) {

    let spot_box = document.createElement("div");
    spot_box.className = "spotBox";

    let text = getText(clickedElement.firstChild, "\n")
    if (text.length == 0) {
        return false
    }

    try {
        clickedElement.appendChild(spot_box);

        if (text.length > MAX_REQ_LEN) {
            let error_text = "Only can translate up to " + MAX_REQ_LEN + " characters at once."
            console.log(error_text)
            $(spot_box).text(error_text);
            return false
        }
        
        req_server("spot", text, spot_box)

    } finally {
        $(".borderBox").remove();
    }
}

//goes to bg_page.js. 크롬 익스텐션에서는 그냥 sendMessage 보내면 backgroud.js로 보내는걸로 정해져 있는듯함
async function req_server(reqType, srcText, tgtBoxCls) {
    await chrome.runtime.sendMessage({
        reqType: reqType,
        srcText: srcText, 
    },
        function (response) {
            let iconPath;
            if (translatorIcon[response.translator_type]) {
                iconPath = translatorIcon[response.translator_type];
            } else {
                iconPath = '../images/icon.png';
            }
            
            const iconHtml = `<div><img src="${chrome.runtime.getURL(iconPath)}" alt="Icon"></div>`;
            let textHtml='';
            
            if (response.text != undefined) {
                textHtml += iconHtml + `<span>${response.text}</span>`;
            }
            // response.text가 있는, 즉 번역된 경우에도 status_msg가 있는 경우가 있음
            if (response.status_msg != undefined) {
                textHtml += `<div class="errorBox">${response.status_msg}</div>`;
            }
            if (textHtml == ''){ //(response.text == undefined && response.status_msg == undefined) {
                textHtml += `<div class="errorBox">${response.error}</div>`;
                console.error(response.error);
            }
            $(tgtBoxCls).html(textHtml);
        });
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
