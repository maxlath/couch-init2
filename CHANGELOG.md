# CHANGELOG
*versions follow [SemVer](http://semver.org)*

## 4.2.0 - 2021-12-11
* [CommonJS module design doc](https://github.com/maxlath/couch-init2#js): add support for function array as view functions to concatenate

## 4.1.0 - 2021-12-11
* Add support for [design docs passed as a CommonJS module](https://github.com/maxlath/couch-init2#js)

## 4.0.0 - 2021-05-16
* **BREAKING CHANGE**: the initialization now only returns a minimized object, only reporting the operations that occurred, instead of also reporting those that did not

## 3.0.0 - 2020-07-16
* **BREAKING CHANGE**: using `async`/`await` internally (required NodeJS `>= v8`)

## 2.3.0 - 2018-10-15
* Add the capacity to wait for CouchDB to be available ([`789b506`](https://github.com/maxlath/couch-init2/commit/789b506))

## 2.2.0 - 2018-06-26
* Add a report of operations in the returned object ([`4535ab5`](https://github.com/maxlath/couch-init2/commit/4535ab5))
