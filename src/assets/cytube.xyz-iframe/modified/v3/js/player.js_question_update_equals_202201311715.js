(function() {
  var CUSTOM_EMBED_WARNING, CustomEmbedPlayer, DEFAULT_ERROR, DailymotionPlayer, EmbedPlayer, FilePlayer, GoogleDrivePlayer, HLSPlayer, IframeChild, LivestreamPlayer, NicoPlayer, OdyseePlayer, PEERTUBE_EMBED_WARNING, PEERTUBE_RISK, PeerPlayer, Player, PlayerJSPlayer, RTMPPlayer, SoundCloudPlayer, StreamablePlayer, TYPE_MAP, TwitchClipPlayer, TwitchPlayer, VideoJSPlayer, VimeoPlayer, YouTubePlayer, codecToMimeType, genParam, getSourceLabel, hasAnyTextTracks, sortSources,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.Player = Player = (function() {
    function Player(data) {
      if (!(this instanceof Player)) {
        return new Player(data);
      }
      this.setMediaProperties(data);
      this.paused = false;
    }

    Player.prototype.load = function(data) {
      return this.setMediaProperties(data);
    };

    Player.prototype.setMediaProperties = function(data) {
      this.mediaId = data.id;
      this.mediaType = data.type;
      return this.mediaLength = data.seconds;
    };

    Player.prototype.play = function() {
      return this.paused = false;
    };

    Player.prototype.pause = function() {
      return this.paused = true;
    };

    Player.prototype.seekTo = function(time) {};

    Player.prototype.setVolume = function(volume) {};

    Player.prototype.getTime = function(cb) {
      return cb(0);
    };

    Player.prototype.isPaused = function(cb) {
      return cb(this.paused);
    };

    Player.prototype.getVolume = function(cb) {
      return cb(VOLUME);
    };

    Player.prototype.destroy = function() {};

    return Player;

  })();

  window.DailymotionPlayer = DailymotionPlayer = (function(superClass) {
    extend(DailymotionPlayer, superClass);

    function DailymotionPlayer(data) {
      if (!(this instanceof DailymotionPlayer)) {
        return new DailymotionPlayer(data);
      }
      this.setMediaProperties(data);
      this.initialVolumeSet = false;
      this.playbackReadyCb = null;
      waitUntilDefined(window, 'DM', (function(_this) {
        return function() {
          var params, quality;
          removeOld();
          params = {
            autoplay: 1,
            logo: 0
          };
          quality = _this.mapQuality(USEROPTS.default_quality);
          if (quality !== 'auto') {
            params.quality = quality;
          }
          _this.dm = DM.player('ytapiplayer', {
            video: data.id,
            width: parseInt(VWIDTH, 10),
            height: parseInt(VHEIGHT, 10),
            params: params
          });
          return _this.dm.addEventListener('apiready', function() {
            _this.dmReady = true;
            _this.dm.addEventListener('ended', function() {
              if (CLIENT.leader) {
                return socket.emit('playNext');
              }
            });
            _this.dm.addEventListener('pause', function() {
              _this.paused = true;
              if (CLIENT.leader) {
                return sendVideoUpdate();
              }
            });
            _this.dm.addEventListener('playing', function() {
              _this.paused = false;
              if (CLIENT.leader) {
                sendVideoUpdate();
              }
              if (!_this.initialVolumeSet) {
                _this.setVolume(VOLUME);
                return _this.initialVolumeSet = true;
              }
            });
            _this.dm.addEventListener('video_end', function() {
              return _this.dmReady = false;
            });
            return _this.dm.addEventListener('playback_ready', function() {
              _this.dmReady = true;
              if (_this.playbackReadyCb) {
                _this.playbackReadyCb();
                return _this.playbackReadyCb = null;
              }
            });
          });
        };
      })(this));
    }

    DailymotionPlayer.prototype.load = function(data) {
      this.setMediaProperties(data);
      if (this.dm && this.dmReady) {
        this.dm.load(data.id);
        return this.dm.seek(data.currentTime);
      } else if (this.dm) {
        console.log('Warning: load() called before DM is ready, queueing callback');
        return this.playbackReadyCb = (function(_this) {
          return function() {
            _this.dm.load(data.id);
            return _this.dm.seek(data.currentTime);
          };
        })(this);
      } else {
        return console.error('WTF?  DailymotionPlayer::load() called but @dm is undefined');
      }
    };

    DailymotionPlayer.prototype.pause = function() {
      if (this.dm && this.dmReady) {
        this.paused = true;
        return this.dm.pause();
      }
    };

    DailymotionPlayer.prototype.play = function() {
      if (this.dm && this.dmReady) {
        this.paused = false;
        return this.dm.play();
      }
    };

    DailymotionPlayer.prototype.seekTo = function(time) {
      if (this.dm && this.dmReady) {
        return this.dm.seek(time);
      }
    };

    DailymotionPlayer.prototype.setVolume = function(volume) {
      if (this.dm && this.dmReady) {
        return this.dm.setVolume(volume);
      }
    };

    DailymotionPlayer.prototype.getTime = function(cb) {
      if (this.dm && this.dmReady) {
        return cb(this.dm.currentTime);
      } else {
        return cb(0);
      }
    };

    DailymotionPlayer.prototype.getVolume = function(cb) {
      var volume;
      if (this.dm && this.dmReady) {
        if (this.dm.muted) {
          return cb(0);
        } else {
          volume = this.dm.volume;
          if (volume > 1) {
            volume /= 100;
          }
          return cb(volume);
        }
      } else {
        return cb(VOLUME);
      }
    };

    DailymotionPlayer.prototype.mapQuality = function(quality) {
      switch (String(quality)) {
        case '240':
        case '480':
        case '720':
        case '1080':
          return String(quality);
        case '360':
          return '380';
        case 'best':
          return '1080';
        default:
          return 'auto';
      }
    };

    DailymotionPlayer.prototype.destroy = function() {
      if (this.dm) {
        return this.dm.destroy('ytapiplayer');
      }
    };

    return DailymotionPlayer;

  })(Player);

  window.NicoPlayer = NicoPlayer = (function(superClass) {
    extend(NicoPlayer, superClass);

    function NicoPlayer(data) {
      if (!(this instanceof NicoPlayer)) {
        return new NicoPlayer(data);
      }
      this.load(data);
    }

    NicoPlayer.prototype.load = function(data) {
      this.setMediaProperties(data);
      return waitUntilDefined(window, 'NicovideoEmbed', (function(_this) {
        return function() {
          _this.nico = new NicovideoEmbed({
            playerId: 'ytapiplayer',
            videoId: data.id
          });
          removeOld($(_this.nico.iframe));
          _this.nico.on('ended', function() {
            if (CLIENT.leader) {
              return socket.emit('playNext');
            }
          });
          _this.nico.on('pause', function() {
            _this.paused = true;
            if (CLIENT.leader) {
              return sendVideoUpdate();
            }
          });
          _this.nico.on('play', function() {
            _this.paused = false;
            if (CLIENT.leader) {
              return sendVideoUpdate();
            }
          });
          return _this.nico.on('ready', function() {
            _this.play();
            return _this.setVolume(VOLUME);
          });
        };
      })(this));
    };

    NicoPlayer.prototype.play = function() {
      this.paused = false;
      if (this.nico) {
        return this.nico.play();
      }
    };

    NicoPlayer.prototype.pause = function() {
      this.paused = true;
      if (this.nico) {
        return this.nico.pause();
      }
    };

    NicoPlayer.prototype.seekTo = function(time) {
      if (this.nico) {
        return this.nico.seek(time * 1000);
      }
    };

    NicoPlayer.prototype.setVolume = function(volume) {
      if (this.nico) {
        return this.nico.volumeChange(volume);
      }
    };

    NicoPlayer.prototype.getTime = function(cb) {
      if (this.nico) {
        return cb(parseFloat(this.nico.state.currentTime / 1000));
      } else {
        return cb(0);
      }
    };

    NicoPlayer.prototype.getVolume = function(cb) {
      if (this.nico) {
        return cb(parseFloat(this.nico.state.volume));
      } else {
        return cb(VOLUME);
      }
    };

    return NicoPlayer;

  })(Player);

  PEERTUBE_EMBED_WARNING = 'This channel is embedding PeerTube content from %link%. PeerTube instances may use P2P technology that will expose your IP address to third parties, including but not limited to other users in this channel. It is also conceivable that if the content in question is in violation of copyright laws your IP address could be potentially be observed by legal authorities monitoring the tracker of this PeerTube instance. The operators of %site% are not responsible for the data sent by the embedded player to third parties on your behalf.<br><br> If you understand the risks, wish to assume all liability, and continue to the content, click "Embed" below to allow the content to be embedded.<hr>';

  PEERTUBE_RISK = false;

  window.PeerPlayer = PeerPlayer = (function(superClass) {
    extend(PeerPlayer, superClass);

    function PeerPlayer(data) {
      if (!(this instanceof PeerPlayer)) {
        return new PeerPlayer(data);
      }
      this.warn(data);
    }

    PeerPlayer.prototype.warn = function(data) {
      var alert, embedSrc, link, site;
      if (USEROPTS.peertube_risk || PEERTUBE_RISK) {
        return this.load(data);
      }
      site = new URL(document.URL).hostname;
      embedSrc = data.meta.embed.domain;
      link = "<a href=\"http://" + embedSrc + "\" target=\"_blank\"><strong>" + embedSrc + "</strong></a>";
      alert = makeAlert('Privacy Advisory', PEERTUBE_EMBED_WARNING.replace('%link%', link).replace('%site%', site), 'alert-warning').removeClass('col-md-12');
      $('<button/>').addClass('btn btn-default').text('Embed').on('click', (function(_this) {
        return function() {
          return _this.load(data);
        };
      })(this)).appendTo(alert.find('.alert'));
      $('<button/>').addClass('btn btn-default pull-right').text('Embed and dont ask again for this session').on('click', (function(_this) {
        return function() {
          PEERTUBE_RISK = true;
          return _this.load(data);
        };
      })(this)).appendTo(alert.find('.alert'));
      return removeOld(alert);
    };

    PeerPlayer.prototype.load = function(data) {
      this.setMediaProperties(data);
      return waitUntilDefined(window, 'PeerTubePlayer', (function(_this) {
        return function() {
          var video;
          video = $('<iframe/>');
          removeOld(video);
          video.attr({
            src: "https://" + data.meta.embed.domain + "/videos/embed/" + data.meta.embed.uuid + "?api=1",
            allow: 'autoplay; fullscreen'
          });
          _this.peertube = new PeerTubePlayer(video[0]);
          _this.peertube.addEventListener('playbackStatusChange', function(status) {
            _this.paused = status === 'paused';
            if (CLIENT.leader) {
              return sendVideoUpdate();
            }
          });
          _this.peertube.addEventListener('playbackStatusUpdate', function(status) {
            _this.peertube.currentTime = status.position;
            if (status.playbackState === "ended" && CLIENT.leader) {
              return socket.emit('playNext');
            }
          });
          _this.peertube.addEventListener('volumeChange', function(volume) {
            var VOLUME;
            VOLUME = volume;
            return setOpt("volume", VOLUME);
          });
          _this.play();
          return _this.setVolume(VOLUME);
        };
      })(this));
    };

    PeerPlayer.prototype.play = function() {
      this.paused = false;
      if (this.peertube && this.peertube.ready) {
        return this.peertube.play()["catch"](function(error) {
          return console.error('PeerTube::play():', error);
        });
      }
    };

    PeerPlayer.prototype.pause = function() {
      this.paused = true;
      if (this.peertube && this.peertube.ready) {
        return this.peertube.pause()["catch"](function(error) {
          return console.error('PeerTube::pause():', error);
        });
      }
    };

    PeerPlayer.prototype.seekTo = function(time) {
      if (this.peertube && this.peertube.ready) {
        return this.peertube.seek(time);
      }
    };

    PeerPlayer.prototype.getVolume = function(cb) {
      if (this.peertube && this.peertube.ready) {
        return this.peertube.getVolume().then(function(volume) {
          return cb(parseFloat(volume));
        })["catch"](function(error) {
          return console.error('PeerTube::getVolume():', error);
        });
      } else {
        return cb(VOLUME);
      }
    };

    PeerPlayer.prototype.setVolume = function(volume) {
      if (this.peertube && this.peertube.ready) {
        return this.peertube.setVolume(volume)["catch"](function(error) {
          return console.error('PeerTube::setVolume():', error);
        });
      }
    };

    PeerPlayer.prototype.getTime = function(cb) {
      if (this.peertube && this.peertube.ready) {
        return cb(this.peertube.currentTime);
      } else {
        return cb(0);
      }
    };

    PeerPlayer.prototype.setQuality = function(quality) {};

    return PeerPlayer;

  })(Player);

  window.SoundCloudPlayer = SoundCloudPlayer = (function(superClass) {
    extend(SoundCloudPlayer, superClass);

    function SoundCloudPlayer(data) {
      if (!(this instanceof SoundCloudPlayer)) {
        return new SoundCloudPlayer(data);
      }
      this.setMediaProperties(data);
      waitUntilDefined(window, 'SC', (function(_this) {
        return function() {
          var sliderHolder, soundUrl, volumeSlider, widget;
          removeOld();
          if (data.meta.scuri) {
            soundUrl = data.meta.scuri;
          } else {
            soundUrl = data.id;
          }
          widget = $('<iframe/>').appendTo($('#ytapiplayer'));
          widget.attr({
            id: 'scplayer',
            src: "https://w.soundcloud.com/player/?url=" + soundUrl
          });
          sliderHolder = $('<div/>').attr('id', 'soundcloud-volume-holder').insertAfter(widget);
          $('<span/>').attr('id', 'soundcloud-volume-label').addClass('label label-default').text('Volume').appendTo(sliderHolder);
          volumeSlider = $('<div/>').attr('id', 'soundcloud-volume').appendTo(sliderHolder).slider({
            range: 'min',
            value: VOLUME * 100,
            stop: function(event, ui) {
              return _this.setVolume(ui.value / 100);
            }
          });
          _this.soundcloud = SC.Widget(widget[0]);
          return _this.soundcloud.bind(SC.Widget.Events.READY, function() {
            _this.soundcloud.ready = true;
            _this.setVolume(VOLUME);
            _this.play();
            _this.soundcloud.bind(SC.Widget.Events.PAUSE, function() {
              _this.paused = true;
              if (CLIENT.leader) {
                return sendVideoUpdate();
              }
            });
            _this.soundcloud.bind(SC.Widget.Events.PLAY, function() {
              _this.paused = false;
              if (CLIENT.leader) {
                return sendVideoUpdate();
              }
            });
            return _this.soundcloud.bind(SC.Widget.Events.FINISH, function() {
              if (CLIENT.leader) {
                return socket.emit('playNext');
              }
            });
          });
        };
      })(this));
    }

    SoundCloudPlayer.prototype.load = function(data) {
      var soundUrl;
      this.setMediaProperties(data);
      if (this.soundcloud && this.soundcloud.ready) {
        if (data.meta.scuri) {
          soundUrl = data.meta.scuri;
        } else {
          soundUrl = data.id;
        }
        this.soundcloud.load(soundUrl, {
          auto_play: true
        });
        return this.soundcloud.bind(SC.Widget.Events.READY, (function(_this) {
          return function() {
            return _this.setVolume(VOLUME);
          };
        })(this));
      } else {
        return console.error('SoundCloudPlayer::load() called but soundcloud is not ready');
      }
    };

    SoundCloudPlayer.prototype.play = function() {
      this.paused = false;
      if (this.soundcloud && this.soundcloud.ready) {
        return this.soundcloud.play();
      }
    };

    SoundCloudPlayer.prototype.pause = function() {
      this.paused = true;
      if (this.soundcloud && this.soundcloud.ready) {
        return this.soundcloud.pause();
      }
    };

    SoundCloudPlayer.prototype.seekTo = function(time) {
      if (this.soundcloud && this.soundcloud.ready) {
        return this.soundcloud.seekTo(time * 1000);
      }
    };

    SoundCloudPlayer.prototype.setVolume = function(volume) {
      if (this.soundcloud && this.soundcloud.ready) {
        return this.soundcloud.setVolume(volume * 100);
      }
    };

    SoundCloudPlayer.prototype.getTime = function(cb) {
      if (this.soundcloud && this.soundcloud.ready) {
        return this.soundcloud.getPosition(function(time) {
          return cb(time / 1000);
        });
      } else {
        return cb(0);
      }
    };

    SoundCloudPlayer.prototype.getVolume = function(cb) {
      if (this.soundcloud && this.soundcloud.ready) {
        return this.soundcloud.getVolume(function(vol) {
          return cb(vol / 100);
        });
      } else {
        return cb(VOLUME);
      }
    };

    return SoundCloudPlayer;

  })(Player);

  window.TWITCH_PARAMS_ERROR = 'The Twitch embed player now uses parameters which only work if the following requirements are met: (1) The embedding website uses HTTPS; (2) The embedding website uses the default port (443) and is accessed via https://example.com instead of https://example.com:port.  I have no control over this -- see <a href="https://discuss.dev.twitch.tv/t/twitch-embedded-player-migration-timeline-update/25588" rel="noopener noreferrer" target="_blank">this Twitch post</a> for details';

  window.TwitchPlayer = TwitchPlayer = (function(superClass) {
    extend(TwitchPlayer, superClass);

    function TwitchPlayer(data) {
      if (!(this instanceof TwitchPlayer)) {
        return new TwitchPlayer(data);
      }
      this.setMediaProperties(data);
      waitUntilDefined(window, 'Twitch', (function(_this) {
        return function() {
          return waitUntilDefined(Twitch, 'Player', function() {
            return _this.init(data);
          });
        };
      })(this));
    }

    TwitchPlayer.prototype.init = function(data) {
      var alert, options;
      removeOld();
      if (location.hostname !== location.host || location.protocol !== 'https:') {
        alert = makeAlert('Twitch API Parameters', window.TWITCH_PARAMS_ERROR, 'alert-danger').removeClass('col-md-12');
        removeOld(alert);
        this.twitch = null;
        return;
      }
      options = {
        parent: [location.hostname],
        width: $('#ytapiplayer').width(),
        height: $('#ytapiplayer').height()
      };
      if (data.type === 'tv') {
        options.video = data.id;
      } else {
        options.channel = data.id;
      }
      this.twitch = new Twitch.Player('ytapiplayer', options);
      return this.twitch.addEventListener(Twitch.Player.READY, (function(_this) {
        return function() {
          _this.setVolume(VOLUME);
          _this.twitch.setQuality(_this.mapQuality(USEROPTS.default_quality));
          _this.twitch.addEventListener(Twitch.Player.PLAY, function() {
            _this.paused = false;
            if (CLIENT.leader) {
              return sendVideoUpdate();
            }
          });
          _this.twitch.addEventListener(Twitch.Player.PAUSE, function() {
            _this.paused = true;
            if (CLIENT.leader) {
              return sendVideoUpdate();
            }
          });
          return _this.twitch.addEventListener(Twitch.Player.ENDED, function() {
            if (CLIENT.leader) {
              return socket.emit('playNext');
            }
          });
        };
      })(this));
    };

    TwitchPlayer.prototype.load = function(data) {
      var error;
      this.setMediaProperties(data);
      try {
        if (data.type === 'tv') {
          return this.twitch.setVideo(data.id);
        } else {
          return this.twitch.setChannel(data.id);
        }
      } catch (error1) {
        error = error1;
        return console.error(error);
      }
    };

    TwitchPlayer.prototype.pause = function() {
      var error;
      try {
        this.twitch.pause();
        return this.paused = true;
      } catch (error1) {
        error = error1;
        return console.error(error);
      }
    };

    TwitchPlayer.prototype.play = function() {
      var error;
      try {
        this.twitch.play();
        return this.paused = false;
      } catch (error1) {
        error = error1;
        return console.error(error);
      }
    };

    TwitchPlayer.prototype.seekTo = function(time) {
      var error;
      try {
        return this.twitch.seek(time);
      } catch (error1) {
        error = error1;
        return console.error(error);
      }
    };

    TwitchPlayer.prototype.getTime = function(cb) {
      var error;
      try {
        return cb(this.twitch.getCurrentTime());
      } catch (error1) {
        error = error1;
        return console.error(error);
      }
    };

    TwitchPlayer.prototype.setVolume = function(volume) {
      var error;
      try {
        this.twitch.setVolume(volume);
        if (volume > 0) {
          return this.twitch.setMuted(false);
        }
      } catch (error1) {
        error = error1;
        return console.error(error);
      }
    };

    TwitchPlayer.prototype.getVolume = function(cb) {
      var error;
      try {
        if (this.twitch.isPaused()) {
          return cb(0);
        } else {
          return cb(this.twitch.getVolume());
        }
      } catch (error1) {
        error = error1;
        return console.error(error);
      }
    };

    TwitchPlayer.prototype.mapQuality = function(quality) {
      switch (String(quality)) {
        case '1080':
          return 'chunked';
        case '720':
          return 'high';
        case '480':
          return 'medium';
        case '360':
          return 'low';
        case '240':
          return 'mobile';
        case 'best':
          return 'chunked';
        default:
          return '';
      }
    };

    return TwitchPlayer;

  })(Player);

  window.VimeoPlayer = VimeoPlayer = (function(superClass) {
    extend(VimeoPlayer, superClass);

    function VimeoPlayer(data) {
      if (!(this instanceof VimeoPlayer)) {
        return new VimeoPlayer(data);
      }
      this.load(data);
    }

    VimeoPlayer.prototype.load = function(data) {
      this.setMediaProperties(data);
      return waitUntilDefined(window, 'Vimeo', (function(_this) {
        return function() {
          var video;
          video = $('<iframe/>');
          removeOld(video);
          video.attr({
            src: "https://player.vimeo.com/video/" + data.id,
            allow: 'autoplay; fullscreen'
          });
          _this.vimeo = new Vimeo.Player(video[0]);
          _this.vimeo.on('ended', function() {
            if (CLIENT.leader) {
              return socket.emit('playNext');
            }
          });
          _this.vimeo.on('pause', function() {
            _this.paused = true;
            if (CLIENT.leader) {
              return sendVideoUpdate();
            }
          });
          _this.vimeo.on('play', function() {
            _this.paused = false;
            if (CLIENT.leader) {
              return sendVideoUpdate();
            }
          });
          _this.play();
          return _this.setVolume(VOLUME);
        };
      })(this));
    };

    VimeoPlayer.prototype.play = function() {
      this.paused = false;
      if (this.vimeo) {
        return this.vimeo.play()["catch"](function(error) {
          return console.error('vimeo::play():', error);
        });
      }
    };

    VimeoPlayer.prototype.pause = function() {
      this.paused = true;
      if (this.vimeo) {
        return this.vimeo.pause()["catch"](function(error) {
          return console.error('vimeo::pause():', error);
        });
      }
    };

    VimeoPlayer.prototype.seekTo = function(time) {
      if (this.vimeo) {
        return this.vimeo.setCurrentTime(time)["catch"](function(error) {
          return console.error('vimeo::setCurrentTime():', error);
        });
      }
    };

    VimeoPlayer.prototype.setVolume = function(volume) {
      if (this.vimeo) {
        return this.vimeo.setVolume(volume)["catch"](function(error) {
          return console.error('vimeo::setVolume():', error);
        });
      }
    };

    VimeoPlayer.prototype.getTime = function(cb) {
      if (this.vimeo) {
        return this.vimeo.getCurrentTime().then(function(time) {
          return cb(parseFloat(time));
        })["catch"](function(error) {
          return console.error('vimeo::getCurrentTime():', error);
        });
      } else {
        return cb(0);
      }
    };

    VimeoPlayer.prototype.getVolume = function(cb) {
      if (this.vimeo) {
        return this.vimeo.getVolume().then(function(volume) {
          return cb(parseFloat(volume));
        })["catch"](function(error) {
          return console.error('vimeo::getVolume():', error);
        });
      } else {
        return cb(VOLUME);
      }
    };

    return VimeoPlayer;

  })(Player);

  window.YouTubePlayer = YouTubePlayer = (function(superClass) {
    extend(YouTubePlayer, superClass);

    function YouTubePlayer(data) {
      if (!(this instanceof YouTubePlayer)) {
        return new YouTubePlayer(data);
      }
      this.setMediaProperties(data);
      this.pauseSeekRaceCondition = false;
      waitUntilDefined(window, 'YT', (function(_this) {
        return function() {
          return waitUntilDefined(YT, 'Player', function() {
            removeOld();
            return _this.yt = new YT.Player('ytapiplayer', {
              videoId: data.id,
              playerVars: {
                autohide: 1,
                autoplay: 1,
                controls: 1,
                iv_load_policy: 3,
                rel: 0
              },
              events: {
                onReady: _this.onReady.bind(_this),
                onStateChange: _this.onStateChange.bind(_this)
              }
            });
          });
        };
      })(this));
    }

    YouTubePlayer.prototype.load = function(data) {
      this.setMediaProperties(data);
      if (this.yt && this.yt.ready) {
        return this.yt.loadVideoById(data.id, data.currentTime);
      } else {
        return console.error('WTF?  YouTubePlayer::load() called but yt is not ready');
      }
    };

    YouTubePlayer.prototype.onReady = function() {
      this.yt.ready = true;
      return this.setVolume(VOLUME);
    };

    YouTubePlayer.prototype.onStateChange = function(ev) {
      if (ev.data === YT.PlayerState.PLAYING && this.pauseSeekRaceCondition) {
        this.pause();
        this.pauseSeekRaceCondition = false;
      }
      if ((ev.data === YT.PlayerState.PAUSED && !this.paused) || (ev.data === YT.PlayerState.PLAYING && this.paused)) {
        this.paused = ev.data === YT.PlayerState.PAUSED;
        if (CLIENT.leader) {
          sendVideoUpdate();
        }
      }
      if (ev.data === YT.PlayerState.ENDED && CLIENT.leader) {
        return socket.emit('playNext');
      }
    };

    YouTubePlayer.prototype.play = function() {
      this.paused = false;
      if (this.yt && this.yt.ready) {
        return this.yt.playVideo();
      }
    };

    YouTubePlayer.prototype.pause = function() {
      this.paused = true;
      if (this.yt && this.yt.ready) {
        return this.yt.pauseVideo();
      }
    };

    YouTubePlayer.prototype.seekTo = function(time) {
      if (this.yt && this.yt.ready) {
        return this.yt.seekTo(time, true);
      }
    };

    YouTubePlayer.prototype.setVolume = function(volume) {
      if (this.yt && this.yt.ready) {
        if (volume > 0) {
          this.yt.unMute();
        }
        return this.yt.setVolume(volume * 100);
      }
    };

    YouTubePlayer.prototype.setQuality = function(quality) {};

    YouTubePlayer.prototype.getTime = function(cb) {
      if (this.yt && this.yt.ready) {
        return cb(this.yt.getCurrentTime());
      } else {
        return cb(0);
      }
    };

    YouTubePlayer.prototype.getVolume = function(cb) {
      if (this.yt && this.yt.ready) {
        if (this.yt.isMuted()) {
          return cb(0);
        } else {
          return cb(this.yt.getVolume() / 100);
        }
      } else {
        return cb(VOLUME);
      }
    };

    return YouTubePlayer;

  })(Player);

  window.PlayerJSPlayer = PlayerJSPlayer = (function(superClass) {
    extend(PlayerJSPlayer, superClass);

    function PlayerJSPlayer(data) {
      if (!(this instanceof PlayerJSPlayer)) {
        return new PlayerJSPlayer(data);
      }
      this.load(data);
    }

    PlayerJSPlayer.prototype.load = function(data) {
      this.setMediaProperties(data);
      this.ready = false;
      if (!data.meta.playerjs) {
        throw new Error('Invalid input: missing meta.playerjs');
      }
      return waitUntilDefined(window, 'playerjs', (function(_this) {
        return function() {
          var iframe;
          iframe = $('<iframe/>').attr({
            src: data.meta.playerjs.src,
            allow: 'autoplay; fullscreen'
          });
          removeOld(iframe);
          return _this.setupPlayer(iframe[0]);
        };
      })(this));
    };

    PlayerJSPlayer.prototype.setupPlayer = function(iframe) {
      this.player = new playerjs.Player(iframe);
      return this.player.on('ready', (function(_this) {
        return function() {
          _this.player.on('error', function(error) {
            return console.error('PlayerJS error', error.stack);
          });
          _this.player.on('ended', function() {
            if (CLIENT.leader) {
              return socket.emit('playNext');
            }
          });
          _this.player.on('play', function() {
            this.paused = false;
            if (CLIENT.leader) {
              return sendVideoUpdate();
            }
          });
          _this.player.on('pause', function() {
            this.paused = true;
            if (CLIENT.leader) {
              return sendVideoUpdate();
            }
          });
          _this.player.setVolume(VOLUME * 100);
          if (!_this.paused) {
            _this.player.play();
          }
          return _this.ready = true;
        };
      })(this));
    };

    PlayerJSPlayer.prototype.play = function() {
      this.paused = false;
      if (this.player && this.ready) {
        return this.player.play();
      }
    };

    PlayerJSPlayer.prototype.pause = function() {
      this.paused = true;
      if (this.player && this.ready) {
        return this.player.pause();
      }
    };

    PlayerJSPlayer.prototype.seekTo = function(time) {
      if (this.player && this.ready) {
        return this.player.setCurrentTime(time);
      }
    };

    PlayerJSPlayer.prototype.setVolume = function(volume) {
      if (this.player && this.ready) {
        return this.player.setVolume(volume * 100);
      }
    };

    PlayerJSPlayer.prototype.getTime = function(cb) {
      if (this.player && this.ready) {
        return this.player.getCurrentTime(cb);
      } else {
        return cb(0);
      }
    };

    PlayerJSPlayer.prototype.getVolume = function(cb) {
      if (this.player && this.ready) {
        return this.player.getVolume(function(volume) {
          return cb(volume / 100);
        });
      } else {
        return cb(VOLUME);
      }
    };

    return PlayerJSPlayer;

  })(Player);

  window.IframeChild = IframeChild = (function(superClass) {
    extend(IframeChild, superClass);

    function IframeChild(data) {
      if (!(this instanceof IframeChild)) {
        return new IframeChild(data);
      }
      IframeChild.__super__.constructor.call(this, data);
    }

    IframeChild.prototype.load = function(data) {
      this.setMediaProperties(data);
      this.ready = false;
      return waitUntilDefined(window, 'playerjs', (function(_this) {
        return function() {
          var iframe;
          iframe = $('<iframe/>').attr({
            src: '/iframe',
            allow: 'autoplay; fullscreen'
          });
          removeOld(iframe);
          _this.setupFrame(iframe[0], data);
          return _this.setupPlayer(iframe[0]);
        };
      })(this));
    };

    IframeChild.prototype.setupFrame = function(iframe, data) {
      return iframe.addEventListener('load', (function(_this) {
        return function() {
          var adapter, ref;
          iframe.contentWindow.VOLUME = VOLUME;
          iframe.contentWindow.loadMediaPlayer(Object.assign({}, data, {
            type: 'cm'
          }));
          iframe.contentWindow.document.querySelector('#ytapiplayer').classList.add('vjs-16-9');
          adapter = iframe.contentWindow.playerjs.VideoJSAdapter(iframe.contentWindow.PLAYER.player);
          adapter.ready();
          return typeof (data != null ? (ref = data.meta) != null ? ref.thumbnail : void 0 : void 0) === 'string' && iframe.contentWindow.PLAYER.player.poster(data.meta.thumbnail);
        };
      })(this));
    };

    return IframeChild;

  })(PlayerJSPlayer);

  window.OdyseePlayer = OdyseePlayer = (function(superClass) {
    extend(OdyseePlayer, superClass);

    function OdyseePlayer(data) {
      if (!(this instanceof OdyseePlayer)) {
        return new OdyseePlayer(data);
      }
      OdyseePlayer.__super__.constructor.call(this, data);
    }

    OdyseePlayer.prototype.load = function(data) {
      this.ready = false;
      this.setMediaProperties(data);
      return waitUntilDefined(window, 'playerjs', (function(_this) {
        return function() {
          var iframe;
          iframe = $('<iframe/>').attr({
            src: data.meta.embed.src,
            allow: 'autoplay; fullscreen'
          });
          removeOld(iframe);
          return _this.setupPlayer(iframe[0], data);
        };
      })(this));
    };

    return OdyseePlayer;

  })(PlayerJSPlayer);

  window.StreamablePlayer = StreamablePlayer = (function(superClass) {
    extend(StreamablePlayer, superClass);

    function StreamablePlayer(data) {
      if (!(this instanceof StreamablePlayer)) {
        return new StreamablePlayer(data);
      }
      StreamablePlayer.__super__.constructor.call(this, data);
    }

    StreamablePlayer.prototype.load = function(data) {
      this.ready = false;
      this.finishing = false;
      this.setMediaProperties(data);
      return waitUntilDefined(window, 'playerjs', (function(_this) {
        return function() {
          var iframe;
          iframe = $('<iframe/>').attr({
            src: "https://streamable.com/e/" + data.id,
            allow: 'autoplay; fullscreen'
          });
          removeOld(iframe);
          _this.setupPlayer(iframe[0]);
          return _this.player.on('ready', function() {
            return _this.player.on('timeupdate', function(time) {
              if (time.duration - time.seconds < 1 && !_this.finishing) {
                setTimeout(function() {
                  if (CLIENT.leader) {
                    socket.emit('playNext');
                  }
                  return _this.pause();
                }, (time.duration - time.seconds) * 1000);
                return _this.finishing = true;
              }
            });
          });
        };
      })(this));
    };

    return StreamablePlayer;

  })(PlayerJSPlayer);

  DEFAULT_ERROR = 'You are currently connected via HTTPS but the embedded content uses non-secure plain HTTP.  Your browser therefore blocks it from loading due to mixed content policy.  To fix this, embed the video using a secure link if available (https://...), or find another source for the content.';

  genParam = function(name, value) {
    return $('<param/>').attr({
      name: name,
      value: value
    });
  };

  window.EmbedPlayer = EmbedPlayer = (function(superClass) {
    extend(EmbedPlayer, superClass);

    function EmbedPlayer(data) {
      if (!(this instanceof EmbedPlayer)) {
        return new EmbedPlayer(data);
      }
      this.load(data);
    }

    EmbedPlayer.prototype.load = function(data) {
      var embed;
      this.setMediaProperties(data);
      embed = data.meta.embed;
      if (embed == null) {
        console.error('EmbedPlayer::load(): missing meta.embed');
        return;
      }
      this.player = this.loadIframe(embed);
      return removeOld(this.player);
    };

    EmbedPlayer.prototype.loadIframe = function(embed) {
      var alert, error, iframe;
      if (embed.src.indexOf('http:') === 0 && location.protocol === 'https:') {
        if (this.__proto__.mixedContentError != null) {
          error = this.__proto__.mixedContentError;
        } else {
          error = DEFAULT_ERROR;
        }
        alert = makeAlert('Mixed Content Error', error, 'alert-danger').removeClass('col-md-12');
        alert.find('.close').remove();
        return alert;
      } else {
        iframe = $('<iframe/>').attr({
          src: embed.src,
          frameborder: '0',
          allow: 'autoplay',
          allowfullscreen: '1'
        });
        return iframe;
      }
    };

    return EmbedPlayer;

  })(Player);

  CUSTOM_EMBED_WARNING = 'This channel is embedding custom content from %link%. Since this content is not trusted, you must click "Embed" below to allow the content to be embedded.<hr>';

  window.CustomEmbedPlayer = CustomEmbedPlayer = (function(superClass) {
    extend(CustomEmbedPlayer, superClass);

    function CustomEmbedPlayer(data) {
      if (!(this instanceof CustomEmbedPlayer)) {
        return new CustomEmbedPlayer(data);
      }
      this.load(data);
    }

    CustomEmbedPlayer.prototype.load = function(data) {
      var alert, embedSrc, link;
      if (data.meta.embed == null) {
        console.error('CustomEmbedPlayer::load(): missing meta.embed');
        return;
      }
      embedSrc = data.meta.embed.src;
      link = "<a href=\"" + embedSrc + "\" target=\"_blank\"><strong>" + embedSrc + "</strong></a>";
      alert = makeAlert('Untrusted Content', CUSTOM_EMBED_WARNING.replace('%link%', link), 'alert-warning').removeClass('col-md-12');
      $('<button/>').addClass('btn btn-default').text('Embed').on('click', (function(_this) {
        return function() {
          return CustomEmbedPlayer.__super__.load.call(_this, data);
        };
      })(this)).appendTo(alert.find('.alert'));
      return removeOld(alert);
    };

    return CustomEmbedPlayer;

  })(EmbedPlayer);

  window.LivestreamPlayer = LivestreamPlayer = (function(superClass) {
    extend(LivestreamPlayer, superClass);

    function LivestreamPlayer(data) {
      if (!(this instanceof LivestreamPlayer)) {
        return new LivestreamPlayer(data);
      }
      this.load(data);
    }

    LivestreamPlayer.prototype.load = function(data) {
      var account, event, ref;
      ref = data.id.split(';'), account = ref[0], event = ref[1];
      data.meta.embed = {
        src: "https://livestream.com/accounts/" + account + "/events/" + event + "/player?enableInfoAndActivity=false&defaultDrawer=&autoPlay=true&mute=false",
        tag: 'iframe'
      };
      return LivestreamPlayer.__super__.load.call(this, data);
    };

    return LivestreamPlayer;

  })(EmbedPlayer);

  window.TwitchClipPlayer = TwitchClipPlayer = (function(superClass) {
    extend(TwitchClipPlayer, superClass);

    function TwitchClipPlayer(data) {
      if (!(this instanceof TwitchClipPlayer)) {
        return new TwitchClipPlayer(data);
      }
      this.load(data);
    }

    TwitchClipPlayer.prototype.load = function(data) {
      var alert;
      if (location.hostname !== location.host || location.protocol !== 'https:') {
        alert = makeAlert('Twitch API Parameters', window.TWITCH_PARAMS_ERROR, 'alert-danger').removeClass('col-md-12');
        removeOld(alert);
        return;
      }
      data.meta.embed = {
        tag: 'iframe',
        src: "https://clips.twitch.tv/embed?clip=" + data.id + "&parent=" + location.host
      };
      return TwitchClipPlayer.__super__.load.call(this, data);
    };

    return TwitchClipPlayer;

  })(EmbedPlayer);

  sortSources = function(sources) {
    var flv, flvOrder, idx, j, len, nonflv, pref, qualities, quality, qualityOrder, sourceOrder;
    if (!sources) {
      console.error('sortSources() called with null source list');
      return [];
    }
    qualities = ['2160', '1440', '1080', '720', '540', '480', '360', '240'];
    pref = String(USEROPTS.default_quality);
    if (USEROPTS.default_quality === 'best') {
      pref = '2160';
    }
    idx = qualities.indexOf(pref);
    if (idx < 0) {
      idx = 5;
    }
    qualityOrder = qualities.slice(idx).concat(qualities.slice(0, idx).reverse());
    qualityOrder.unshift('auto');
    sourceOrder = [];
    flvOrder = [];
    for (j = 0, len = qualityOrder.length; j < len; j++) {
      quality = qualityOrder[j];
      if (quality in sources) {
        flv = [];
        nonflv = [];
        sources[quality].forEach(function(source) {
          source.quality = quality;
          if (source.contentType === 'video/flv') {
            return flv.push(source);
          } else {
            return nonflv.push(source);
          }
        });
        sourceOrder = sourceOrder.concat(nonflv);
        flvOrder = flvOrder.concat(flv);
      }
    }
    return sourceOrder.concat(flvOrder).map(function(source) {
      return {
        type: source.contentType,
        src: source.link,
        res: source.quality,
        label: getSourceLabel(source)
      };
    });
  };

  getSourceLabel = function(source) {
    if (source.res === 'auto') {
      return 'auto';
    } else {
      return source.quality + "p " + (source.contentType.split('/')[1]);
    }
  };

  hasAnyTextTracks = function(data) {
    var ntracks, ref, ref1, ref2;
    ntracks = (ref = data != null ? (ref1 = data.meta) != null ? (ref2 = ref1.textTracks) != null ? ref2.length : void 0 : void 0 : void 0) != null ? ref : 0;
    return ntracks > 0;
  };

  window.VideoJSPlayer = VideoJSPlayer = (function(superClass) {
    extend(VideoJSPlayer, superClass);

    function VideoJSPlayer(data) {
      if (!(this instanceof VideoJSPlayer)) {
        return new VideoJSPlayer(data);
      }
      this.load(data);
    }

    VideoJSPlayer.prototype.loadPlayer = function(data) {
      return waitUntilDefined(window, 'videojs', (function(_this) {
        return function() {
          var attrs, video;
          attrs = {
            width: '100%',
            height: '100%'
          };
          if (_this.mediaType === 'cm' && hasAnyTextTracks(data)) {
            attrs.crossorigin = 'anonymous';
          }
          video = $('<video/>').addClass('video-js vjs-default-skin embed-responsive-item').attr(attrs);
          removeOld(video);
          _this.sources = sortSources(data.meta.direct);
          if (_this.sources.length === 0) {
            console.error('VideoJSPlayer::constructor(): data.meta.direct has no sources!');
            _this.mediaType = null;
            return;
          }
          _this.sourceIdx = 0;
          if (data.meta.gdrive_subtitles) {
            data.meta.gdrive_subtitles.available.forEach(function(subt) {
              var label;
              label = subt.lang_original;
              if (subt.name) {
                label += " (" + subt.name + ")";
              }
              return $('<track/>').attr({
                src: "/gdvtt/" + data.id + "/" + subt.lang + "/" + subt.name + ".vtt?vid=" + data.meta.gdrive_subtitles.vid,
                kind: 'subtitles',
                srclang: subt.lang,
                label: label
              }).appendTo(video);
            });
          }
          if (data.meta.textTracks) {
            data.meta.textTracks.forEach(function(track) {
              var label;
              label = track.name;
              attrs = {
                src: track.url,
                kind: 'subtitles',
                type: track.type,
                label: label
              };
              if ((track["default"] != null) && track["default"]) {
                attrs["default"] = '';
              }
              return $('<track/>').attr(attrs).appendTo(video);
            });
          }
          _this.player = videojs(video[0], {
            autoplay: _this.sources[0].type !== 'application/dash+xml',
            controls: true,
            plugins: {
              videoJsResolutionSwitcher: {
                "default": _this.sources[0].res
              }
            }
          });
          return _this.player.ready(function() {
            _this.player.poster(data.meta.thumbnail);
            _this.player.updateSrc(_this.sources);
            _this.player.on('error', function() {
              var err;
              err = _this.player.error();
              if (err && err.code === 4) {
                console.error('Caught error, trying next source');
                _this.sourceIdx++;
                if (_this.sourceIdx < _this.sources.length) {
                  return _this.player.src(_this.sources[_this.sourceIdx]);
                } else {
                  console.error('Out of sources, video will not play');
                  if (_this.mediaType === 'gd') {
                    if (!window.hasDriveUserscript) {
                      return window.promptToInstallDriveUserscript();
                    } else {
                      return window.tellUserNotToContactMeAboutThingsThatAreNotSupported();
                    }
                  }
                }
              }
            });
            _this.setVolume(VOLUME);
            _this.player.on('ended', function() {
              if (CLIENT.leader) {
                return socket.emit('playNext');
              }
            });
            _this.player.on('pause', function() {
              _this.paused = true;
              if (CLIENT.leader) {
                return sendVideoUpdate();
              }
            });
            _this.player.on('play', function() {
              _this.paused = false;
              if (CLIENT.leader) {
                return sendVideoUpdate();
              }
            });
            _this.player.on('seeked', function() {
              return $('.vjs-waiting').removeClass('vjs-waiting');
            });
            return setTimeout(function() {
              return $('#ytapiplayer .vjs-subtitles-button .vjs-menu-item').each(function(i, elem) {
                var textNode;
                textNode = elem.childNodes[0];
                if (textNode.textContent === localStorage.lastSubtitle) {
                  elem.click();
                }
                return elem.onclick = function() {
                  if (elem.attributes['aria-checked'].value === 'true') {
                    return localStorage.lastSubtitle = textNode.textContent;
                  }
                };
              });
            }, 1);
          });
        };
      })(this));
    };

    VideoJSPlayer.prototype.load = function(data) {
      this.setMediaProperties(data);
      this.destroy();
      return this.loadPlayer(data);
    };

    VideoJSPlayer.prototype.play = function() {
      this.paused = false;
      if (this.player && this.player.readyState() > 0) {
        return this.player.play();
      }
    };

    VideoJSPlayer.prototype.pause = function() {
      this.paused = true;
      if (this.player && this.player.readyState() > 0) {
        return this.player.pause();
      }
    };

    VideoJSPlayer.prototype.seekTo = function(time) {
      if (this.player && this.player.readyState() > 0) {
        return this.player.currentTime(time);
      }
    };

    VideoJSPlayer.prototype.setVolume = function(volume) {
      if (this.player) {
        return this.player.volume(volume);
      }
    };

    VideoJSPlayer.prototype.getTime = function(cb) {
      if (this.player && this.player.readyState() > 0) {
        return cb(this.player.currentTime());
      } else {
        return cb(0);
      }
    };

    VideoJSPlayer.prototype.getVolume = function(cb) {
      if (this.player && this.player.readyState() > 0) {
        if (this.player.muted()) {
          return cb(0);
        } else {
          return cb(this.player.volume());
        }
      } else {
        return cb(VOLUME);
      }
    };

    VideoJSPlayer.prototype.destroy = function() {
      removeOld();
      if (this.player) {
        return this.player.dispose();
      }
    };

    return VideoJSPlayer;

  })(Player);

  window.GoogleDrivePlayer = GoogleDrivePlayer = (function(superClass) {
    extend(GoogleDrivePlayer, superClass);

    function GoogleDrivePlayer(data) {
      if (!(this instanceof GoogleDrivePlayer)) {
        return new GoogleDrivePlayer(data);
      }
      GoogleDrivePlayer.__super__.constructor.call(this, data);
    }

    GoogleDrivePlayer.prototype.load = function(data) {
      if (!window.hasDriveUserscript) {
        window.promptToInstallDriveUserscript();
      } else if (window.hasDriveUserscript) {
        window.maybePromptToUpgradeUserscript();
      }
      if (typeof window.getGoogleDriveMetadata === 'function') {
        return setTimeout((function(_this) {
          return function() {
            return backoffRetry(function(cb) {
              return window.getGoogleDriveMetadata(data.id, cb);
            }, function(error, metadata) {
              var alertBox;
              if (error) {
                console.error(error);
                alertBox = window.document.createElement('div');
                alertBox.className = 'alert alert-danger';
                alertBox.textContent = error;
                return document.getElementById('ytapiplayer').appendChild(alertBox);
              } else {
                data.meta.direct = metadata.videoMap;
                return GoogleDrivePlayer.__super__.load.call(_this, data);
              }
            }, {
              maxTries: 3,
              delay: 1000,
              factor: 1.2,
              jitter: 500
            });
          };
        })(this), Math.random() * 1000);
      }
    };

    return GoogleDrivePlayer;

  })(VideoJSPlayer);

  window.promptToInstallDriveUserscript = function() {
    var alertBox, closeButton, infoLink;
    if (document.getElementById('prompt-install-drive-userscript')) {
      return;
    }
    alertBox = document.createElement('div');
    alertBox.id = 'prompt-install-drive-userscript';
    alertBox.className = 'alert alert-info';
    alertBox.innerHTML = "Due to continual breaking changes making it increasingly difficult to\nmaintain Google Drive support, Google Drive now requires installing\na userscript in order to play the video.";
    alertBox.appendChild(document.createElement('br'));
    infoLink = document.createElement('a');
    infoLink.className = 'btn btn-info';
    infoLink.href = 'https://firlin123.github.io/cytube-replay/assets/cytube-google-drive.user.js';
    infoLink.textContent = 'Click here to install userscript';
    infoLink.target = '_blank';
    alertBox.appendChild(infoLink);
    closeButton = document.createElement('button');
    closeButton.className = 'close pull-right';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
      return alertBox.parentNode.removeChild(alertBox);
    };
    alertBox.insertBefore(closeButton, alertBox.firstChild);
    return removeOld($('<div/>').append(alertBox));
  };

  window.tellUserNotToContactMeAboutThingsThatAreNotSupported = function() {
    var alertBox, closeButton, infoLink;
    if (document.getElementById('prompt-no-gdrive-support')) {
      return;
    }
    alertBox = document.createElement('div');
    alertBox.id = 'prompt-no-gdrive-support';
    alertBox.className = 'alert alert-danger';
    alertBox.innerHTML = "CyTube has detected an error in Google Drive playback.  Please note that the\nstaff in CyTube support channels DO NOT PROVIDE SUPPORT FOR GOOGLE DRIVE.  It\nis left in the code as-is for existing users, but we will not assist in\ntroubleshooting any errors that occur.<br>";
    alertBox.appendChild(document.createElement('br'));
    infoLink = document.createElement('a');
    infoLink.className = 'btn btn-danger';
    infoLink.href = 'https://github.com/calzoneman/sync/wiki/Frequently-Asked-Questions#why-dont-you-support-google-drive-anymore';
    infoLink.textContent = 'Click here for details';
    infoLink.target = '_blank';
    alertBox.appendChild(infoLink);
    closeButton = document.createElement('button');
    closeButton.className = 'close pull-right';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
      return alertBox.parentNode.removeChild(alertBox);
    };
    alertBox.insertBefore(closeButton, alertBox.firstChild);
    return removeOld($('<div/>').append(alertBox));
  };

  window.HLSPlayer = HLSPlayer = (function(superClass) {
    extend(HLSPlayer, superClass);

    function HLSPlayer(data) {
      if (!(this instanceof HLSPlayer)) {
        return new HLSPlayer(data);
      }
      this.setupMeta(data);
      HLSPlayer.__super__.constructor.call(this, data);
    }

    HLSPlayer.prototype.load = function(data) {
      this.setupMeta(data);
      return HLSPlayer.__super__.load.call(this, data);
    };

    HLSPlayer.prototype.setupMeta = function(data) {
      return data.meta.direct = {
        480: [
          {
            link: data.id,
            contentType: 'application/x-mpegURL'
          }
        ]
      };
    };

    return HLSPlayer;

  })(VideoJSPlayer);

  codecToMimeType = function(codec) {
    switch (codec) {
      case 'mov/h264':
      case 'mov/av1':
        return 'video/mp4';
      case 'flv/h264':
        return 'video/flv';
      case 'matroska/vp8':
      case 'matroska/vp9':
      case 'matroska/av1':
        return 'video/webm';
      case 'ogg/theora':
        return 'video/ogg';
      case 'mp3':
        return 'audio/mp3';
      case 'vorbis':
        return 'audio/ogg';
      case 'aac':
        return 'audio/aac';
      case 'opus':
        return 'audio/opus';
      default:
        return 'video/flv';
    }
  };

  window.FilePlayer = FilePlayer = (function(superClass) {
    extend(FilePlayer, superClass);

    function FilePlayer(data) {
      if (!(this instanceof FilePlayer)) {
        return new FilePlayer(data);
      }
      data.meta.direct = {
        480: [
          {
            contentType: codecToMimeType(data.meta.codec),
            link: data.id
          }
        ]
      };
      FilePlayer.__super__.constructor.call(this, data);
    }

    FilePlayer.prototype.load = function(data) {
      data.meta.direct = {
        480: [
          {
            contentType: codecToMimeType(data.meta.codec),
            link: data.id
          }
        ]
      };
      return FilePlayer.__super__.load.call(this, data);
    };

    return FilePlayer;

  })(VideoJSPlayer);

  window.RTMPPlayer = RTMPPlayer = (function(superClass) {
    extend(RTMPPlayer, superClass);

    function RTMPPlayer(data) {
      if (!(this instanceof RTMPPlayer)) {
        return new RTMPPlayer(data);
      }
      this.setupMeta(data);
      RTMPPlayer.__super__.constructor.call(this, data);
    }

    RTMPPlayer.prototype.load = function(data) {
      this.setupMeta(data);
      return RTMPPlayer.__super__.load.call(this, data);
    };

    RTMPPlayer.prototype.setupMeta = function(data) {
      return data.meta.direct = {
        480: [
          {
            link: data.id,
            contentType: 'rtmp/flv'
          }
        ]
      };
    };

    return RTMPPlayer;

  })(VideoJSPlayer);

  TYPE_MAP = {
    yt: YouTubePlayer,
    vi: VimeoPlayer,
    dm: DailymotionPlayer,
    gd: GoogleDrivePlayer,
    fi: FilePlayer,
    sc: SoundCloudPlayer,
    li: LivestreamPlayer,
    tw: TwitchPlayer,
    tv: TwitchPlayer,
    cu: CustomEmbedPlayer,
    rt: RTMPPlayer,
    hl: HLSPlayer,
    sb: StreamablePlayer,
    tc: TwitchClipPlayer,
    cm: VideoJSPlayer,
    pt: PeerPlayer,
    bc: IframeChild,
    bn: IframeChild,
    od: OdyseePlayer,
    nv: NicoPlayer
  };

  window.loadMediaPlayer = function(data) {
    var e, error;
    try {
      if (window.PLAYER) {
        window.PLAYER.destroy();
      }
    } catch (error1) {
      error = error1;
      console.error(error);
    }
    if (data.meta.direct && data.type === 'vi') {
      try {
        return window.PLAYER = new VideoJSPlayer(data);
      } catch (error1) {
        e = error1;
        return console.error(e);
      }
    } else if (data.type in TYPE_MAP) {
      try {
        return window.PLAYER = TYPE_MAP[data.type](data);
      } catch (error1) {
        e = error1;
        return console.error(e);
      }
    }
  };

  window.handleMediaUpdate = function(data) {
    var PLAYER, waiting;
    PLAYER = window.PLAYER;
    if (typeof PLAYER.mediaLength === 'number' && PLAYER.mediaLength > 0 && data.currentTime > PLAYER.mediaLength) {
      return;
    }
    waiting = data.currentTime < 0;
    if (data.id && data.id !== PLAYER.mediaId) {
      if (data.currentTime < 0) {
        data.currentTime = 0;
      }
      PLAYER.load(data);
      PLAYER.play();
    }
    if (waiting) {
      PLAYER.seekTo(0);
      if (PLAYER instanceof YouTubePlayer) {
        PLAYER.pauseSeekRaceCondition = true;
      } else {
        PLAYER.pause();
      }
      return;
    } else if (PLAYER instanceof YouTubePlayer) {
      PLAYER.pauseSeekRaceCondition = false;
    }
    if (CLIENT.leader || !USEROPTS.synch) {
      return;
    }
    if (data.paused && !PLAYER.paused) {
      PLAYER.seekTo(data.currentTime);
      PLAYER.pause();
    } else if (PLAYER.paused && !data.paused) {
      PLAYER.play();
    }
    return PLAYER.getTime(function(seconds) {
      var accuracy, diff, time;
      time = data.currentTime;
      diff = (time - seconds) || time;
      accuracy = USEROPTS.sync_accuracy;
      if (PLAYER instanceof DailymotionPlayer) {
        accuracy = Math.max(accuracy, 5);
      }
      if (diff > accuracy) {
        return PLAYER.seekTo(time);
      } else if (diff < -accuracy) {
        if (!(PLAYER instanceof DailymotionPlayer)) {
          time += 1;
        }
        return PLAYER.seekTo(time);
      }
    });
  };

  window.removeOld = function(replace) {
    var old;
    $('#soundcloud-volume-holder').remove();
    if (replace == null) {
      replace = $('<div/>').addClass('embed-responsive-item');
    }
    old = $('#ytapiplayer');
    old.attr('id', 'ytapiplayer-old');
    replace.attr('id', 'ytapiplayer');
    replace.insertBefore(old);
    old.remove();
    return replace;
  };

}).call(this);
