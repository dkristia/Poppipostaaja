function getCookie(name, callback) {
    chrome.cookies.get({ url: 'https://ranssi.paivola.fi', name: name }, function (cookie) {
        if (callback) {
            callback(cookie ? cookie.value : null);
        }
    });
}

const videoUrl = window.location.href.split("&")[0] || window.location.href;
const videoId = videoUrl.split("v=")[1];

document.addEventListener('DOMContentLoaded', function () {
    // Check if there's a stored post ID and set it as the input's value
    const postIdInput = document.getElementById('postId');
    const storedPostId = localStorage.getItem('postId');
    if (storedPostId) {
        postIdInput.value = storedPostId;
    }

    // Store the post ID when it changes
    postIdInput.addEventListener('input', function () {
        localStorage.setItem('postId', postIdInput.value);
    });

    const postId = document.getElementById('postId').value;
    if (postId === "") {
        document.getElementById('postButton').disabled = true;
        document.getElementById('postButton').innerText = "Syötä postin ID ja avaa extension uudelleen";
    } else {
        fetch("https://ranssi.paivola.fi/post/" + postId, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9,fi;q=0.8,de;q=0.7",
                "cookie": `__Host-next-auth.csrf-token=${getCookie("_Host-next-auth.csrf-token")}; __Secure-next-auth.session-token=${getCookie("__Secure-next-auth.session")}`,
            },
            "body": null,
            "method": "GET"
        }).then(response => response.text())
            .then(text => {
                if (text.includes(videoId)) {
                    document.getElementById('postButton').disabled = true;
                    document.getElementById('postButton').innerText = "BIISI ON JO POSTATTU!";
                } else {
                    document.getElementById('postButton').disabled = false;
                    document.getElementById('postButton').innerText = "Postaa poppeihin";
                }

            });
    }
});

document.getElementById('postButton').addEventListener('click', () => {
    const includeCreator = document.getElementById('includeCreatorCheckbox').checked;
    const customTitle = document.getElementById('customTitle').value;
    const postId = document.getElementById('postId').value;

    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
            action: "testInjection", includeCreator: includeCreator,
            customTitle: customTitle
        }).then((response) => {
            if (response) {
                // Content script already injected, send the post message
                browser.tabs.sendMessage(tabs[0].id, {
                    action: "requestPost", includeCreator: includeCreator,
                    customTitle: customTitle, postId: postId
                }).then(() => {
                    window.close();
                }, handleError);
            } else {
                // Content script not injected, inject and then send the post message
                browser.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }).then(() => {
                    browser.tabs.sendMessage(tabs[0].id, {
                        action: "requestPost", includeCreator: includeCreator,
                        customTitle: customTitle, postId: postId
                    }).then(() => {
                        window.close();
                    }, handleError);
                }, handleError);
            }
        }, handleError);
    }, handleError);
});

function handleError(error) {
    console.error(`Error: ${error}`);
}