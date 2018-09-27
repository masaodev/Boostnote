require('babel-register')({
  presets: ['es2015']
})
const exportStorage = require('./browser/main/lib/dataApi/exportStorage')
const meow = require('meow')

const cli = meow(`
  Usage:
    export [baseDir] [options]
  Commands:
    baseDir         Specify the input path, which includes 'boostnote.json' ( default: process.cwd() )
  Options:
    --output, -o    Specify the output path  ( default: ./out )
    --version       Output version number
    --help          Output usage information
`, {
  flags: {
    output: {
      type: 'string',
      default: './out',
      alias: 'o'
    }
  }
})

const config = {
  inputPath: cli.input[0] || null,
  outputPath: cli.flags.output || null
}

if (cli.flags.output === true) {
  console.error(`Value for 'output' of type '[String]' required.`)
} else {
  const storageKey = 'doesnotmatter'
  const storageName = 'neitherdoesthis'

  const Storage = require('dom-storage')
  global.localStorage = new Storage(null, { strict: true })
  localStorage.setItem('storages', JSON.stringify([{ key: storageKey, name: storageName, path: config.inputPath, isOpen: true }]))

  exportStorage(storageKey, 'md', config.outputPath)
}
