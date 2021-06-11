import { SectionConfig } from '../components/SectionContext';

const siteConfig: {
  sectionConfig: SectionConfig;
  iamgeConfig: {
    contentImageClassName: string;
  };
  nav: {
    main: { label: string; href: string }[];
    breadcrumbs: { [key: string]: { label: string; href: string }[] };
  };
  labels: { [key: string]: string };
  images: { [key: string]: string };
} = {
  sectionConfig: {
    naked: false,
    component: {
      sectionComponent: 'section',
      sectionTitleComponent: 'h3',
      articleDetailComponent: 'article',
      articleItemComponent: 'li',
      articleDetailTitleComponent: 'h3',
      articleItemTitleComponent: 'span',
      siteTitleComponent: 'h1',
      pageTitleComponent: 'h2',
      navCategoryComponent: 'nav',
      navAllCategoryComponent: 'nav',
      navContentTocComponent: 'nav',
      navContentTocLabelComponent: 'h3',
      notificationComponent: 'aside',
      notificationTitleComponent: 'h3'
    },
    variant: {
      sectionTitleVariant: 'h6',
      articleDetailTitleVariant: 'h4',
      articleItemTitleVariant: 'body1',
      siteTitleVariant: 'h3',
      pageTitleVariant: 'h4',
      navContentTocLabelVariant: 'h6',
      notificationTitleVariant: 'body1'
    }
  },
  iamgeConfig: {
    // siteServerConfig と重複している項目
    contentImageClassName: 'contentImage-img'
  },
  nav: {
    main: [
      {
        label: 'Home',
        href: '/'
      },
      {
        label: 'Blog',
        href: '/posts'
      },
      {
        label: 'Profile',
        href: '/profile'
      },
      {
        label: 'About',
        href: '/about'
      }
    ],
    breadcrumbs: {
      '/': [{ label: 'Home', href: '/' }],
      '/posts': [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/posts' }
      ],
      '/profile': [
        { label: 'Home', href: '/' },
        { label: 'Profile', href: '/profile' }
      ],
      '/about': [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' }
      ]
    }
  },
  labels: {
    siteTitle: process.env.SITE_TITLE || 'My Starter',
    profileName: process.env.PROFILE_NAME || 'starter',
    tocLabel: '目次'
  },
  images: {
    // contentConfig として参照される値.
    // pages api の入力によってページ上に画像として表示されるので注意.
    siteLogoLarge:
      process.env.SITE_LOGO_LARGE ||
      'https://images.microcms-assets.io/protected/ap-northeast-1:9063452c-019d-4ffe-a96f-1a4524853eda/service/my-starter-nextjs-mui-test01/media/my-starter-default-sitelogo1.png?w=140&h=140',
    siteLogo:
      process.env.SITE_LOGO ||
      'https://images.microcms-assets.io/protected/ap-northeast-1:9063452c-019d-4ffe-a96f-1a4524853eda/service/my-starter-nextjs-mui-test01/media/my-starter-default-sitelogo1.png?w=80&h=80',
    siteLogoSmall:
      process.env.SITE_LOGO_SMALL ||
      'https://images.microcms-assets.io/protected/ap-northeast-1:9063452c-019d-4ffe-a96f-1a4524853eda/service/my-starter-nextjs-mui-test01/media/my-starter-default-sitelogo1.png?w=50&h=50',
    profileImageLarge:
      process.env.PROFILE_IMAGE_LARGE ||
      'https://images.microcms-assets.io/protected/ap-northeast-1:9063452c-019d-4ffe-a96f-1a4524853eda/service/hankei6km-pages/media/my-starter-default-profile1.png?w=240&h=240',
    profileImage:
      process.env.PROFILE_IMAGE ||
      'https://images.microcms-assets.io/protected/ap-northeast-1:9063452c-019d-4ffe-a96f-1a4524853eda/service/hankei6km-pages/media/my-starter-default-profile1.png?w=140&h=140',
    profileImageSmall:
      process.env.PROFILE_IMAGE_SMALL ||
      'https://images.microcms-assets.io/protected/ap-northeast-1:9063452c-019d-4ffe-a96f-1a4524853eda/service/hankei6km-pages/media/my-starter-default-profile1.png?w=80&h=80'
  }
};

export default siteConfig;
