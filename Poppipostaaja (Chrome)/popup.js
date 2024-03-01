document.getElementById('postButton').addEventListener('click', () => {
    const includeCreator = document.getElementById('includeCreatorCheckbox').checked;
    const customTitle = document.getElementById('customTitle').value;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "testInjection", includeCreator: includeCreator,
            customTitle: customTitle
        }, (response) => {
            if (response) {
                // Content script already injected, send the post message
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "requestPost", includeCreator: includeCreator,
                    customTitle: customTitle
                });
            } else {
                // Content script not injected, inject and then send the post message
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }, () => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "requestPost", includeCreator: includeCreator,
                        customTitle: customTitle
                    });
                });
            }
        });
    });
    window.close();
});