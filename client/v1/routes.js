var CONSTANTS = require('./constants');
var _ = require('lodash');

var URLs = {};
_.each(CONSTANTS.ROUTES, function (val, key) {
    URLs[key] = _.template(val);
});

var WEB_URLs = {};
_.each(CONSTANTS.WEB_ROUTES, function (val, key) {
    WEB_URLs[key] = _.template(val);
});

exports.getUrl = function(key, data, version) {
    if(!_.isFunction(URLs[key])) 
        throw new Error("Url with key `"+ key +"` is not available");

    if(!version) {
        version = 1;
    }

    var api_endpoint = null;

    switch(version) {
        case 1:
            api_endpoint = CONSTANTS.API_ENDPOINT;
            break;

        case 2:
            api_endpoint = CONSTANTS.API_ENDPOINT_V2;
            break;

        default:
            throw new Error("API version '"+version+"' is not supported." );

    }

    return api_endpoint + URLs[key](data || {});
}

exports.getWebUrl = function(key, data) {
    if(!_.isFunction(WEB_URLs[key])) 
        throw new Error("Web url with key `"+ key +"` is not available");
    return CONSTANTS.WEBHOST + WEB_URLs[key](data || {});   
}


