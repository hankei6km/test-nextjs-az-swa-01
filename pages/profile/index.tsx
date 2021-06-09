import { GetStaticProps } from 'next';
import { makeStyles } from '@material-ui/core/styles';
import Layout from '../../components/Layout';
import SectionList from '../../components/SectionList';
import { PageData } from '../../types/pageTypes';
import { getPagesPageData } from '../../lib/pages';
import siteConfig from '../../src/site.config';
import { wrapStyle } from '../../utils/classes';
import PageContext from '../../components/PageContext';

const useStyles = makeStyles(() => ({
  pageMain: {
    ...wrapStyle(`& .${siteConfig.iamgeConfig.contentImageClassName}`, {
      maxWidth: '100%',
      objectFit: 'contain'
    })
  },
  'SectionItem-root': {},
  'SectionItem-title': {
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  }
}));

const itemsPerPage = 10;
const pagePath: string[] = [];

const PostsPage = ({ pageData }: { pageData: PageData }) => {
  const classes = useStyles();
  return (
    <PageContext.Provider value={pageData}>
      <Layout pageData={pageData}>
        <SectionList
          sections={[
            {
              title: '',
              content: [
                {
                  kind: 'partsNavPagination',
                  // section 側で展開した場合、取得できない情報が含まれている.
                  // コンテンツ側で parts 指定することにした場合扱えないので注意
                  href: '/posts/page/[..id]',
                  baseAs: '/posts/page',
                  pagePath: pagePath,
                  firstPageHref: '/posts'
                }
              ]
            }
          ]}
          classes={{ ...classes }}
        />
      </Layout>
    </PageContext.Provider>
  );
};

export default PostsPage;

export const getStaticProps: GetStaticProps = async (context) => {
  const id = 'profile';
  const pageData = await getPagesPageData('pages', {
    params: {
      id
    },
    preview: context.preview,
    previewData: context.previewData
  });
  return {
    props: {
      pageData
    }
  };
};
