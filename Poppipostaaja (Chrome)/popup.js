function getCookie(name, callback) {
    chrome.cookies.get({ url: 'https://ranssi.paivola.fi', name: name }, function (cookie) {
        if (callback) {
            callback(cookie ? cookie.value : null);
        }
    });
}

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

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        const videoUrl = activeTab.url.split("&")[0] || activeTab.url;
        const videoId = videoUrl.split("v=")[1];
        if (postId === "") {
            document.getElementById('postButton').disabled = true;
            document.getElementById('postButton').innerText = "Syötä postauksen ID ja avaa extension uudelleen";
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
});

document.getElementById('postButton').addEventListener('click', async () => {
    const includeCreator = document.getElementById('includeCreatorCheckbox').checked;
    const customTitle = document.getElementById('customTitle').value;
    const postId = document.getElementById('postId').value;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "testInjection", includeCreator: includeCreator,
            customTitle: customTitle
        }, (response) => {
            if (response) {
                // Content script already injected, send the post message
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "requestPost", includeCreator: includeCreator,
                    customTitle: customTitle, postId: postId
                });
            } else {
                // Content script not injected, inject and then send the post message
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }, () => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "requestPost", includeCreator: includeCreator,
                        customTitle: customTitle, postId: postId
                    });
                });
            }
        });
    });
    window.close();
});