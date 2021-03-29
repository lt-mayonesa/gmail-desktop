import config, { ConfigKey } from '../config'
import { shouldStartMinimized } from '..'
import { getAccountsMenuItems } from '../accounts'
import { app, Menu, MenuItemConstructorOptions } from 'electron'
import { is } from 'electron-util'
import { getMainWindow } from '../main-window'
import { getTray } from '../tray'

let trayMenu: Menu | undefined

export function getTrayMenuTemplate() {
  const macosMenuItems: MenuItemConstructorOptions[] = is.macos
    ? [
        {
          label: 'Show Dock Icon',
          type: 'checkbox',
          checked: config.get(ConfigKey.ShowDockIcon),
          click({ checked }: { checked: boolean }) {
            if (trayMenu) {
              config.set(ConfigKey.ShowDockIcon, checked)

              if (checked) {
                app.dock.show()
              } else {
                app.dock.hide()
              }

              initOrUpdateTrayMenu()
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Menu',
          visible: !config.get(ConfigKey.ShowDockIcon),
          submenu: Menu.getApplicationMenu()!
        }
      ]
    : []

  const trayMenuTemplate: MenuItemConstructorOptions[] = [
    ...getAccountsMenuItems(),
    {
      type: 'separator'
    },
    {
      click: () => {
        getMainWindow().show()
      },
      label: 'Show',
      visible: shouldStartMinimized(),
      id: 'show-win'
    },
    {
      label: 'Hide',
      visible: !shouldStartMinimized(),
      click: () => {
        getMainWindow().hide()
      },
      id: 'hide-win'
    },
    ...macosMenuItems,
    {
      type: 'separator'
    },
    {
      role: 'quit'
    }
  ]

  return trayMenuTemplate
}

export function getTrayMenu() {
  return trayMenu
}

export function initOrUpdateTrayMenu() {
  if (!config.get(ConfigKey.EnableTrayIcon)) {
    return
  }

  const tray = getTray()
  if (tray) {
    trayMenu = Menu.buildFromTemplate(getTrayMenuTemplate())
    tray.setContextMenu(trayMenu)
  }
}
