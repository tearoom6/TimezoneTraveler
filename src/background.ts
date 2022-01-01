import { parseDateString, formatWithTimezone } from './dateUtils'

// TODO: Should be user preferences.
const targetTimezones = ["Asia/Tokyo", "Europe/London", "America/New_York"]

chrome.runtime.onInstalled.addListener(() => {
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
    "id": "TimezoneTravelerConvertNow",
    "title": "For current time",
    "contexts": ["all"],
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
})

chrome.contextMenus.onClicked.addListener(
  async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    const storageResults = await chrome.storage.local.get(["convertedSelections"])
    const convertedSelections: string[] = storageResults.convertedSelections || []

    const menuItemId = info.menuItemId.toString()
    if (menuItemId === "TimezoneTravelerConvert") {
      try {
        const currentSelection = info.selectionText
        if (!currentSelection) {
          throw new Error("Text not seelcted.")
        }
        if (convertedSelections.includes(currentSelection)) {
          console.warn(`Already converted: ${currentSelection}`)
          chrome.contextMenus.remove(currentSelection)
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
        if (!convertedSelections.includes(currentSelection)) {
          convertedSelections.push(currentSelection)
          await chrome.storage.local.set({ convertedSelections: convertedSelections })
        }
      } catch (error) {
        console.warn(error)
        return
      }
      return
    }

    if (menuItemId === "TimezoneTravelerConvertNow") {
      try {
        const targetDate = new Date()
        const targetDateString = targetDate.toLocaleString()
        chrome.contextMenus.create({
          "parentId": "TimezoneTravelerRoot",
          "id": targetDateString,
          "title": `Now (${targetDateString})`,
          "contexts": ["all"],
        })

        targetTimezones.forEach((targetTimezone) => {
          const timezoneDateString = formatWithTimezone(targetDate, targetTimezone)
          chrome.contextMenus.create({
            "parentId": targetDateString,
            "id": `result-${targetDateString}-${targetTimezone}`,
            "title": `${timezoneDateString} (${targetTimezone})`,
            "contexts": ["all"],
          })
        })
      } catch (error) {
        console.warn(error)
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
      await chrome.storage.local.remove(["convertedSelections"])
      return
    }
  }
)

chrome.runtime.onSuspend.addListener(() => {
  console.log("Unloading.")
})
