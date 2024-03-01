document.getElementById('postButton').addEventListener('click', () => {
    const includeCreator = document.getElementById('includeCreatorCheckbox').checked;
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, { action: "testInjection", includeCreator: includeCreator }).then((response) => {
            if (response) {
                // Content script already injected, send the post message
                browser.tabs.sendMessage(tabs[0].id, { action: "requestPost", includeCreator: includeCreator }).then(() => {
                    window.close();
                }, handleError);
            } else {
                // Content script not injected, inject and then send the post message
                browser.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }).then(() => {
                    browser.tabs.sendMessage(tabs[0].id, { action: "requestPost", includeCreator: includeCreator }).then(() => {
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
