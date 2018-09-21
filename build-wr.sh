#!/bin/bash
set -e

pushd webrecorder/webrecorder
python3 setup.py install
bash ./webrecorder/standalone/build_player.sh
popd

mv ./webrecorder/webrecorder/webrecorder/standalone/dist/webrecorder_player ./python-binaries/
chmod a+x ./python-binaries/webrecorder_player

