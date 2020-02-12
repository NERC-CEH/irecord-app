#!/bin/bash

echo 'Framing screenshots'
fastlane frameit

echo 'Moving framed'
mkdir -p framed
mv en-GB/*framed.png framed/

# No text
mv Framefile.json _Framefile.json

echo 'Framing screenshots (no-text)'
fastlane frameit

echo 'Moving framed (no-text)'
mkdir -p framed/no-text
mv en-GB/*framed.png framed/no-text

# Clean up
mv _Framefile.json Framefile.json

