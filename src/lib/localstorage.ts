function getLocalStorage<T>(key: string): T | null {
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : null
}

function setLocalStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export { getLocalStorage, setLocalStorage }
