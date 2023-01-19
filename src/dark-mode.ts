import { ipcRenderer as ipc } from 'electron'
import * as DarkReader from 'darkreader'

DarkReader.setFetchMethod(window.fetch)

const darkSchemeBackgroundColor = '#121212'

interface DarkModeSettings {
  selectionColor: string
  brightness: number
  contrast: number
  sepia: number
}

function enableDarkMode(settings: DarkModeSettings): void {
  DarkReader.enable(
    { ...settings, darkSchemeBackgroundColor },
    {
      css: `
          /* Read email */
          .yO {
            background-color: ${darkSchemeBackgroundColor} !important;
          }

          /* Unread email */
          .zE {
            background-color: #1a1a1a !important;
          }

          /* Selected email */
          .x7 {
            background-color: #161d1d !important;
          }

          /* Snackbar (bottom-left) */
          .bAp.b8.UC .vh {
            background-color: #1a1a1a !important;
          }

          /* Compose */
          .z0 > .L3 {
            background-color: #1a1a1a !important;
          }
        `,
      ignoreImageAnalysis: [],
      ignoreInlineStyle: [],
      invert: [
        // Mail (e.g. Search Dropdown)
        '.gsoi_0',
        // Clock (e.g. Search Dropdown)
        '.asor',
        // Arrow (e.g. View Issue)
        '.aTn',
        // Hangouts Contacts
        '.aH3',
        // Hangouts Conversations
        '.aj2',
        // Hangouts Phone
        '.a8V'
      ]
    }
  )
}

async function initDarkMode(settings: DarkModeSettings): Promise<void> {
  const darkMode = await ipc.invoke('dark-mode')

  if (darkMode) {
    window.addEventListener('DOMContentLoaded', () => {
      enableDarkMode(settings)
    })
  }

  ipc.on('dark-mode:updated', (_event, enabled: boolean) => {
    if (enabled) {
      enableDarkMode(settings)
    } else {
      DarkReader.disable()
    }
  })

  ipc.on('dark-mode:settings:updated', (_event, updatedSettings) => {
    enableDarkMode({
      ...settings,
      ...updatedSettings
    })
  })
}

export default initDarkMode
