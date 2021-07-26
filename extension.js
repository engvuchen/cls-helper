const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
let matchAttr = /"([a-zA-Z]+)": (.+),/;
const matchComment = /\/\/\s(.+)/;
const matchComponentExit = /component\s*:(.+),/;
const matchAttrExit = /attributes\s*:/;
const matchValidityExit = /validity\s8:/;

// node_modules/@tencent/weadmin-components-bizadmin/src/v2/components/button/button.vue
// 'origincalendar',
// 'selectlist',
// 'upload-item',
let MAIN_COMPONENT_NAMES = [
  'aggregatedata',
  'button',
  'calendar',
  'chart',
  'checkbox',
  'container',
  'input',
  'link',
  'vpagination',
  'processor',
  'progress',
  'querybuilder',
  'radio',
  // 'resourceMark',
  'richtext',
  'schedule',
  'select',
  'tab',
  'table',
  'tag',
  'text',
  'textarea',
  'tree',
  'upload',
];

function activate(context) {
  console.log('cls-helper running');

  let snippetPath = path.resolve(`${process.cwd()}/.vscode/snippets.code-snippets`);
  fs.access(snippetPath, constants.F_OK | constants.W_OK, err => {
    if (err) {
      console.error(`${snippetPath} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`);
    } else {
      let parseResult = JSON.parse(fs.readFileSync(snippetPath));
      let complements = {};
      MAIN_COMPONENT_NAMES.forEach(componentName => {
        getComplementItem(componentName, 'attributes', parseResult, complements);
        getComplementItem(componentName, 'validity', parseResult, complements);
      });
    }
  });

  // # 根据指定模式，动态生成匹配文本
  const provider = vscode.languages.registerCompletionItemProvider(
    'vue',
    {
      provideCompletionItems(document, position) {
        const curLine = document.lineAt(position).text.substr(0, position.character);
        // 当前行有 'component' +'attributes' / 'validity'
        if ((curLine.includes('component') && curLine.includes('attributes')) || curLine.includes('validity')) {
          let componentName = curLine.match(matchComponentExit);

          return undefined;
        }

        /**
         * 1. 仅指定 attributes
         * 1.1 当前行 或 向上找, 可以找到 attribute
         * 1.2 发现 '}'
         *
         */

        // new vscode.CompletionItem => 返回对象
        // 匹配结果
        // icon类型: Value / Method / Snippet
        return {
          label: tag, // 提示符
          sortText: `0${tag}`, // 检索见过排序
          insertText: new SnippetString(prettyHTML('<' + snippets.join(''), { indent_size: this.size }).substr(1)), // 插入文本
          kind: CompletionItemKind.Snippet, // 文本图标
          // tagVal.version
          detail: `cls-ui`,
          documentation: tagVal.description, // 描述
        };
      },
    },
    ' ',
    ':'
  );
  /**
   * 1. 通过 未写完的属性名联想（attributes.hi） 。拉取 snippet；
   * 2. 通过 写完的属性名联想（attributes.hide）。拉取 值的范围；
   */
  /**
   *
   * ' ',
   * ':',
   *
   * '"',
   *"'"
   */

  context.subscriptions.push(provider);
}
function deactivate() {}

function getPreTag(position) {
  // position => {line, character}
  let line = position.line;
  let tag = null;
  let txt = this.getTextBeforePosition(position);

  /**
   * line 往上最多回溯10行，直到找到匹配的 标签
   */
  while (position.line - line < 10 && line >= 0) {
    if (line !== position.line) {
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

function getComplementItem(componentName = '', attrName = '', parseResult = {}, collection = {}) {
  // { button: { attributes: { hide: complementItem }, validity}, ... }
  let keyName = `@cls cls-${componentName}-${attrName}`;
  if (parseResult[keyName]) {
    let { body } = parseResult[keyName];

    let complementItem = handleSnippetBody(componentName, attrName, body);
    if (collection[componentName][attrName]) {
      Object.assign(collection[componentName][attrName], complementItem);
    } else {
      collection[componentName][attrName] = complementItem;
    }
  }
}
function handleSnippetBody(componentName = '', attrType = '', body = []) {
  body.forEach((curStr, index) => {
    let matchAttrResult = curStr.match(matchAttr);
    let attrName = matchAttrResult ? matchAttrResult[1] : '';
    let attrValue = matchAttrResult ? matchAttrResult[2] : '';

    let matchCommentResult = curStr.match(matchComment);
    let comment = matchCommentResult ? matchCommentResult[1] : '';

    // console.log(attrName, attrValue, comment);

    if (attrName && attrValue) {
      return {
        attrName: {
          snippet: {
            detail: `cls-ui`,
            kind: CompletionItemKind.Snippet,
            label: componentName,
            sortText: `0${componentName}${attrType}${attrName}`,
            insertText: new SnippetString(`${attrName}: \${2:${attrValue}}`),
            documentation: comment || '',
          },
          value: {
            detail: `cls-ui`,
            kind: CompletionItemKind.Snippet,
            label: componentName,
            sortText: `0${componentName}${attrType}${attrName}`,
            // new SnippetString(`\${1:${attrValue}}`)
            insertText: attrValue,
            documentation: comment || '',
          },
        },
      };
    }
  });

  var result = JSON.parse(body.join(''));
  console.log('result', result, typeof result);
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
