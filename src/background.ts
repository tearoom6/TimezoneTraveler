import { parseDateString, formatWithTimezone } from './dateUtils'

chrome.runtime.onInstalled.addListener(() => {
  // TODO: Should be user preferences.
  const targetTimezones = ["Asia/Tokyo", "Europe/London", "America/New_York"]
  const convertedSelections: string[] = []

  chrome.contextMenus.removeAll()
  chrome.contextMenus.create({
    "id": "TimezoneTravelerRoot",
    "title": "Convert timestamp",
    "contexts": ["all"],
  })
  chrome.contextMenus.create({
    "parentId": "TimezoneTravelerRoot",
    "id": "TimezoneTravelerConvert",
    "title": "For current selection (%s)",
    "contexts": ["selection"],
  })
  chrome.contextMenus.create({
    "parentId": "TimezoneTravelerRoot",
    "id": "TimezoneTravelerClearAll",
    "title": "Clear all",
    "contexts": ["all"],
  })
  chrome.contextMenus.create({
    "parentId": "TimezoneTravelerRoot",
    "id": "TimezoneTravelerSeparator",
    "type": "separator",
    "contexts": ["all"],
  })

  chrome.contextMenus.onClicked.addListener(
    (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
      const menuItemId = info.menuItemId.toString()
      if (menuItemId === "TimezoneTravelerConvert") {
        try {
          const currentSelection = info.selectionText
          if (!currentSelection) {
            throw new Error("Text not seelcted.")
          }
          if (convertedSelections.includes(currentSelection)) {
            console.warn(`Already converted: ${currentSelection}`)
            return
          }

          const targetDate = parseDateString(currentSelection)

          chrome.contextMenus.create({
            "parentId": "TimezoneTravelerRoot",
            "id": currentSelection,
            "title": currentSelection,
            "contexts": ["all"],
          })

          targetTimezones.forEach((targetTimezone) => {
            const timezoneDateString = formatWithTimezone(targetDate, targetTimezone)
            chrome.contextMenus.create({
              "parentId": currentSelection,
              "id": `result-${currentSelection}-${targetTimezone}`,
              "title": `${timezoneDateString} (${targetTimezone})`,
              "contexts": ["all"],
            })
          })
          convertedSelections.push(currentSelection)
        } catch (error) {
          console.error(error)
          return
        }
        return
      }

      if (menuItemId === "TimezoneTravelerClearAll") {
        while (convertedSelections.length) {
          const removedMenuItemId = convertedSelections.pop()
          if (removedMenuItemId) {
            chrome.contextMenus.remove(removedMenuItemId)
          }
        }
        return
      }
    }
  )
})
