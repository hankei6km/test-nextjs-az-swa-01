import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeMinifyWhitespace from 'rehype-minify-whitespace';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import merge from 'deepmerge';
import gh from 'hast-util-sanitize/lib/github.json';
import { Schema } from 'hast-util-sanitize';
import cheerio from 'cheerio';
import { TextlintKernel, TextlintKernelRule } from '@textlint/kernel';
import parseStyle from 'style-to-object';
// import camelcaseKeys from 'camelcase-keys';  // vedor prefix が jsx styleにならない?
import { Section, SectionContentHtmlChildren } from '../types/pageTypes';

const schema = merge(gh, {
  tagNames: ['picture', 'source'],
  attributes: {
    source: ['srcSet', 'sizes'],
    img: ['srcSet', 'sizes', 'className']
  }
});

const processorHtml = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeMinifyWhitespace)
  .use(rehypeSanitize, (schema as unknown) as Schema)
  .use(rehypeStringify)
  .freeze();

export function sanitizeHtml(html: string): string {
  let ret = '';
  processorHtml.process(html, (err, file) => {
    if (err) {
      console.error(err);
    }
    ret = String(file);
  });
  return ret;
}

export function styleToJsxStyle(
  s: string
): SectionContentHtmlChildren['style'] {
  const p = parseStyle(s) || {};
  const ret: SectionContentHtmlChildren['style'] = {};
  Object.entries(p).forEach((kv) => {
    const [first, ...names] = kv[0].split('-');
    const capitalizedNames = names.map(
      (r) => `${r[0].toLocaleUpperCase()}${r.slice(1)}`
    );
    const k = `${first}${capitalizedNames.join('')}`;

    ret[k] = kv[1];
  });
  return ret;
}

// とりあえず、普通に記述された markdown から変換されたときに body の直下にありそうなタグ.
// いまのところ小文字のみ.
export const SectionContentHtmlChildrenElemValues = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'div',
  'p',
  'blockquote',
  'code',
  'pre',
  'span',
  'img',
  'picture',
  'table',
  'ul',
  'ol',
  'dl',
  'hr',
  'a',
  'header',
  'footer',
  'section',
  'article',
  'aside'
] as const;
export function htmlToChildren(html: string): SectionContentHtmlChildren[] {
  // markdown の変換と sanitize には unifed を使っているので、少し迷ったが cheerio を利用.
  // (unified は typescript で利用するときに対応していないプラグインがたまにあるので)

  const ret: SectionContentHtmlChildren[] = [];
  const $ = cheerio.load(html);
  try {
    $('body')
      .contents()
      .each((_idx, elm) => {
        // https://stackoverflow.com/questions/31949521/scraping-text-with-cheerio
        // if (elm.nodeType === Node.ELEMENT_NODE) {
        if (elm.nodeType === 1) {
          if (
            SectionContentHtmlChildrenElemValues.some((v) => v === elm.tagName)
          ) {
            const $elm = $(elm);
            const attribs = elm.attribs ? { ...elm.attribs } : {};
            let style: SectionContentHtmlChildren['style'] = {};
            if (elm.attribs.style) {
              style = styleToJsxStyle(elm.attribs.style);
              delete attribs.style;
            }
            if (elm.attribs.class) {
              attribs.className = elm.attribs.class;
              delete attribs.class;
            }
            ret.push({
              tagName: elm.tagName,
              style: style,
              attribs: attribs,
              html: $elm.html() || ''
            });
          } else {
            throw new Error(
              `support only ${SectionContentHtmlChildrenElemValues.join(', ')}`
            );
          }
        } else {
          throw new Error('support only nodeType=Node.ELEMENT_NODE');
        }
      });
  } catch (_e) {
    ret.splice(0, ret.length, {
      tagName: 'div',
      style: {},
      attribs: {},
      html: html
    });
  }
  if (ret.length === 0) {
    ret.push({
      tagName: 'div',
      style: {},
      attribs: {},
      html: html
    });
  }
  return ret;
}

export type IndexedHtml = {
  index: {
    range: [
      // start and end pos.
      number,
      number
    ];
    // section  section contentHtml を特定する idx.
    sectionIdx: number;
    contentIdx: number;
    childIdx: number;
  }[];
  html: string;
};

