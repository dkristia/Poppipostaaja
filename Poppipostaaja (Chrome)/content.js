function requestPost(includeCreator, customTitle) {
    const videoTitle = customTitle || document.querySelector('ytd-watch-metadata #title yt-formatted-string').textContent.trim();
    const videoUrl = window.location.href.split("&")[0] || window.location.href;
    let formattedTitle = videoTitle;

    if (includeCreator) {
        let creatorName = '';
        const creatorElement = document.querySelector('ytd-video-owner-renderer ytd-channel-name #text a');
        if (creatorElement) {
            creatorName = creatorElement.textContent.trim();
            formattedTitle = `${creatorName} - ${videoTitle}`;
        }
    }

    chrome.runtime.sendMessage({
        action: "getPostDetails",
        videoTitle: formattedTitle,
        videoUrl: videoUrl
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "testInjection") {
        sendResponse({ status: 'present' });
        return true;
    }
    if (request.action === "requestPost") {
        requestPost(request.includeCreator, request.customTitle);
    }
});
