import {
  styleToJsxStyle,
  htmlToChildren,
  getIndexedHtml,
  insertHtmlToSections,
  textLintInSections
} from './html';

describe('styleToJsxStyle()', () => {
  it('should returns jsx style from style attribute', () => {
    expect(styleToJsxStyle('max-width:100%')).toEqual({ maxWidth: '100%' });
    expect(styleToJsxStyle('max-width:100%; background-color:red;')).toEqual({
      maxWidth: '100%',
      backgroundColor: 'red'
    });
    // https://stackoverflow.com/questions/32100495/how-do-i-apply-vendor-prefixes-to-inline-styles-in-reactjs
    expect(styleToJsxStyle('-webkit-transform: rotate(90deg)')).toEqual({
      WebkitTransform: 'rotate(90deg)'
    });
    expect(
      styleToJsxStyle('width:500;height:200px;-webkit-transform: rotate(90deg)')
    ).toEqual({
      width: '500',
      height: '200px',
      WebkitTransform: 'rotate(90deg)'
    });
  });
});

describe('htmlToChildren()', () => {
  it('should returns spread html array', () => {
    expect(htmlToChildren('<p>test</p>')).toEqual([
      { tagName: 'p', style: {}, attribs: {}, html: 'test' }
    ]);
    expect(htmlToChildren('<p>test1</p><p id="t2">test2</p>')).toEqual([
      { tagName: 'p', style: {}, attribs: {}, html: 'test1' },
      { tagName: 'p', style: {}, attribs: { id: 't2' }, html: 'test2' }
    ]);
    expect(
      htmlToChildren('<p>test1</p><p id="t2" class="c2">test2</p>')
    ).toEqual([
      { tagName: 'p', style: {}, attribs: {}, html: 'test1' },
      {
        tagName: 'p',
        style: {},
        attribs: { id: 't2', className: 'c2' },
        html: 'test2'
      }
    ]);
    expect(htmlToChildren('<p>test1</p><hr/><p>test2</p>')).toEqual([
      { tagName: 'p', style: {}, attribs: {}, html: 'test1' },
      { tagName: 'hr', style: {}, attribs: {}, html: '' },
      { tagName: 'p', style: {}, attribs: {}, html: 'test2' }
    ]);
    expect(htmlToChildren('<img src="/abc" alt="abc thumb"/>')).toEqual([
      {
        tagName: 'img',
        style: {},
        attribs: { src: '/abc', alt: 'abc thumb' },
        html: ''
      }
    ]);
    expect(
      htmlToChildren(
        '<img src="/abc" alt="abc thumb" data-opt="?q=123&abc=efg"/>'
      )
    ).toEqual([
      {
        tagName: 'img',
        style: {},
        attribs: {
          src: '/abc',
          alt: 'abc thumb',
          'data-opt': '?q=123&abc=efg' // dataSet ではない?
        },
        html: ''
      }
    ]);
    expect(
      htmlToChildren('<a href="/"><img src="/abc" alt="abc thumb"/></a>')
    ).toEqual([
      {
        tagName: 'a',
        style: {},
        attribs: { href: '/' },
        html: '<img src="/abc" alt="abc thumb">'
      }
    ]);
    expect(
      htmlToChildren('<a href="/"><p>test1</p>test2<p class="c3">test3</p></a>')
    ).toEqual([
      {
        tagName: 'a',
        style: {},
        attribs: { href: '/' },
        html: '<p>test1</p>test2<p class="c3">test3</p>'
      }
    ]);
    expect(
      htmlToChildren(
        '<p>test1</p><a href="/" id="a1" class="ca" ><img src="/abc" alt="abc thumb" data-opt="?q=123&abc=efg"/></a><p>test2</p>'
      )
    ).toEqual([
      { tagName: 'p', style: {}, attribs: {}, html: 'test1' },
      {
        tagName: 'a',
        style: {},
        attribs: { href: '/', id: 'a1', className: 'ca' },
        html: '<img src="/abc" alt="abc thumb" data-opt="?q=123&amp;abc=efg">'
      },
      { tagName: 'p', style: {}, attribs: {}, html: 'test2' }
    ]);
    expect(
      htmlToChildren('<img src="/abc" alt="abc thumb" style="maxWidth:100%" />')
    ).toEqual([
      {
        tagName: 'img',
        style: {
          maxWidth: '100%'
        },
        attribs: { src: '/abc', alt: 'abc thumb' },
        html: ''
      }
    ]);
  });
  it('should fallbacked', () => {
    expect(htmlToChildren('')).toEqual([
      { tagName: 'div', style: {}, attribs: {}, html: '' }
    ]);
    expect(htmlToChildren('test')).toEqual([
      { tagName: 'div', style: {}, attribs: {}, html: 'test' }
    ]);
    expect(htmlToChildren('test<p>123</p><hr/>abc')).toEqual([
      { tagName: 'div', style: {}, attribs: {}, html: 'test<p>123</p><hr/>abc' }
    ]);
    expect(htmlToChildren('test<p>123</p><hr/>abc')).toEqual([
      { tagName: 'div', style: {}, attribs: {}, html: 'test<p>123</p><hr/>abc' }
    ]);
    expect(
      htmlToChildren('<p>test</p><button>abc</button><p>test</p>')
    ).toEqual([
      {
        tagName: 'div',
        style: {},
        attribs: {},
        html: '<p>test</p><button>abc</button><p>test</p>'
      }
    ]);
  });
});

