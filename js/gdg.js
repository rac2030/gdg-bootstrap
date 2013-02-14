var Config = (function(){
    var config = {
        //modify these
        'name'          : 'GDG Z&uuml;rich',
        'id' 	    	: '117715978948849333403',
        'google_api'    : 'AIzaSyCxVF8-3e2lOfG6uvS-JbkzMYIQPVnJ5c8',
        //custom stuff
        'cover_photo'   : true, //best results make sure you have 940x180 image
        'cover_color'   : '#ffffff'
    }
    return {get : function(a) { return config[a]}}
})();

$('title').prepend(Config.get('name')+' | ');
$('.brand').html('<strong>'+Config.get('name')+'</strong>');

//join - "I'm a member button"
$('#join_chapter').click(function(){
    var win=window.open('https://developers.google.com/groups/chapter/join/'+Config.get('id'));
    setTimeout(function(){
        console.log('https://developers.google.com/groups/chapter/'+Config.get('id')+'/')
        win.location.href = 'https://developers.google.com/groups/chapter/'+Config.get('id')+'/';
    },500);
    
});
$('li#googleplus').click(function(){window.open('https://plus.google.com/'+Config.get('id'))});

//google+ page info 
$.get('https://www.googleapis.com/plus/v1/people/'+Config.get('id')+'?fields=aboutMe%2Ccover%2CdisplayName%2Cimage%2CplusOneCount&key='+Config.get('google_api'), function(data){
    //about
    $('#about').next().next().html(data.aboutMe);
    
    //cover photo
    if(data.cover.coverPhoto.url && Config.get('cover_photo')){
        $('#home').css({
            'background':'url('+data.cover.coverPhoto.url+') '+data.cover.coverInfo.leftImageOffset+'px '+(data.cover.coverInfo.topImageOffset)+'px',
            'color' : Config.get('cover_color')
        });
        
    }
    
})

//Load g+ public feed for news
loadPlus();

//gdg dev site events feed
$.get("http://gdgfresno.com/gdgfeed.php?id="+Config.get('id'),function(data){
    var now = new Date();
    for(var i=data.length-1;i>=0;i--){
        var start = new Date(data[i].start);
        
        var format = start.format("longDate")
        format += ' '+start.format("shortTime")
        
        var html = '<div class="media">';
        html+= data[i].iconUrl != undefined ? '<a class="pull-left" href="https://developers.google.com'+data[i].link+'" target="_blank"><img class="media-object" src="https://developers.google.com'+data[i].iconUrl+'"></a>' : '';
        html+='<div class="media-body">' +
                            '<h4 class="media-heading"><a href="https://developers.google.com'+data[i].link+'" target="_blank">'+data[i].title+'</a></h4>' +
                            '<h5>'+data[i].location+'<br/>'+format+'</h5>' +
                            data[i].description +
                        '</div>';        
        html +='</div>';
        
    	if (start < now){
                $('#past_events').next().next().append(html);
    	} else {
                $('#upcoming_events').next().next().prepend(html);
    	}
    }
    var past = $('#past_events').next().next().children();
    if(past.length > 5 ){
        $('#past_events').next().next().append('<div id="view_more_events"><a href="#past_events">View More...</a></div>');
    }
    for( var i = past.length-1; i>=5; i--){
        past[i].style.display='none';
    }
    $('#view_more_events').click(function(){
        $('#past_events').next().next().children().slideDown();
        setTimeout(function(){$('#view_more_events').hide();},1)
    });
},'json');

//google+ photos
var parsePWA = function(d){
    var url, html, p = d.feed.entry, count=0;
    for(var x in p){
        count++;
        if(count == 1){
            html = '<li class="span6"><a href="'+p[x].link[1].href+'" class="thumbnail" target="_blank"><img src="'+ p[x].content.src + '?sz=460" alt="'+p[x].title.$t+'" title="'+p[x].summary.$t+'"></a></li>'
        }else if(count == 8){
            html = '<li class="span6 pull-right"><a href="'+p[x].link[1].href+'" class="thumbnail" target="_blank"><img src="'+ p[x].content.src + '?sz=460" alt="'+p[x].title.$t+'" title="'+p[x].summary.$t+'"></a></li>'
        }else{
            html = '<li class="span3"><a href="'+p[x].link[1].href+'" class="thumbnail" target="_blank"><img src="'+ p[x].content.src + '?sz=260" alt="'+p[x].title.$t+'" title="'+p[x].summary.$t+'"></a></li>'
        }
        $('#photo_container').append(html);
    }
};
$.get('https://picasaweb.google.com/data/feed/api/user/'+Config.get('id')+'/?alt=json-in-script&callback=parsePWA&max-results=22&kind=photo');

