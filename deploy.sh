#!/bin/sh

# This bucket is in the sweartax project
DIST=./dist
BUILD=$1

BUCKET=gs://vexflow.com
URL=${BUCKET}
echo "Deploying to $BUCKET..."

git diff-index --quiet HEAD --
if [ "$?" != "0" ]
then
    echo Please commit changes before deploying.
    exit 1
fi

echo Pushing local commits...
git push
if [ "$?" != "0" ]
then
    echo Could not push commits to Github.
    exit 1
fi

echo Building bundles...
npm run build
if [ "$?" != "0" ]
then
    echo NPM build failed.
    exit 1
fi

echo Uploading bundles...
gsutil -h "Cache-control:public,max-age=86400" -m cp -a public-read -z js,map $DIST/*.js $DIST/*.map ${URL}

gsutil -h "Cache-control:public,max-age=300" -m cp -a public-read -z html,css,js $DIST/index.html $DIST/style.css ${URL}
gsutil -h "Cache-control:public,max-age=300" -m cp -a public-read -z html,css,js $DIST/vextab/*.html ${URL}/vextab
