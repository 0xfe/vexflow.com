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
gcloud storage cp --cache-control="public,max-age=86400" --predefined-acl=publicRead --gzip-local=js,map "$DIST"/*.js "$DIST"/*.map "${URL}" || exit $?

gcloud storage cp --cache-control="public,max-age=300" --predefined-acl=publicRead --gzip-local=html,css,js "$DIST/index.html" "$DIST/style.css" "${URL}" || exit $?
gcloud storage cp --cache-control="public,max-age=300" --predefined-acl=publicRead --gzip-local=html,css,js "$DIST"/vextab/*.html "${URL}/vextab/" || exit $?
