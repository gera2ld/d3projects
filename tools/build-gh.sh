DEMO_DIR=dist
rm -rf $DEMO_DIR
npm run build
cd $DEMO_DIR
git init
git add -A
git commit -m 'Auto deploy to github-pages'
git push -f git@github.com:intellilab/d3projects.git master:gh-pages
