import { findStorage } from 'browser/lib/findStorage'
import resolveStorageData from './resolveStorageData'
import resolveStorageNotes from './resolveStorageNotes'
import exportFolder from './exportFolder'
import filenamify from 'filenamify'
import * as path from 'path'
import * as fs from 'fs'

/**
 * @param {String} storageKey
 * @param {String} fileType
 * @param {String} exportDir
 *
 * @return {Object}
 * ```
 * {
 *   storage: Object,
 *   fileType: String,
 *   exportDir: String
 * }
 * ```
 */

function exportStorage (storageKey, fileType, exportDir) {
  let targetStorage
  try {
    targetStorage = findStorage(storageKey)
  } catch (e) {
    return Promise.reject(e)
  }

  return resolveStorageData(targetStorage)
    .then(storage => (
      resolveStorageNotes(storage).then(notes => ({storage, notes}))
    ))
    .then(function exportNotes (data) {
      const { storage } = data
      const folderNamesMapping = {}
      storage.folders.forEach(folder => {
        const folderExportedDir = path.join(exportDir, filenamify(folder.name, {replacement: '_'}))
        folderNamesMapping[folder.key] = folderExportedDir
        // make sure directory exists
        try {
          fs.mkdirSync(folderExportedDir)
        } catch (e) {}
        exportFolder(storageKey, folder.key, fileType, folderExportedDir)
      })

      return {
        storage,
        fileType,
        exportDir
      }
    })
}

module.exports = exportStorage