//gdg g+ stream for news (reusing code from Roman Nurik for aggregating g+, twitter and friend feed stream into a webpage)
function loadPlus() {
  $.ajax({
    url: 'https://www.googleapis.com/plus/v1/people/' +
        Config.get('id') + '/activities/public',
    data: {
      key: Config.get('google_api')
    },
    dataType: 'jsonp',
    success: function(response, textStatus, xhr) {
      if (response.error) {
        rebuildStreamUI([]);
        if (console && console.error) {
          console.error('Error loading Google+ stream.', response.error);
        }
        return;
      }
      var entries = [];
      for (var i = 0; i < response.items.length; i++) {
        var item = response.items[i];
        var object = item.object || {};

        // Normalize tweet to a FriendFeed-like entry.
        var item_title = item.title;
        
        var html = [item_title.replace(new RegExp('\n','g'), '<br />')];
        html.push(' <b><a href="' + item.url + '">Read post &raquo;</a>');

        var thumbnails = [];

        var attachments = object.attachments || [];
        for (var j = 0; j < attachments.length; j++) {
          var attachment = attachments[j];
          switch (attachment.objectType) {
            case 'photo':
              thumbnails.push({
                url: attachment.image.url,
                link: attachment.fullImage.url
              });
              break;

            case 'video':
              thumbnails.push({
                url: attachment.image.url,
                link: attachment.url
              });
              break;

            case 'article':
              html.push('<div class="link-attachment"><a href="' +
                  attachment.url + '">' + attachment.displayName + '</a>');
              if (attachment.content) {
                html.push('<br>' + attachment.content + '');
              }
              html.push('</div>');
              break;
          }
        }

        html = html.join('');

        var entry = {
          via: {
            name: 'Google+',
            url: item.url
          },
          body: html,
          date: parseRfc3339Date(item.updated),
          reshares: (object.resharers || {}).totalItems,
          plusones: (object.plusoners || {}).totalItems,
          comments: (object.replies || {}).totalItems,
          thumbnails: thumbnails
        };

        entries.push(entry);
      }

      rebuildStreamUI(entries);
    }
    /* error: doesn't work for JSONP requests */
  });
}

function parseRfc3339Date(dateStr) {
  var match = parseRfc3339Date._RFC_3339_DATE_RE.exec(dateStr || '');
  if (!match)
    return null;

  var d = {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
    hour: parseInt(match[4], 10),
    minute: parseInt(match[5], 10),
    second: parseInt(match[6] || 0, 10),
    tz: {
      exists: !!(match[7] || match[8]),
      Z: match[7],
      hrs: parseInt(match[8] || 0, 10),
      mins: parseInt(match[9] || 0, 10)
    }
  };

  var date = new Date(d.year, d.month - 1, d.day, d.hour, d.minute, d.second);

  if (d.tz.exists) {
    var numericDate = date.getTime();
    numericDate -= date.getTimezoneOffset() * 60000;
    if (d.tz.hrs)
      numericDate += (d.tz.hrs * 60 + d.tz.mins) * 60000;

    date = new Date(numericDate);
  }
  window.foo = d;
  return date;
}
parseRfc3339Date._RFC_3339_DATE_RE = new RegExp(
    '^(\\d{4})-(\\d{2})-(\\d{2})' + // date
    'T(\\d{2})\\:(\\d{2})' + // hours, minutes
    '(?:\\:(\\d{2}(?:\\.\\d+)?))?' + // seconds, milliseconds
    '(?:(Z)|([+-]\\d{2})(\\d{2}))?' + // timezone
    '$', 'i');

