/**
 * Opens a link in a new tab. When the browser blocks the new tab (popup blockers, in-app browsers such as LinkedIn's
 * or Instagram's), it navigates in this tab instead, so the click never silently does nothing.
 * window.open with 'noopener' always returns null, so the opener link is cut by hand to be able to detect a block.
 */
export function openExternal(url: string) {
  const tab = window.open(url, '_blank')
  if (tab) tab.opener = null
  else window.location.assign(url)
}