describe('getIndexedHtml()', () => {
  it('should get index html', () => {
    expect(
      getIndexedHtml([
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual({
      index: [
        {
          range: [0, 11],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 0
        }
      ],
      html: '<p>test1</p>'
    });
    expect(
      getIndexedHtml([
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual({
      index: [
        {
          range: [0, 11],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 0
        },
        {
          range: [12, 23],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 1
        }
      ],
      html: '<p>test1</p><p>test2</p>'
    });
    expect(
      getIndexedHtml([
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            },
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'div',
                  style: {},
                  attribs: {},
                  html: 'test3'
                },
                {
                  tagName: 'div',
                  style: {},
                  attribs: {},
                  html: 'test4'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual({
      index: [
        {
          range: [0, 11],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 0
        },
        {
          range: [12, 23],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 1
        },
        {
          range: [24, 39],
          sectionIdx: 0,
          contentIdx: 1,
          childIdx: 0
        },
        {
          range: [40, 55],
          sectionIdx: 0,
          contentIdx: 1,
          childIdx: 1
        }
      ],
      html: '<p>test1</p><p>test2</p><div>test3</div><div>test4</div>'
    });
    expect(
      getIndexedHtml([
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            }
          ]
        },
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'div',
                  style: {},
                  attribs: {},
                  html: 'test3'
                },
                {
                  tagName: 'div',
                  style: {},
                  attribs: {},
                  html: 'test4'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual({
      index: [
        {
          range: [0, 11],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 0
        },
        {
          range: [12, 23],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 1
        },
        {
          range: [24, 39],
          sectionIdx: 1,
          contentIdx: 0,
          childIdx: 0
        },
        {
          range: [40, 55],
          sectionIdx: 1,
          contentIdx: 0,
          childIdx: 1
        }
      ],
      html: '<p>test1</p><p>test2</p><div>test3</div><div>test4</div>'
    });
  });
  it('skip un-targeted kind/element', () => {
    expect(
      getIndexedHtml([
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'img',
                  style: {},
                  attribs: {},
                  html: 'test2'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test3'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual({
      index: [
        {
          range: [0, 11],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 0
        },
        {
          range: [12, 23],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 2
        }
      ],
      html: '<p>test1</p><p>test3</p>'
    });
  });
});

describe('insertHtmlToSections()', () => {
  it('should insert html to sections', () => {
    expect(
      insertHtmlToSections('<span>ins1</span>', 16, [
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual([
      {
        title: '',
        content: [
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test1'
              },
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 't<span>ins1</span>est2'
              }
            ]
          }
        ]
      }
    ]);
    expect(
      insertHtmlToSections('<span>ins1</span>', 3, [
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual([
      {
        title: '',
        content: [
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: '<span>ins1</span>test1'
              },
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test2'
              }
            ]
          }
        ]
      }
    ]);
    expect(
      insertHtmlToSections('<span>ins1</span>', 8, [
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual([
      {
        title: '',
        content: [
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test1<span>ins1</span>'
              },
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test2'
              }
            ]
          }
        ]
      }
    ]);
    expect(
      insertHtmlToSections('<span>ins1</span>', 31, [
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            },
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'div',
                  style: {},
                  attribs: {},
                  html: 'test3'
                },
                {
                  tagName: 'div',
                  style: {},
                  attribs: {},
                  html: 'test4'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual([
      {
        title: '',
        content: [
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test1'
              },
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test2'
              }
            ]
          },
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'div',
                style: {},
                attribs: {},
                html: 'te<span>ins1</span>st3'
              },
              {
                tagName: 'div',
                style: {},
                attribs: {},
                html: 'test4'
              }
            ]
          }
        ]
      }
    ]);
  });
  it('should adjust insert position', () => {
    expect(
      insertHtmlToSections('<span>ins1</span>', 2, [
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual([
      {
        title: '',
        content: [
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: '<span>ins1</span>test1'
              },
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test2'
              }
            ]
          }
        ]
      }
    ]);
    expect(
      insertHtmlToSections('<span>ins1</span>', 9, [
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            }
          ]
        }
      ])
    ).toStrictEqual([
      {
        title: '',
        content: [
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test1<span>ins1</span>'
              },
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test2'
              }
            ]
          }
        ]
      }
    ]);
  });
});

