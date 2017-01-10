#!/usr/bin/env bash

mkdir build
cd build

virtualenv -p python3.5 venv && source venv/bin/activate
which python

git clone https://github.com/webrecorder/webrecorder.git
cd webrecorder
git fetch
git checkout origin/develop

cd webrecorder
python setup.py install
./webrecorder/standalone/build.sh
cp webrecorder/standalone/dist/standalone ../../../python-binaries/webrecorder

rm -fr build