var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var app = express();
var passport = require('passport');
var soundCloudStrategy = ('passport-soundcloud');