describe('textLintInSections()', () => {
  const presets = [require('textlint-rule-preset-japanese')];
  it('should lints html that contained sections', async () => {
    const res = await textLintInSections(
      [
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test1'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: '今日は、おいしい、ものが、食べれた。'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'テストが成功するとこが確認できた。'
                },
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'test2'
                }
              ]
            }
          ]
        }
      ],
      presets
    );
    expect(res.sections).toStrictEqual([
      {
        title: '',
        content: [
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test1'
              },
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html:
                  // attr の並びはは保障されていないはず
                  '今日は、おいしい、ものが<span style="color: red;" id=":textLintMessage:0">一つの文で"、"を3つ以上使用しています</span>、食べ<span style="color: red;" id=":textLintMessage:1">ら抜き言葉を使用しています。</span>れた。'
              },
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html:
                  'テストが成功するとこ<span style="color: red;" id=":textLintMessage:2">一文に二回以上利用されている助詞 "が" がみつかりました。</span>が確認できた。'
              },
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'test2'
              }
            ]
          }
        ]
      }
    ]);
    expect(res.messages).toStrictEqual([
      {
        id: ':textLintMessage:0',
        severity: 2,
        message: '一つの文で"、"を3つ以上使用しています'
      },
      {
        id: ':textLintMessage:1',
        severity: 2,
        message: 'ら抜き言葉を使用しています。'
      },
      {
        id: ':textLintMessage:2',
        severity: 2,
        message: '一文に二回以上利用されている助詞 "が" がみつかりました。'
      }
    ]);
    expect(res.list).toEqual(
      '<dl><dt>error</dt><dd><a href="#:textLintMessage:0">一つの文で"、"を3つ以上使用しています</a></dd><dt>error</dt><dd><a href="#:textLintMessage:1">ら抜き言葉を使用しています。</a></dd><dt>error</dt><dd><a href="#:textLintMessage:2">一文に二回以上利用されている助詞 "が" がみつかりました。</a></dd></dl>'
    );
  });
  it('should apply style to messages', async () => {
    const res = await textLintInSections(
      [
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'テストが成功するとこが確認できた。'
                }
              ]
            }
          ]
        }
      ],
      presets,
      {
        'background-color': '#ff0000'
      }
    );
    expect(res.sections).toStrictEqual([
      {
        title: '',
        content: [
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html:
                  'テストが成功するとこ<span style="background-color: #ff0000;" id=":textLintMessage:0">一文に二回以上利用されている助詞 "が" がみつかりました。</span>が確認できた。'
              }
            ]
          }
        ]
      }
    ]);
    expect(res.messages).toStrictEqual([
      {
        id: ':textLintMessage:0',
        severity: 2,
        message: '一文に二回以上利用されている助詞 "が" がみつかりました。'
      }
    ]);
  });
  it('should inserts no messages', async () => {
    const res = await textLintInSections(
      [
        {
          title: '',
          content: [
            {
              kind: 'html' as const,
              contentHtml: [
                {
                  tagName: 'p',
                  style: {},
                  attribs: {},
                  html: 'テストが成功するところを確認できた。'
                }
              ]
            }
          ]
        }
      ],
      presets
    );
    expect(res.sections).toStrictEqual([
      {
        title: '',
        content: [
          {
            kind: 'html' as const,
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'テストが成功するところを確認できた。'
              }
            ]
          }
        ]
      }
    ]);
    expect(res.messages).toStrictEqual([]);
  });
});