export function getIndexedHtml(sections: Section[]): IndexedHtml {
  const ret: IndexedHtml = {
    index: [],
    html: ''
  };
  sections.forEach((section, sectionIdx) => {
    section.content.forEach((content, contentIdx) => {
      if (content.kind === 'html') {
        content.contentHtml.forEach((contentHtml, childIdx) => {
          if (contentHtml.tagName !== 'img') {
            const start = ret.html.length;
            ret.html = `${ret.html}<${contentHtml.tagName}>${contentHtml.html}</${contentHtml.tagName}>`;
            const index: IndexedHtml['index'][0] = {
              range: [start, ret.html.length - 1],
              sectionIdx: sectionIdx,
              contentIdx: contentIdx,
              childIdx: childIdx
            };
            ret.index.push(index);
          }
        });
      }
    });
  });
  return ret;
}

export function insertHtmlToSections(
  html: string,
  pos: number, // section を IndexedHtml の html に変換した場合の html の位置
  sections: Section[]
): Section[] {
  //  const ret = [...sections];
  const { index } = getIndexedHtml(sections);
  const idx = index.findIndex(
    ({ range }) => range[0] <= pos && pos <= range[1]
  );
  if (idx >= 0) {
    const { range, sectionIdx, contentIdx, childIdx } = index[idx];
    const content = sections[sectionIdx].content[contentIdx];
    if (content.kind === 'html') {
      const c = content.contentHtml[childIdx];
      let posInChild = pos - range[0] - (c.tagName.length + 2); // 2 = '<>'.length
      posInChild = posInChild < 0 ? 0 : posInChild;
      c.html = `${c.html.slice(0, posInChild)}${html}${c.html.slice(
        posInChild
      )}`;
    }
  } // 見つからないときは?
  return sections;
}
type TextLintInSectionsResult = {
  sections: Section[];
  messages: { message: string; id: string; severity: number }[];
  list: string;
};

export async function textLintInSections(
  sections: Section[],
  optionsPresets?: any[],
  messageStyle: { [key: string]: string } = { color: 'red' },
  idPrefix: string = ''
): Promise<TextLintInSectionsResult> {
  let ret: TextLintInSectionsResult = { sections, messages: [], list: '' };
  const indexedHtml = getIndexedHtml(sections);

  const kernel = new TextlintKernel();
  // todo: SiteServerSideConfig で定義できるようにする
  const presets = optionsPresets || [require('textlint-rule-preset-japanese')];
  const options = {
    // filePath: '/path/to/file.md',
    ext: '.html',
    plugins: [
      {
        pluginId: 'html',
        plugin: require('textlint-plugin-html')
      }
    ],
    rules: presets
      .map((preset) =>
        Object.entries(preset.rules).map<TextlintKernelRule>(([k, v]) => ({
          ruleId: k,
          rule: v as TextlintKernelRule['rule'],
          options: preset.rulesConfig[k] ? { ...preset.rulesConfig[k] } : {}
        }))
      )
      .reduce((a, v) => a.concat(v), [])
    // .flat(1)
    //https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
  };
  const results = [await kernel.lintText(indexedHtml.html, options)];
  if (results && results.length > 0 && results[0].messages.length > 0) {
    let slider = 0;
    const $wrapper = cheerio.load('<span/>')('span');
    Object.entries(messageStyle).forEach(([k, v]) => {
      $wrapper.css(k, v);
    });
    results[0].messages.forEach((m, i) => {
      const id = `${idPrefix}:textLintMessage:${i}`;
      $wrapper.attr('id', id);
      const html = $wrapper.html(m.message).parent().html();
      if (m.message && html) {
        ret.sections = insertHtmlToSections(
          html,
          m.index + slider,
          ret.sections
        );
        slider = slider + html.length;
        ret.messages.push({ message: m.message, id, severity: m.severity });
      }
    });
    const $dl = cheerio.load('<dl/>')('dl');
    ret.messages.forEach((m) => {
      const $d = cheerio.load('<dt></dt><dd><a/></dd>');
      // https://github.com/textlint/textlint/blob/master/packages/%40textlint/kernel/src/shared/rule-severity.ts
      // https://github.com/textlint/textlint/blob/master/packages/%40textlint/kernel/src/context/TextlintRuleSeverityLevelKeys.ts
      $d('dt').text(
        m.severity === 0 ? 'info' : m.severity === 1 ? 'warning' : 'error'
      );
      const $a = $d('a');
      $a.attr('href', `#${m.id}`);
      $a.text(m.message);
      $dl.append($d('body').children());
    });
    ret.list = $dl.parent().html() || '';
  }
  return ret;
}
