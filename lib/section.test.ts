import { mockDataArticleList } from '../test/testMockData';
import { FetchMock } from 'jest-fetch-mock';
import {
  getSectionFromPages,
  styleToJsxStyle,
  htmlToChildren,
  getApiNameArticle
} from './section';
import { PagesContent } from '../types/client/contentTypes';

// https://github.com/jefflau/jest-fetch-mock/issues/83
const fetchMock = fetch as FetchMock;
beforeEach(() => {
  fetchMock.resetMocks();
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
        attribs: { id: 't2', class: 'c2' },
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
        attribs: { href: '/', id: 'a1', class: 'ca' },
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

describe('getApiNameArticle()', () => {
  it('should pass through passed apitName', () => {
    expect(getApiNameArticle('posts')).toEqual('posts');
  });
  it('should return blank when invalid api name passed', () => {
    expect(getApiNameArticle('testtest')).toEqual('');
    // expect(getApiNameArticle('%articles', 'post')).toEqual('posts');  // type guard
    // expect(getApiNameArticle(undefined, 'posts')).toEqual('');
  });
});

describe('getSectionFromPages()', () => {
  const mockBase: PagesContent = {
    id: 'home',
    createdAt: '2020-12-27T04:04:30.107Z',
    updatedAt: '2020-12-27T04:04:30.107Z',
    publishedAt: '2020-12-27T04:04:30.107Z',
    revisedAt: '2020-12-27T04:04:30.107Z',
    title: 'Home',
    kind: ['page'],
    description: 'my starter home page',
    category: [],
    sections: []
  };
  it('should returns sections that filtered kind', async () => {
    const mockData: PagesContent = {
      ...mockBase,
      category: [],
      sections: [
        {
          fieldId: 'sectionContent',
          title: 'content section',
          content: [
            {
              fieldId: 'contentHtml',
              html: '<p>content</p>'
            }
          ]
        },
        {
          fieldId: 'sectionTop',
          title: 'top section',
          content: [
            {
              fieldId: 'contentHtml',
              html: '<p>top</p>'
            }
          ]
        },
        {
          fieldId: 'sectionBottom',
          title: 'bottom section',
          content: [
            {
              fieldId: 'contentHtml',
              html: '<p>bottom</p>'
            }
          ]
        },
        {
          fieldId: 'sectionHeader',
          title: 'header section',
          content: [
            {
              fieldId: 'contentHtml',
              html: '<p>header</p>'
            }
          ]
        },
        {
          fieldId: 'sectionFooter',
          title: 'footer section',
          content: [
            {
              fieldId: 'contentHtml',
              html: '<p>footer</p>'
            }
          ]
        }
      ]
    };
    expect(await getSectionFromPages(mockData, 'sectionContent')).toEqual([
      {
        title: 'content section',
        content: [
          {
            kind: 'html',
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'content'
              }
            ]
          }
        ]
      }
    ]);
    expect(await getSectionFromPages(mockData, 'sectionTop')).toEqual([
      {
        title: 'top section',
        content: [
          {
            kind: 'html',
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'top'
              }
            ]
          }
        ]
      }
    ]);
    expect(await getSectionFromPages(mockData, 'sectionBottom')).toEqual([
      {
        title: 'bottom section',
        content: [
          {
            kind: 'html',
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'bottom'
              }
            ]
          }
        ]
      }
    ]);
    expect(await getSectionFromPages(mockData, 'sectionHeader')).toEqual([
      {
        title: 'header section',
        content: [
          {
            kind: 'html',
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'header'
              }
            ]
          }
        ]
      }
    ]);
    expect(await getSectionFromPages(mockData, 'sectionFooter')).toEqual([
      {
        title: 'footer section',
        content: [
          {
            kind: 'html',
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'footer'
              }
            ]
          }
        ]
      }
    ]);
  });
  it('should returns content sections from markdown', async () => {
    const mockData: PagesContent = {
      ...mockBase,
      category: [],
      sections: [
        {
          fieldId: 'sectionContent',
          title: '',
          content: [
            {
              fieldId: 'contentMarkdown',
              markdown: 'content'
            }
          ]
        }
      ]
    };
    expect(await getSectionFromPages(mockData, 'sectionContent')).toEqual([
      {
        title: '',
        content: [
          {
            kind: 'html',
            contentHtml: [
              {
                tagName: 'p',
                style: {},
                attribs: {},
                html: 'content'
              }
            ]
          }
        ]
      }
    ]);
  });
  it('should returns posts sections', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        ...mockDataArticleList,
        contents: mockDataArticleList.contents.slice(0, 1)
      })
    );
    const mockData: PagesContent = {
      ...mockBase,
      category: [],
      sections: [
        {
          fieldId: 'sectionContent',
          title: '',
          content: [
            {
              fieldId: 'contentFragArticles',
              apiName: 'posts',
              detail: true,
              category: []
            }
          ]
        }
      ]
    };
    expect(await getSectionFromPages(mockData, 'sectionContent')).toEqual([
      {
        title: '',
        content: [
          {
            kind: 'posts',
            contents: [
              {
                id: 'mmmmmmmmm',
                createdAt: '2021-01-13T05:12.157Z',
                updatedAt: '2021-01-13T05:12.157Z',
                publishedAt: '2021-01-13T05:12.157Z',
                revisedAt: '2021-01-13T05:12.157Z',
                title: 'title4',
                category: [{ id: 'cat3', title: 'category3' }],
                path: '/posts'
              }
            ],
            detail: true
          }
        ]
      }
    ]);
  });
});
