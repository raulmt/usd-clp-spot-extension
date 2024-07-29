const { src, task, watch, context, fuse, exec } = require('fuse-box/sparky');
const { FuseBox, WebIndexPlugin, QuantumPlugin } = require('fuse-box');

context(class {
  getConfig() {
      return FuseBox.init({
        homeDir: 'src',
        target: 'browser@es6',
        output: 'dist/$name.js',
        plugins: [
          this.isProduction &&
            QuantumPlugin({
              uglify: { es6: true },
              treeshake: true,
              bakeApiIntoBundle: true,
            }),
        ],
      });
  }

  createBundles(fuse) {
    ['background'].forEach((bundleName) => {
      const bundle = fuse.bundle(bundleName);
      if (!this.isProduction) {
          bundle.watch();
          // bundle.hmr().watch();
      }
      bundle.instructions(`> ${bundleName}/index.ts`);
    })
  }
});

task('clean', () => {
  src('dist/').clean('dist/').exec();
});

function publicCopy(shouldWatch) {
  const srcFn = shouldWatch ? watch : src;
  return srcFn('./**/*.*', { base: './public' }).dest('./dist').exec();
}

task('public', async (context) => {
  await publicCopy(!context.isProduction);
})

task('src', async (context) => {
  const fuse = context.getConfig();
  context.createBundles(fuse);
  await fuse.run();
});

task('all', ['&src', '&public']);

task('default', async (context) => {
  context.isProduction = process.env.NODE_ENV === 'production';
  await exec('all');
})