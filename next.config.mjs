/** @type {import('next').NextConfig} */
const nextConfig = {
  // lane4-admin 규칙 계승: 페이지/라우트 파일은 *.page.tsx / *.page.ts / *.api.ts 만 인식
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'api.ts'],
  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NEXT_PUBLIC_APP_ENV === 'production',
  },
  // 빌드는 타입체크(tsc)로 완결성을 검증하고, 린트는 별도(yarn lint)로 수행한다.
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    '@ant-design',
    '@rc-component',
    'antd',
    'rc-cascader',
    'rc-checkbox',
    'rc-collapse',
    'rc-dialog',
    'rc-drawer',
    'rc-dropdown',
    'rc-field-form',
    'rc-image',
    'rc-input',
    'rc-input-number',
    'rc-mentions',
    'rc-menu',
    'rc-motion',
    'rc-notification',
    'rc-pagination',
    'rc-picker',
    'rc-progress',
    'rc-rate',
    'rc-resize-observer',
    'rc-segmented',
    'rc-select',
    'rc-slider',
    'rc-steps',
    'rc-switch',
    'rc-table',
    'rc-tabs',
    'rc-textarea',
    'rc-tooltip',
    'rc-tree',
    'rc-tree-select',
    'rc-upload',
    'rc-util',
  ],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/provision',
        permanent: false,
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
