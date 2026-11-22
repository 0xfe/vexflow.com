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

# Publish shared assets and embedded pages before the homepage that references them.
gcloud storage cp --recursive --cache-control="public,max-age=86400" --predefined-acl=publicRead "$DIST/fonts" "${URL}/" || exit $?
gcloud storage cp --recursive --cache-control="public,max-age=86400" --predefined-acl=publicRead --gzip-local=js,txt "$DIST/vextab/audio" "${URL}/vextab/" || exit $?
gcloud storage cp --cache-control="public,max-age=300" --predefined-acl=publicRead --gzip-local=css,json "$DIST/style.css" "$DIST/vexflow-version.json" "${URL}" || exit $?
gcloud storage cp --cache-control="public,max-age=300" --predefined-acl=publicRead --gzip-local=html "$DIST"/examples/*.html "${URL}/examples/" || exit $?
gcloud storage cp --cache-control="public,max-age=300" --predefined-acl=publicRead --gzip-local=html,css,js "$DIST"/vextab/*.html "${URL}/vextab/" || exit $?
gcloud storage cp --cache-control="public,max-age=300" --predefined-acl=publicRead --gzip-local=html "$DIST/index.html" "${URL}" || exit $?
