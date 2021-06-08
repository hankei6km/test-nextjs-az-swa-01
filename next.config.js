const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD
} = require('next/constants');

// This uses phases as outlined here: https://nextjs.org/docs/#custom-configuration
module.exports = (phase) => {
  // when started in development mode `next dev` or `npm run dev` regardless of the value of STAGING environmental variable
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  // when `next build` or `npm run build` is used
  const isProd =
    phase === PHASE_PRODUCTION_BUILD && process.env.STAGING !== '1';
  // when `next build` or `npm run build` is used
  const isStaging =
    phase === PHASE_PRODUCTION_BUILD && process.env.STAGING === '1';

  console.log(`isDev:${isDev}  isProd:${isProd}   isStaging:${isStaging}`);

  const env = {
    USE_MOCK_CLIENT: (() => {
      //  $USE_MOCK_CLIENT_FORCE を定義すると強制的に mock client を使う .
      if (isDev && process.env.DISABLE_MOCK_CLIENT !== 'true') return 'true';
      return '';
    })(),
    USE_FALLBACK: (() => {
      // export されたときには使えないので false ('') にする
      // 今回は GitHub 上で実行されていたら pages に export されるという想定.
      // Pages with `fallback` enabled in `getStaticPaths` can not be exported.
      // See more info here: https://err.sh/next.js/ssg-fallback-true-export
      if (process.env.GITHUB_REPOSITORY) return '';
      return 'true';
    })()
  };

  // https://docs.github.com/ja/actions/reference/environment-variables
  let _assetPrefix = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/', 2)[1]}`
    : '';
  _assetPrefix =
    // next start 等では PHASE_PRODUCTION_BUILD がセットされないようなので
    // mardock の独自仕様として STAGING_DIR だけで変更する.
    // isStaging && process.env.STAGING_DIR
    process.env.STAGING_DIR
      ? path.join(_assetPrefix, process.env.STAGING_DIR)
      : _assetPrefix;
  if (process.env.ASSET_PREFIX && process.env.ASSET_PREFIX.startsWith('/')) {
    _assetPrefix = process.env.ASSET_PREFIX;
  }
  const assetPrefix = _assetPrefix;
  // util/baseUrl.ts 内で baseUrl を独自に設定しているので注意
  const basePath = ''
  if (assetPrefix && assetPrefix !== '/') {
    basePath = assetPrefix
  }

  console.log(`assetPrefix:${assetPrefix}`);

  // next.config.js object
  return {
    assetPrefix,
    basePath,
    env
  };
};
