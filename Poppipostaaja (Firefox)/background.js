browser.runtime.onInstalled.addListener(() => {
    console.log('Ranssi Auto Poster installed.');
});

function getCookie(name) {
    return browser.cookies.get({ url: 'https://ranssi.paivola.fi', name: name });
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPostDetails") {
        getCookie('__Secure-next-auth.session-token').then(cookie => {
            if (cookie) {
                postYouTubeLinkToForum(request.videoTitle, request.videoUrl, cookie.value, request.postId);
            } else {
                console.error('No token found');
            }
        }).catch(error => {
            console.error('Error getting cookie:', error);
        });
    }
    return true;
});

function postYouTubeLinkToForum(videoTitle, videoUrl, token, postId) {
    const formattedMessage = `[${videoTitle}](${videoUrl})`;

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
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}