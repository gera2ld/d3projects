DEMO_DIR=dist-demo
rm -rf $DEMO_DIR
cp -R tools/demo $DEMO_DIR
cp dist/* $DEMO_DIR
cd $DEMO_DIR
git init
git add -A
git commit -m 'Auto deploy to github-pages'
git push -f git@github.com:intellilab/d3projects.git master:gh-pages