function humanizeTimeDelta(d) {
  if (!humanizeTimeDelta._plural) {
    humanizeTimeDelta._plural = function(n, round, sing, unit) {
      var fn = round ? 'round' : 'floor';
      return ((Math[fn](n) == 1) ? sing + ' ' + unit
                                 : Math[fn](n) + ' ' + unit + 's');
    };
  }

  d = Math.abs(d);
  if (d < 1000)
    return 'under a second ago';
  if ((d /= 1000) < 60)
    return humanizeTimeDelta._plural(d, false, 'a', 'second') + ' ago';
  if ((d /= 60) < 60)
    return humanizeTimeDelta._plural(d, false, 'a', 'minute') + ' ago';
  if ((d /= 60) < 24)
    return humanizeTimeDelta._plural(d, false, 'an', 'hour') + ' ago';
  if ((d /= 24) < 7)
    return humanizeTimeDelta._plural(d, false, 'a', 'day') + ' ago';
  if (d < 30)
    return humanizeTimeDelta._plural(d / 7, true, 'a', 'week') + ' ago';
  if (d < 365)
    return humanizeTimeDelta._plural(d / 30, true, 'a', 'month') + ' ago';
  if ((d /= 365) < 10)
    return humanizeTimeDelta._plural(d, true, 'a', 'year') + ' ago';

  return 'a long, long time ago';
}
window.humanizeTimeDelta = humanizeTimeDelta;

function parseUrl(url) {
  var match = parseUrl._URL_RE.exec(url || '');
  if (!match)
    return null;

  return {
    scheme: match[1],
    domain: match[2],
    port: match[3] ? parseInt(match[3], 10) : null,
    path: match[4] || null,
    query: match[5] || null,
    hash: match[6] || null
  };
}
parseUrl._URL_RE = new RegExp(
    '^(\\w+\\:(?://)?)' + // scheme
    '([\\w.]+)(?:\\:(\\d+))?' + // domain + port
    '(/[^?#]*)?' + // path
    '(?:\\?([^#]*))?' + // query
    '(?:#(.*))?' + // hash
    '$', 'i');

// To be called once we have stream data
function rebuildStreamUI(entries) {
  entries = entries || [];
  entries.sort(function(x,y){ return y.date - x.date; });
  $('.loading').remove();

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var $entry = $('<li>')
        .addClass(entry.via.name)
        .html(entry.body)

    // Entry icon
    var urlDomain = parseUrl(entry.via.url).domain;
    var faviconUrl = (urlDomain.match(/plus\.google/))
        ? 'img/plus-favicon.png'
        : ('http://www.google.com/s2/favicons?domain=' +
              parseUrl(entry.via.url).domain);
    $('<img class="icon">')
        .attr('src', faviconUrl)
        .appendTo($entry);

    // Thumbnails
    if (entry.thumbnails && entry.thumbnails.length) {
      var $thumbs = $('<ul class="thumbnails">').appendTo($entry);
      for (var j = 0; j < entry.thumbnails.length; j++) {
        var thumb = entry.thumbnails[j];
        var $thumb = $('<li>').appendTo($thumbs);
        if (thumb.link)
          $thumb = $('<a>')
              .attr('href', thumb.link)
              .appendTo($thumb);
        $('<img>')
            .attr({
              src: thumb.url/*,
              width: thumb.width,
              height: thumb.height*/
            })
            .appendTo($thumb);
      }
    }

    // Meta (date/time, via link)
    var $meta = $('<div class="meta">').appendTo($entry);
    $('<span class="from">')
        .html('<a href="' + entry.via.url + '">' +
              humanizeTimeDelta(entry.date - new Date()) +
              '</a> from ' + entry.via.name)
        .appendTo($meta);

    if (entry.plusones) {
      $('<span class="small-numeric-meta">')
          .text('+' + entry.plusones)
          .appendTo($meta);
    }
    if (entry.reshares) {
      $('<span class="small-numeric-meta">')
          .text(entry.reshares + ' reshare' +
              ((entry.reshares == 1) ? '' : 's'))
          .appendTo($meta);
    }
    if (entry.retweets) {
      $('<span class="small-numeric-meta">')
          .text(entry.retweets + ' retweet' +
              ((entry.retweets == 1) ? '' : 's'))
          .appendTo($meta);
    }
    if (entry.comments) {
      $('<span class="small-numeric-meta">')
          .text(entry.comments + ' comment' +
              ((entry.comments == 1) ? '' : 's'))
          .appendTo($meta);
    }

    $entry.appendTo('#news-feed');
  }
}

