import {
  getTocLabel,
  processorHtml,
  headingToNumber,
  adjustHeading,
  normalizedHtml,
  htmlContent,
  styleToJsxStyle,
  htmlToChildren,
  getIndexedHtml
} from './html';

describe('getTocLabel()', () => {
  it('should returns label to using in toc', () => {
    expect(getTocLabel('test')).toEqual('test');
    expect(getTocLabel('test1 test2\ttest3')).toEqual('test1-test2-test3');
    expect(getTocLabel('test1  test2\t\ttest3')).toEqual('test1--test2--test3');
    expect(getTocLabel('test1\ntest2\n\rtest3')).toEqual('test1-test2--test3');
    expect(getTocLabel('test1#test2.test3')).toEqual('test1-test2-test3');
    expect(getTocLabel('test1&test2>test3')).toEqual('test1-test2-test3');
    expect(getTocLabel('test1[test2]test3')).toEqual('test1-test2-test3');
    expect(getTocLabel('test1:test2;test3')).toEqual('test1-test2-test3');
    expect(getTocLabel('#.()[]{}<>@&%$"`=_:;\'\\ \t\n\r')).toEqual(
      '--------------------------'
    );
  });
});

describe('headingToNumber()', () => {
  it('should returns number from suffix of heading tag', () => {
    expect(headingToNumber('h3')).toEqual(3);
    expect(headingToNumber('h4')).toEqual(4);
    expect(headingToNumber('h5')).toEqual(5);
    expect(headingToNumber('p')).toEqual(-1);
  });
});

describe('normalizeHtml()', () => {
  it('should returns nrmalized html', () => {
    expect(
      normalizedHtml(processorHtml(), '<h2   id="abcdef123">test1</h2>')
    ).toEqual('<h2 id="user-content-abcdef123">test1</h2>');
  });
  it('should adjust heading depth', () => {
    expect(
      normalizedHtml(
        processorHtml().use(adjustHeading, { top: 3 }),
        '<h2>test1</h2><h3>test2</h3>'
      )
    ).toEqual(
      '<h3 id="user-content-test1">test1</h3><h4 id="user-content-test2">test2</h4>'
    );
    expect(
      normalizedHtml(
        processorHtml().use(adjustHeading),
        '<h2>test1</h2><h3>test2</h3>'
      )
    ).toEqual(
      '<h4 id="user-content-test1">test1</h4><h5 id="user-content-test2">test2</h5>'
    );
  });
});

describe('htmlContent()', () => {
  it('should returns toc of html', () => {
    expect(
      htmlContent('<h4 id="test1">test1</h4><h4 id="test2">test2</h4>', [
        { label: 'section title', items: [], depth: 0, id: 'section-title' }
      ])
    ).toEqual([
      {
        label: 'section title',
        items: [
          {
            label: 'test1',
            items: [],
            depth: 1,
            id: 'test1'
          },
          {
            label: 'test2',
            items: [],
            depth: 1,
            id: 'test2'
          }
        ],
        depth: 0,
        id: 'section-title'
      }
    ]);
  });
  it('should returns toc of html(nested)', () => {
    expect(
      htmlContent(
        '<h4 id="test1">test1</h4><p>abc</p><h5 id="test3">test3</h5><p>123</p><h5 id="test4">test4</h5><h4 id="test2">test2</h4>',
        [{ label: 'section title', items: [], depth: 0, id: 'section-title' }]
      )
    ).toEqual([
      {
        label: 'section title',
        items: [
          {
            label: 'test1',
            items: [
              {
                label: 'test3',
                items: [],
                depth: 2,
                id: 'test3'
              },
              {
                label: 'test4',
                items: [],
                depth: 2,
                id: 'test4'
              }
            ],
            depth: 1,
            id: 'test1'
          },
          {
            label: 'test2',
            items: [],
            depth: 1,
            id: 'test2'
          }
        ],
        depth: 0,
        id: 'section-title'
      }
    ]);
  });
  it('should returns toc of html(without section title)', () => {
    expect(
      htmlContent('<h4 id="test1">test1</h4><h4 id="test2">test2</h4>', [])
    ).toEqual([
      {
        label: 'test1',
        items: [],
        depth: 1,
        id: 'test1'
      },
      {
        label: 'test2',
        items: [],
        depth: 1,
        id: 'test2'
      }
    ]);
  });
});

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
          'data-opt': '?q=123&abc=efg' // dataSet ?????????????
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
                },
                {
                  tagName: 'pre',
                  style: {},
                  attribs: {},
                  html: '<code class="typescript">cosnt a=1;</code>'
                },
                {
                  tagName: 'p',
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
          childIdx: 2
        },
        {
          range: [24, 35],
          sectionIdx: 0,
          contentIdx: 0,
          childIdx: 4
        }
      ],
      html: '<p>test1</p><p>test3</p><p>test4</p>'
    });
  });
});
