import { findStorage } from 'browser/lib/findStorage'
import resolveStorageData from './resolveStorageData'
import resolveStorageNotes from './resolveStorageNotes'
import exportNote from './exportNote'
import filenamify from 'filenamify'
import * as path from 'path'

/**
 * @param {String} storageKey
 * @param {String} folderKey
 * @param {String} fileType
 * @param {String} exportDir
 *
 * @return {Object}
 * ```
 * {
 *   storage: Object,
 *   folderKey: String,
 *   fileType: String,
 *   exportDir: String
 * }
 * ```
 */

function exportFolder (storageKey, folderKey, fileType, exportDir) {
  let targetStorage
  try {
    targetStorage = findStorage(storageKey)
  } catch (e) {
    return Promise.reject(e)
  }

  return resolveStorageData(targetStorage)
    .then(function assignNotes (storage) {
      return resolveStorageNotes(storage)
        .then((notes) => {
          return {
            storage,
            notes
          }
        })
    })
    .then(function exportNotes (data) {
      const { storage, notes } = data

      notes
        .filter(note => note.folder === folderKey && note.isTrashed === false && note.type === 'MARKDOWN_NOTE')
        .forEach(note => {
          const notePath = path.join(exportDir, `${filenamify(note.title, {replacement: '_'})}.${fileType}`)
          exportNote(note.key, storage.path, note.content, notePath, null, noteContent => {
            const regexIsNoteLink = /:note:([a-zA-Z0-9-]{20,36})/g
            return noteContent.replace(regexIsNoteLink, (before, arg1) => {
              const linkedNote = notes.filter(n => n.key === arg1)[0]
              if (!linkedNote) {
                return before
              }

              const linkedNoteFileName = `${filenamify(linkedNote.title, {replacement: '_'})}.${fileType}`
              if (linkedNote.folder === folderKey) {
                return linkedNoteFileName
              }
              const folder = storage.folders.filter(element => element.key === linkedNote.folder)[0]
              return `..${path.sep}${folder.name}${path.sep}${linkedNoteFileName}`
            })
          })
        })

      return {
        storage,
        folderKey,
        fileType,
        exportDir
      }
    })
}

module.exports = exportFolder
