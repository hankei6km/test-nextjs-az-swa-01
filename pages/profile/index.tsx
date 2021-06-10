import { useEffect } from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Layout from '../../components/Layout';
import { PageData } from '../../types/pageTypes';
import { getPagesPageData } from '../../lib/pages';
import PageContext from '../../components/PageContext';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ProfilePage = ({ pageData }: { pageData: PageData }) => {
  const router = useRouter();
  const { data } = useSWR(`/.auth/me`, fetcher);
  useEffect(() => {
    console.log(data)
    if (data === undefined) {
      // router.push('/.auth/login/github');
    }
  }, [router, data]);
  return (
    <PageContext.Provider value={pageData}>
      <Layout pageData={pageData}>
        <section>
          <h3>User Principal</h3>
          <p>{JSON.stringify(data)}</p>
        </section>
      </Layout>
    </PageContext.Provider>
  );
};

export default ProfilePage;

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
