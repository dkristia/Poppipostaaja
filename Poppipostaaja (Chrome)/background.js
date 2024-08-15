chrome.runtime.onInstalled.addListener(() => {
    console.log('Ranssi Auto Poster installed.');
});

function getCookie(name, callback) {
    chrome.cookies.get({ url: 'https://ranssi.paivola.fi', name: name }, function (cookie) {
        if (callback) {
            callback(cookie ? cookie.value : null);
        }
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getPostDetails") {
        getCookie('__Secure-next-auth.session-token', function (token) {
            if (token) {
                postYouTubeLinkToForum(request.videoTitle, request.videoUrl, token, request.postId);
            } else {
                console.error('No token found');
            }
        });
    }
    return true;
});

function postYouTubeLinkToForum(videoTitle, videoUrl, token, postId) {
    const formattedMessage = `[${videoTitle}](${videoUrl})`;
    console.log(postId)

    fetch(`https://ranssi.paivola.fi/api/v3/post/${postId}/comment/add`, {
        method: "POST",
        headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,fi;q=0.8",
            "authorization": `Bearer ${token}`,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: "",
            message: formattedMessage
        }),
        credentials: "include"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            try {
                return JSON.parse(text);
            } catch (e) {
                throw new Error("Failed to parse response as JSON");
            }
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}