const parseDateStringWithoutException = (dateString: string | number | Date) => {
  if (typeof dateString === "number") {
    if (dateString.toString().length <= 10) {
      // e.g. 1638744660
      return new Date(dateString * 1000)
    }
    // e.g. 1638744660039
    return new Date(dateString)
  }
  if (typeof dateString === "string") {
    if (!Number(dateString)) {
      // e.g. "2021/12/6 5:51:00"
      return new Date(dateString)
    }
    if (dateString.toString().length <= 10) {
      // e.g. "1638744660"
      return new Date(Number(dateString) * 1000)
    }
    // e.g. "1638744660039"
    return new Date(Number(dateString))
  }
  // other cases
  return new Date(dateString)
}

export const parseDateString = (dateString: string | number) => {
  const date = parseDateStringWithoutException(dateString)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`)
  }
  return date
}

export const formatWithTimezone = (date: Date, timeZone: string) => {
  return date.toLocaleString(navigator.language, { timeZone })
}
