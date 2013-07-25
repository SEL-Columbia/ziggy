Ziggy
=====
[![Build Status](https://travis-ci.org/modilabs/ziggy.png)](https://travis-ci.org/modilabs/ziggy)

Steps to setup Ziggy on your machine:
========================================

1. Install npm (brew install npm)

2. Clone ziggy and cd to the cloned location

3. Run 'npm install'. This will install all the dev dependencies of ziggy on your machine

4. Run 'grunt'. This will clean, jshint, run tests, concat, uglify and run tests on uglified code.

Ziggy is setup now.


Troubleshooting tips:
========================================

1. If you get "command not found: grunt" even after step 3 then verify if npm bin (/usr/local/share/npm/bin/) is in your path. If not add it to the path.
