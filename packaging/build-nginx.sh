#!/bin/bash

mkdir build
pushd build

mkdir dependencies
pushd dependencies

wget ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.31.tar.gz
wget http://zlib.net/zlib-1.2.7.tar.gz

tar xzf pcre-8.31.tar.gz
tar xzf zlib-1.2.7.tar.gz

popd

wget http://nginx.org/download/nginx-1.2.2.tar.gz
tar xzf nginx-1.2.2.tar.gz

pushd nginx-1.2.2

./configure --with-pcre="../dependencies/pcre-8.31" --with-zlib="../dependencies/zlib-1.2.7" --prefix="./nginx_data" --with-cc-opt="-DNGX_HAVE_ACCEPT4=0" --with-ld-opt="-static-libgcc -Wl,-Bstatic -lc"

make

mkdir -p ../nginx_dist/nginx_data/logs
cp -r conf ../nginx_dist/nginx_data
cp objs/nginx ../nginx_dist

popd

rm -f nginx_dist/nginx_data/conf/nginx.conf

tar czf nginx_dist-1.2.2.tar.gz nginx_dist
mv nginx_dist-1.2.2.tar.gz ..

popd

rm -rf build

echo "Package nginx_dist-1.2.2.tar.gz built."