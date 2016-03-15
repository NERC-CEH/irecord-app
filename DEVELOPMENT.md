Components folder
================

* App components-blocks that can work independently of each other
* Common files or pages between components are placed in *Common folder*

* Common page level components are placed in pages folder within components folder.

Config folder
=============

* App configuration

Helpers folder
==============

* App helper libraries
* Independent from Marionette
* Too small to be put into vendor



*App* object holds the app component APIs;

Dependencies to new module definitions should go in such order (others can be 
added depending on how often are manipulated):
LIBRARIES, HELPER LIBS, APP, CONFIG, JST, MODELS, VIEWS

Libraries and Helper libs must start with capital (+ App).


Cordova
=======

Signing

```bash
keytool -genkey -v -keystore irecord.keystore -alias irecord -keyalg RSA -keysize 2048 -validity 10000
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore irecord.keystore android-release-unaligned.apk irecord
zipalign -v 4 android-release-unsigned.apk irecord.apk
```

Style Guide
===========

[AirBnB Style Guide](https://github.com/airbnb/javascript)