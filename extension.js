// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('cls-helper running');

  // # 写死匹配文本
  const provider1 = vscode.languages.registerCompletionItemProvider('plaintext', {
    provideCompletionItems(document, position, token, context) {
      // a simple completion item which inserts `Hello World!`
      const simpleCompletion = new vscode.CompletionItem('Hello World!');

      // a completion item that inserts its text as snippet,
      // the `insertText`-property is a `SnippetString` which will be
      // honored by the editor.
      const snippetCompletion = new vscode.CompletionItem('Good part of the day');
      snippetCompletion.insertText = new vscode.SnippetString(
        'Good ${1|morning,afternoon,evening|}. It is ${1}, right?'
      );
      snippetCompletion.documentation = new vscode.MarkdownString(
        'Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.'
      );

      // a completion item that can be accepted by a commit character,
      // the `commitCharacters`-property is set which means that the completion will
      // be inserted and then the character will be typed.
      const commitCharacterCompletion = new vscode.CompletionItem('console');
      commitCharacterCompletion.commitCharacters = ['.'];
      commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

      // a completion item that retriggers IntelliSense when being accepted,
      // the `command`-property is set which the editor will execute after
      // completion has been inserted. Also, the `insertText` is set so that
      // a space is inserted after `new`
      const commandCompletion = new vscode.CompletionItem('new');
      commandCompletion.kind = vscode.CompletionItemKind.Keyword;
      commandCompletion.insertText = 'new ';
      commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

      // return all completion items as array
      return [simpleCompletion, snippetCompletion, commitCharacterCompletion, commandCompletion];
    },
  });

  /**
   * 
   *    return {
      label: tag,
      sortText: `0${id}${tag}`,
      insertText: new SnippetString(prettyHTML('<' + snippets.join(''), {indent_size: this.size}).substr(1)),
      kind: CompletionItemKind.Snippet,
      detail: `element-ui ${tagVal.version ? `(version: ${tagVal.version})` : ''}`,
      documentation: tagVal.description
    };
   */

  const provider2 = vscode.languages.registerCompletionItemProvider(
    'plaintext',
    {
      provideCompletionItems(document, position) {
        // get all text until the `position` and check if it reads `console.`
        // and if so then complete if `log`, `warn`, and `error`
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.endsWith('console.')) {
          return undefined;
        }

        console.log('linePrefix', linePrefix);

        // 这个调用方法返回对象
        console.log(new vscode.CompletionItem('log', vscode.CompletionItemKind.Method));

        return [
          new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
          new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
          new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
        ];
      },
    },
    '.' // triggered whenever a '.' is being typed
  );

  context.subscriptions.push(provider1, provider2);
}

// this method is called when your extension is deactivated
function deactivate() {}

function getPreTag() {
  let line = this._position.line;
  let tag = null;
  let txt = this.getTextBeforePosition(this._position);

  console.log('this._position.line', this._position.line, 'line', line);

  /**
   * line 往上最多回溯10行，直到找到匹配的 标签
   */
  while (this._position.line - line < 10 && line >= 0) {
    if (line !== this._position.line) {
      txt = this._document.lineAt(line).text;
    }

    console.log('txt', txt);
    tag = this.matchTag(this.tagReg, txt, line);

    if (tag === 'break') return;
    if (tag) return tag;
    line--;
  }
  return;
}

/**
 *
 * @param position 光标位置
 * @returns 指定范围内的文本（某一行文字的开始、结束？）
 */
function getTextBeforePosition(position) {
  var start = new Position(position.line, 0);
  var range = new Range(start, position);

  console.log('getTextBeforePosition', this._document.getText(range));

  return this._document.getText(range);
}

module.exports = {
  activate,
  deactivate,
};
