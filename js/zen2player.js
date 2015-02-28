/**
 * zen2player - HTML5-CSS3 Audio Player
 * author DK
 * Reference @simurai
 * require jquery-1.7.2.js
 *         jquery.jplayer.js
 *         jquery.grab.js
 *         jquery.rotate.js
 */

$(function() {
    var oZen2player = {
        'sStatus': 'stop',
        'bDragging': false,
        '$zen2': $('.zen2'),
        '$player': $('.zen2 .player'),
        '$buffer': $('.zen2 .buffer'),
        '$progress': $('.zen2 .progress'),
        '$circle': $('.zen2 .circle'),
        '$button': $('.zen2 .button'),
        '$drag': $('.zen2 .drag'),
        'oAudio': {
            m4a: 'http://source1.sinaapp.com/audio/alifetimeoflove.m4a',
            oga: 'http://source1.sinaapp.com/audio/alifetimeoflove.ogg'
        },
        init: function() {
            var that = this;
            that.$player.jPlayer({
                ready: function() {
                    $(this).jPlayer('setMedia', that.oAudio);
                },
                swfPath: '',
                supplied: 'm4a, oga'
            });
            that._action();
        },
        _action: function() {
            var that = this;
            that.$player.bind($.jPlayer.event.progress, function(event) {
                var eAudio = $('.zen2 audio').get(0);
                var pc = 0;
                if ((eAudio.buffered != undefined) && (eAudio.buffered.length != 0)) {
                    pc = parseInt(((eAudio.buffered.end(0) / eAudio.duration) * 100), 10);
                    that._displayBuffered(pc);
                    pc >= 99 && that.$buffer.addClass('loaded');
                }
            });
            that.$player.bind($.jPlayer.event.loadeddata, function(event) {
                that.$buffer.addClass('loaded');
            });
            that.$player.bind($.jPlayer.event.timeupdate, function(event) {
                !that.bDragging && that._displayProgress(event.jPlayer.status.currentPercentAbsolute);
            });
            that.$player.bind($.jPlayer.event.ended, function(event) {
                that.$circle.removeClass('rotate');
                that.$zen2.removeClass('play');
                that.$progress.css('rotate', '0deg');
                that.sStatus = 'stop';
            });
            // play & pause
            var timer = null;
            var _onClick = function() {
                if (that.sStatus != 'play') {
                    that.sStatus = 'play';
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        that.$circle.addClass('rotate');
                    }, 1000);
                    that.$zen2.addClass('play');
                    that.$player.jPlayer('play');
                } else {
                    clearTimeout(timer);
                    that.$circle.removeClass('rotate');
                    that.$zen2.removeClass('play');
                    that.sStatus = 'pause';
                    that.$player.jPlayer('pause');
                }
            };
            that.$button.bind({
                mousedown: function(event) {
                    if (event.which != 1) return false;
                    $(this).bind('mouseleave', function() {
                        $(this).unbind('mouseleave');
                        _onClick();
                    });
                },
                mouseup: function(event) {
                    if (event.which != 1) return false;
                    $(this).unbind('mouseleave');
                    _onClick();
                }
            });
            // draggin
            that.$drag.grab({
                onstart: function() {
                    if (arguments[0].event.which != 1) return false;
                    that.bDragging = true;
                    that.$button.css('pointer-events', 'none');
                },
                onmove: function(event) {
                    if (arguments[0].event.which != 1) return false;
                    var pc = that._getArcPc(event.position.x, event.position.y);
                    that.$player.jPlayer('playHead', pc).jPlayer('play');
                    that._displayProgress(pc);

                },
                onfinish: function(event) {
                    if (arguments[0].event.which != 1) return false;
                    that.bDragging = false;
                    var pc = that._getArcPc(event.position.x, event.position.y);
                    that.$player.jPlayer('playHead', pc).jPlayer('play');
                    that.$button.css('pointer-events', 'auto');
                }
            });
        },
        _displayProgress: function(pc) {
            var that = this;
            that.$progress.css('rotate', pc * 3.6 + 'deg');
        },
        _displayBuffered: function(pc) {
            var that = this;
            that.$buffer.css('rotate', pc * 3.6 + 'deg');
        },
        _getArcPc: function(pageX, pageY) {
            var that = this;
            var offset = that.$drag.offset();
            var x = pageX - offset.left - that.$drag.width() / 2;
            var y = pageY - offset.top - that.$drag.height() / 2;
            var a = Math.atan2(y, x);
            if (a > -1 * Math.PI && a < -0.5 * Math.PI) {
                a = 2 * Math.PI + a;
            }
            // a is now value between -0.5PI and 1.5PI 
            // ready to be normalized and applied               
            var pc = (a + Math.PI / 2) / 2 * Math.PI * 10;
            return pc;
        }
    };
    oZen2player.init();
});