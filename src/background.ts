chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    "id": "TimezoneTravelerFromUtc",
    "title": "Convert timezone from UTC",
    "contexts": ["selection"],
  })
})
