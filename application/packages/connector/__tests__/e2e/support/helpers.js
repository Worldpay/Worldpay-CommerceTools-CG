// Convert escaped URLs
export const urlDecode = (str) => {
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

export const retryHelper = (maxDurationMins, requestIntervalSeconds) => {
  const requestIntervalMs = requestIntervalSeconds * 1000
  const maxRetryAttempts = (maxDurationMins * 60) / requestIntervalSeconds
  return { maxRetryAttempts, requestInterval: requestIntervalMs }
}

export const urlFormat = /\bhttps?:\/\/.*?\.[a-z]{2,4}\b\S*/g
export const iDEALUrlFormat = /\bhttps?:\/\/.*?\.[a-z]{2,4}\b\/\S*\?op=IDEAL-AuthInit\S*/g
