import React, { useContext, ReactNode } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Head from 'next/head';
// import Image from 'next/image';
import Link from './Link';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import siteContext from '../components/SiteContext';
import { Section } from '../types/pageTypes';
import SectionList from './SectionList';
import { pruneClasses } from '../utils/classes';

const useStyles = makeStyles({
  'LayoutHeader-root': {},
  'LayoutHeader-sectionTop': {},
  'LayoutHeader-sectionList': {},
  'LayoutFooter-root': {},
  'LayoutFooter-sectionList': {},
  'LayoutFooter-sectionBottom': {},
  heading: {
    // fontFamily:
    //   '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
    fontWeight: 800
  }
});
const useStylesGrid = makeStyles(() => ({
  'SectionList-root': {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)'
    // gridGap: theme.spacing(3)
  },
  'SectionItem-root': {
    gridColumnEnd: 'span 6'
  }
}));
const classNames = [
  'LayoutHeader-root',
  'LayoutHeader-sectionTop',
  'LayoutHeader-sectionList',
  'LayoutFooter-root',
  'LayoutFooter-sectionList',
  'LayoutFooter-sectionBottom'
];

type Props = {
  children?: ReactNode;
  title?: string;
  headerSections?: Section[];
  footerSections?: Section[];
  home?: boolean;
  classes?: { [key: string]: string };
};

const tabs = [
  {
    label: 'Home',
    href: '/'
  },
  {
    label: 'Blog',
    href: '/posts'
  },
  {
    label: 'Abouit',
    href: '/about'
  }
];

const Layout = ({
  children,
  title = '',
  headerSections = [],
  footerSections = [],
  classes: inClasses
}: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  const classesHeaderFooter = useStylesGrid({
    classes: pruneClasses(inClasses, classNames)
  });
  const { siteTitle } = useContext(siteContext).label;
  const headerSectionsLen = headerSections.length;
  const footerSectionsLen = footerSections.length;
  const maxWidth = 'sm';
  return (
    <>
      <Head>
        <title>{`${title}: ${siteTitle}`}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header className={classes['LayoutHeader-root']}>
        <Container maxWidth={maxWidth} disableGutters>
          <Tabs
            indicatorColor="primary"
            textColor="primary"
            value={0}
            style={{ position: 'sticky', top: -1 }}
          >
            {tabs.map(({ label, href }) => (
              <Tab
                key={`${label}:${href}`}
                label={label}
                component={Link}
                href={href}
              />
            ))}
          </Tabs>
          <Box className={classes['LayoutHeader-sectionTop']}>
            <SectionList
              sections={[
                { title: '', content: [{ kind: 'partsSiteTitle', link: '/' }] }
              ]}
              classes={{ ...classes }}
            />
          </Box>
          {headerSectionsLen > 0 && (
            <Box className={classes['LayoutHeader-sectionList']}>
              <SectionList
                sections={headerSections}
                classes={{ ...classesHeaderFooter }}
              />
            </Box>
          )}
        </Container>
      </header>
      <Container maxWidth={maxWidth} disableGutters>
        <Box>{children}</Box>
      </Container>
      <footer className={classes['LayoutHeader-root']}>
        <Container maxWidth={maxWidth} disableGutters>
          {footerSectionsLen > 0 && (
            <Box className={classes['LayoutFooter-sectionList']}>
              <SectionList
                sections={footerSections.slice(0, footerSectionsLen - 1)}
                classes={{ ...classesHeaderFooter }}
              />
            </Box>
          )}
          <Box className={classes['LayoutFooter-sectionBottom']}>
            <SectionList
              sections={footerSections.slice(-1)}
              classes={{ ...classes }}
            />
          </Box>
        </Container>
      </footer>
    </>
  );
};

export default Layout;
