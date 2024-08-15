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
});