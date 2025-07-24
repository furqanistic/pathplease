// File: out/extension.js
'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        var desc = Object.getOwnPropertyDescriptor(m, k)
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k]
            },
          }
        }
        Object.defineProperty(o, k2, desc)
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.deactivate = exports.activate = void 0
// File: src/extension.ts
const path = __importStar(require('path'))
const vscode = __importStar(require('vscode'))
class PathPleaseManager {
  constructor(context) {
    this.disposables = []
    this.outputChannel = vscode.window.createOutputChannel('PathPlease')
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )
    this.setupStatusBar()
    this.registerCommands(context)
    this.setupEventListeners()
    this.log('PathPlease extension activated successfully')
  }
  setupStatusBar() {
    this.statusBarItem.command = 'pathplease.toggleAutoAdd'
    this.updateStatusBar()
    this.statusBarItem.show()
    this.disposables.push(this.statusBarItem)
  }
  registerCommands(context) {
    const commands = [
      vscode.commands.registerCommand('pathplease.addPath', () =>
        this.addPathComment()
      ),
      vscode.commands.registerCommand('pathplease.removePath', () =>
        this.removePathComment()
      ),
      vscode.commands.registerCommand('pathplease.toggleAutoAdd', () =>
        this.toggleAutoAdd()
      ),
      vscode.commands.registerCommand('pathplease.refreshPath', () =>
        this.refreshPathComment()
      ),
      vscode.commands.registerCommand('pathplease.showOutput', () =>
        this.outputChannel.show()
      ),
    ]
    commands.forEach((command) => {
      context.subscriptions.push(command)
      this.disposables.push(command)
    })
  }
  setupEventListeners() {
    // Auto-add on editor change
    const onEditorChange = vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (this.shouldAutoProcess(editor?.document)) {
          this.addPathComment(editor?.document)
        }
      }
    )
    // Auto-add on save
    const onSave = vscode.workspace.onDidSaveTextDocument((document) => {
      const config = this.getConfig()
      if (config.autoAddOnSave && this.shouldAutoProcess(document)) {
        this.addPathComment(document)
      }
    })
    // Update status bar on config change
    const onConfigChange = vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('pathplease')) {
        this.updateStatusBar()
      }
    })
    this.disposables.push(onEditorChange, onSave, onConfigChange)
  }
  getConfig() {
    const config = vscode.workspace.getConfiguration('pathplease')
    return {
      autoAddOnOpen: config.get('autoAddOnOpen', true),
      autoAddOnSave: config.get('autoAddOnSave', false),
      showSkipNotifications: config.get('showSkipNotifications', false),
      excludePatterns: config.get('excludePatterns', []),
      commentStyles: config.get('commentStyles', {}),
      pathFormat: config.get('pathFormat', 'relative'),
      insertPosition: config.get('insertPosition', 'top'),
      enableGitIntegration: config.get('enableGitIntegration', false),
    }
  }
  shouldAutoProcess(document) {
    if (!document) return false
    const config = this.getConfig()
    if (!config.autoAddOnOpen) return false
    const fileName = path.basename(document.fileName)
    // Check if file should be excluded
    if (this.shouldExcludeFile(document.uri.fsPath)) {
      this.log(`Auto-process skipped: ${fileName} - excluded by patterns`)
      return false
    }
    // Check if file type supports comments
    if (!this.canHaveComments(document.languageId, fileName)) {
      this.log(
        `Auto-process skipped: ${fileName} - file type doesn't support comments`
      )
      return false
    }
    // Check if path comment already exists
    if (this.hasPathComment(document)) {
      this.log(
        `Auto-process skipped: ${fileName} - path comment already exists`
      )
      return false
    }
    return true
  }
  async addPathComment(document) {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      this.showError('No active editor found')
      return
    }
    const doc = document || editor.document
    const config = this.getConfig()
    try {
      const displayPath = await this.getDisplayPath(doc)
      const commentStyle = this.getCommentStyle(doc.languageId)
      if (!commentStyle) {
        this.log(`No comment style available for language: ${doc.languageId}`)
        return
      }
      if (this.hasPathComment(doc)) {
        await this.updatePathComment(editor, displayPath, commentStyle)
        return
      }
      const insertPosition = this.getInsertPosition(doc, config.insertPosition)
      const pathComment = this.formatComment(displayPath, commentStyle)
      await editor.edit((editBuilder) => {
        editBuilder.insert(insertPosition, pathComment + '\n')
      })
      this.log(`Added path comment to: ${doc.fileName}`)
    } catch (error) {
      this.handleError('Failed to add path comment', error)
    }
  }
  async removePathComment() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      this.showError('No active editor found')
      return
    }
    try {
      const doc = editor.document
      const commentRange = this.findPathCommentRange(doc)
      if (commentRange) {
        await editor.edit((editBuilder) => {
          editBuilder.delete(commentRange)
        })
        this.showInfo('Path comment removed')
        this.log(`Removed path comment from: ${doc.fileName}`)
      } else {
        this.showWarning('No path comment found')
      }
    } catch (error) {
      this.handleError('Failed to remove path comment', error)
    }
  }
  async refreshPathComment() {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    if (this.hasPathComment(editor.document)) {
      await this.removePathComment()
      // Small delay to ensure removal is complete
      setTimeout(() => this.addPathComment(), 100)
    } else {
      await this.addPathComment()
    }
  }
  async getDisplayPath(document) {
    const config = this.getConfig()
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)
    switch (config.pathFormat) {
      case 'absolute':
        return document.uri.fsPath
      case 'filename':
        return path.basename(document.fileName)
      case 'relative':
      default:
        if (workspaceFolder) {
          let relativePath = path.relative(
            workspaceFolder.uri.fsPath,
            document.uri.fsPath
          )
          return relativePath.replace(/\\/g, '/')
        }
        return document.fileName
    }
  }
  getInsertPosition(document, insertPosition) {
    if (insertPosition === 'after-shebang' && document.lineCount > 0) {
      const firstLine = document.lineAt(0)
      if (firstLine.text.startsWith('#!')) {
        return new vscode.Position(1, 0)
      }
    }
    return new vscode.Position(0, 0)
  }
  formatComment(path, style) {
    return `${style.start} File: ${path} ${style.end}`.trim()
  }
  hasPathComment(document) {
    if (document.lineCount === 0) return false
    // Check first 5 lines for path comments (more thorough)
    const linesToCheck = Math.min(5, document.lineCount)
    for (let i = 0; i < linesToCheck; i++) {
      const line = document.lineAt(i).text.trim()
      if (this.isPathCommentLine(line)) {
        return true
      }
    }
    return false
  }
  findPathCommentRange(document) {
    const linesToCheck = Math.min(5, document.lineCount)
    for (let i = 0; i < linesToCheck; i++) {
      const line = document.lineAt(i)
      if (this.isPathCommentLine(line.text.trim())) {
        return new vscode.Range(i, 0, i + 1, 0)
      }
    }
    return null
  }
  isPathCommentLine(line) {
    // More comprehensive path comment detection
    const patterns = [
      /^\s*(\/\/|\/\*|#|<!--|;;|%|--|\*|;|\")\s*File:\s*.+$/i,
      /^\s*(\/\*.*File:.*\*\/)\s*$/i,
      /^\s*(\/\/.*File:.*)\s*$/i,
      /^\s*(#.*File:.*)\s*$/i,
      /^\s*(<!--.*File:.*-->)\s*$/i,
    ]
    return patterns.some((pattern) => pattern.test(line))
  }
  async updatePathComment(editor, newPath, style) {
    const doc = editor.document
    const commentRange = this.findPathCommentRange(doc)
    if (commentRange) {
      const newComment = this.formatComment(newPath, style)
      await editor.edit((editBuilder) => {
        editBuilder.replace(
          new vscode.Range(
            commentRange.start.line,
            0,
            commentRange.start.line,
            doc.lineAt(commentRange.start.line).text.length
          ),
          newComment
        )
      })
    }
  }
  shouldExcludeFile(filePath) {
    const config = this.getConfig()
    const fileName = path.basename(filePath)
    const fileNameLower = fileName.toLowerCase()
    // Check exclude patterns
    for (const pattern of config.excludePatterns) {
      const regex = new RegExp(
        pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
      )
      if (regex.test(filePath) || regex.test(fileName)) {
        return true
      }
    }
    // Exclude untitled documents
    if (filePath.includes('Untitled-') || fileName.startsWith('Untitled')) {
      return true
    }
    // Exclude common documentation and config files
    const documentationFiles = [
      'readme.md',
      'readme.txt',
      'readme.rst',
      'changelog.md',
      'changelog.txt',
      'license',
      'license.md',
      'license.txt',
      'contributing.md',
      'code_of_conduct.md',
      'security.md',
      'support.md',
      '.gitignore',
      '.gitattributes',
      '.eslintrc',
      '.prettierrc',
      '.env',
      '.env.example',
      'dockerfile',
      'docker-compose.yml',
    ]
    if (documentationFiles.includes(fileNameLower)) {
      return true
    }
    return false
  }
  canHaveComments(languageId, fileName) {
    const noCommentLanguages = new Set([
      'json',
      'jsonc',
      'json5',
      'binary',
      'image',
      'pdf',
      'zip',
      'tar',
      'gz',
      'exe',
      'dll',
      'so',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'bmp',
      'ico',
      'mp4',
      'avi',
      'mov',
      'wmv',
      'flv',
      'webm',
      'mp3',
      'wav',
      'flac',
      'aac',
      'ogg',
    ])
    if (noCommentLanguages.has(languageId.toLowerCase())) {
      return false
    }
    const fileExtension = path.extname(fileName).toLowerCase()
    const noCommentExtensions = new Set([
      '.json',
      '.jsonc',
      '.json5',
      '.lock',
      '.log',
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.svg',
      '.webp',
      '.bmp',
      '.ico',
      '.mp4',
      '.avi',
      '.mov',
      '.wmv',
      '.flv',
      '.webm',
      '.mp3',
      '.wav',
      '.flac',
      '.aac',
      '.ogg',
      '.pdf',
      '.zip',
      '.tar',
      '.gz',
      '.rar',
      '.7z',
      '.exe',
      '.dll',
      '.so',
      '.dylib',
      '.bin',
      '.dat',
      '.db',
      '.sqlite',
    ])
    if (noCommentExtensions.has(fileExtension)) {
      return false
    }
    const noCommentFiles = new Set([
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'composer.lock',
      'pipfile.lock',
      'poetry.lock',
      'cargo.lock',
      'gemfile.lock',
    ])
    if (noCommentFiles.has(fileName.toLowerCase())) {
      return false
    }
    return true
  }
  getCommentStyle(languageId) {
    const config = this.getConfig()
    // Check custom styles first
    if (config.commentStyles[languageId]) {
      return config.commentStyles[languageId]
    }
    const styles = {
      // C-style single line
      javascript: { start: '//', end: '' },
      typescript: { start: '//', end: '' },
      javascriptreact: { start: '//', end: '' },
      typescriptreact: { start: '//', end: '' },
      java: { start: '//', end: '' },
      csharp: { start: '//', end: '' },
      cpp: { start: '//', end: '' },
      c: { start: '//', end: '' },
      go: { start: '//', end: '' },
      rust: { start: '//', end: '' },
      php: { start: '//', end: '' },
      swift: { start: '//', end: '' },
      kotlin: { start: '//', end: '' },
      dart: { start: '//', end: '' },
      scala: { start: '//', end: '' },
      groovy: { start: '//', end: '' },
      zig: { start: '//', end: '' },
      d: { start: '//', end: '' },
      // CSS-style
      css: { start: '/*', end: '*/', multiLine: true },
      less: { start: '//', end: '' },
      scss: { start: '//', end: '' },
      sass: { start: '//', end: '' },
      // Hash-style
      python: { start: '#', end: '' },
      ruby: { start: '#', end: '' },
      perl: { start: '#', end: '' },
      bash: { start: '#', end: '' },
      shell: { start: '#', end: '' },
      zsh: { start: '#', end: '' },
      fish: { start: '#', end: '' },
      powershell: { start: '#', end: '' },
      yaml: { start: '#', end: '' },
      yml: { start: '#', end: '' },
      toml: { start: '#', end: '' },
      ini: { start: '#', end: '' },
      conf: { start: '#', end: '' },
      dockerfile: { start: '#', end: '' },
      makefile: { start: '#', end: '' },
      cmake: { start: '#', end: '' },
      r: { start: '#', end: '' },
      julia: { start: '#', end: '' },
      terraform: { start: '#', end: '' },
      hcl: { start: '#', end: '' },
      nix: { start: '#', end: '' },
      graphql: { start: '#', end: '' },
      crystal: { start: '#', end: '' },
      nim: { start: '#', end: '' },
      elixir: { start: '#', end: '' },
      // HTML-style
      html: { start: '<!--', end: '-->', multiLine: true },
      xml: { start: '<!--', end: '-->', multiLine: true },
      svg: { start: '<!--', end: '-->', multiLine: true },
      vue: { start: '<!--', end: '-->', multiLine: true },
      svelte: { start: '<!--', end: '-->', multiLine: true },
      markdown: { start: '<!--', end: '-->', multiLine: true },
      // SQL-style
      sql: { start: '--', end: '' },
      mysql: { start: '--', end: '' },
      postgresql: { start: '--', end: '' },
      sqlite: { start: '--', end: '' },
      plsql: { start: '--', end: '' },
      lua: { start: '--', end: '' },
      haskell: { start: '--', end: '' },
      elm: { start: '--', end: '' },
      ada: { start: '--', end: '' },
      // Lisp-style
      lisp: { start: ';', end: '' },
      scheme: { start: ';', end: '' },
      clojure: { start: ';', end: '' },
      elisp: { start: ';', end: '' },
      // Other specific styles
      vim: { start: '"', end: '' },
      erlang: { start: '%', end: '' },
      latex: { start: '%', end: '' },
      matlab: { start: '%', end: '' },
      fortran: { start: '!', end: '' },
      pascal: { start: '//', end: '' },
      fsharp: { start: '//', end: '' },
      ocaml: { start: '(*', end: '*)', multiLine: true },
      proto: { start: '//', end: '' },
      wat: { start: ';;', end: '' },
      v: { start: '//', end: '' },
      asm: { start: ';', end: '' },
      assembly: { start: ';', end: '' },
    }
    return styles[languageId.toLowerCase()] || null
  }
  updateStatusBar() {
    const config = this.getConfig()
    if (config.autoAddOnOpen) {
      this.statusBarItem.text = '$(file-text) PathPlease'
      this.statusBarItem.tooltip =
        'PathPlease is active. Click to toggle auto-add.'
      this.statusBarItem.backgroundColor = undefined
    } else {
      this.statusBarItem.text = '$(file-text) PathPlease OFF'
      this.statusBarItem.tooltip =
        'PathPlease auto-add is disabled. Click to enable.'
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        'statusBarItem.warningBackground'
      )
    }
  }
  async toggleAutoAdd() {
    const config = vscode.workspace.getConfiguration('pathplease')
    const currentValue = config.get('autoAddOnOpen', true)
    await config.update(
      'autoAddOnOpen',
      !currentValue,
      vscode.ConfigurationTarget.Global
    )
    const status = !currentValue ? 'enabled' : 'disabled'
    this.showInfo(`PathPlease auto-add ${status}`)
    this.updateStatusBar()
  }
  log(message) {
    const timestamp = new Date().toISOString()
    this.outputChannel.appendLine(`[${timestamp}] ${message}`)
  }
  showInfo(message) {
    vscode.window.showInformationMessage(message)
    this.log(`INFO: ${message}`)
  }
  showWarning(message) {
    vscode.window.showWarningMessage(message)
    this.log(`WARNING: ${message}`)
  }
  showError(message) {
    vscode.window.showErrorMessage(message)
    this.log(`ERROR: ${message}`)
  }
  handleError(message, error) {
    const errorMessage = `${message}: ${error?.message || error}`
    this.showError(errorMessage)
    console.error(errorMessage, error)
  }
  dispose() {
    this.disposables.forEach((d) => d.dispose())
    this.outputChannel.dispose()
  }
}
let pathPleaseManager
function activate(context) {
  pathPleaseManager = new PathPleaseManager(context)
  // Add to subscriptions for proper cleanup
  context.subscriptions.push({
    dispose: () => pathPleaseManager.dispose(),
  })
}
exports.activate = activate
function deactivate() {
  if (pathPleaseManager) {
    pathPleaseManager.dispose()
  }
}
exports.deactivate = deactivate
//# sourceMappingURL=extension.js.map
