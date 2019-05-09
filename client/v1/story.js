var Resource = require('./resource');
var util = require("util");
var _ = require("lodash");


function Story(session, params)
{
    Resource.apply(this, arguments);
}

function StoryCollection(session, params)
{
    Resource.apply(this, arguments);
    this.user = params.user;
    this.items = params.items;
    // TODO: convert items to story instances?
    // this.items = params.items.map((item) => {
    //     return new Story(session, item);
    // });
}

module.exports = Story;
util.inherits(Story, Resource);
util.inherits(StoryCollection, Resource);

var Request = require('./request');


Story.prototype.parseParams = function (json) {
    return json || {};
};

StoryCollection.prototype.parseParams = function (json) {
    return json || {};
};


Story.get = function(session, userId) {
    return new Request(session)
        .setMethod('GET')
        .setResource('userStoryV2', {userId: userId})
        .generateUUID()
        .signPayload()
        .send()
        .then(function(data) {
            return new StoryCollection(session, data);
        });
};

/**
 *
 * @param session
 * @param Array realMediasList
 * @returns {*|PromiseLike<InstagramResource | never>|Promise<InstagramResource | never>}
 */
Story.markAsSeen = function(session, realMediasList)
{
    if(realMediasList.length == 0) {
        throw 'realMediasList provided is empty';
    }

    var maxSeenAt = Math.max.apply(Math, realMediasList.map(function(items) { return items.taken_at; }));
    maxSeenAt = Math.max(Math.floor(new Date().getTime() / 1000), maxSeenAt);

    var seenAt = maxSeenAt - (realMediasList.length * 3);


    var data = {
        reels: {},
        live_vods: {},
        reel: 1,
        live_vod: 0
    };

    for(var i = 0; i < realMediasList.length; i++)
    {
        var item = realMediasList[i];

        if(item.taken_at > seenAt) {
            seenAt = item.taken_at + 2;
        }

        var sourceId = item.user.pk;
        var reelId = item.id + '_' + sourceId;

        data.reels[reelId] = [item.taken_at+'_'+seenAt];
        seenAt += Math.round(Math.random() * 3);
    }

    return new Request(session)
        .setMethod('POST')
        .setResource('markStoryAsSeen', null, 2)
        .generateUUID()
        .setData(data)
        .signPayload()
        .send()
        .then(function(data) {
            return new Resource(session, data);
        });
};
