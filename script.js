      const isMobilee = window.innerWidth <= 1023;
      console.log(window.innerWidth);
      if(isMobilee) {
      console.log('the is Mobileee exists');
      }
      
      
        function loadScript(src) {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        Promise.resolve()
          .then(() => loadScript("https://vjs.zencdn.net/8.23.3/video.min.js"))
          .then(() => loadScript("https://unpkg.com/videojs-contrib-ads@7.5.2/dist/videojs-contrib-ads.min.js"))
          .then(() => loadScript("https://imasdk.googleapis.com/js/sdkloader/ima3.js"))
          .then(() => loadScript("https://unpkg.com/videojs-ima@2.4.0/dist/videojs.ima.min.js"))
          .then(() => {
          
            const player = videojs('content_video', {
              controls: true,
              autoplay: false,
              muted: true,
            	width: isMobilee ? 300 : 640,
              height: isMobilee ? 250 : 360,
              fluid: false // prevents responsive resizing
            });
    
            const srcset = "https://afieromata.youweekly.gr/wp-content/uploads/2025/08/black.mp4";
            const adTagUrl = "https://track.adform.net/serving/videoad/?bn=82468932&v=3&ord=" + Date.now();
          console.log(adTagUrl);
            
            let adsManager = null;
            let isAdPaused = false;
            var soundBtn = document.getElementsByClassName('dscm-sound-btn');
            const adTimer = document.getElementById('ad-timer');

            player.src({
              src: srcset,
              type: 'video/mp4'
            });
            videojs.log.level('debug');
            
            player.ima({
              adTagUrl: adTagUrl,
              paidMode: google.ima.ImaSdkSettings.VpaidMode.ENABLED,
              debug: true,
              adsManagerLoadedCallback: function() {
                var adContainer = document.querySelector('.ima-ad-container');
                if (adContainer) {
                  adContainer.style.width = isMobilee ? '300px' : '640px';
                  adContainer.style.height = isMobilee ? '250px' : '360px';
                  adContainer.style.overflow = 'hidden';
                }
                adsManager = player.ima.getAdsManager();
               // adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED, updateSkipButton);
               adsManager.addEventListener(google.ima.AdEvent.Type.AD_PROGRESS, updateAdTime);
               // adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, resetUI);
               // adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, resetUI);
                
                adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, () => {
                	console.log('Ad Started');
                  adsManager = player.ima.getAdsManager();
                  document.getElementById('custom-controls').style.display = 'flex';
                });

                adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, () => {
                	console.log('Ad Completed');
                  document.getElementById('custom-controls').style.display = 'none';
                });

                adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, () => {
                	console.log('Ad Skipped');
                  document.getElementById('custom-controls').style.display = 'none';
                });

                adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
                	console.log('Ad Completed');
                  adTimer.textContent = 'Ad: 0s';
                  document.getElementById('custom-controls').style.display = 'none';
                });
              }
            });
						google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
            
            player.ready(() => {
              player.ima.initializeAdDisplayContainer();
            });
    

            player.on('adsready', () => {
              console.log('the player starts now');
              player.play();
            });

            player.on('adserror', (e) => {
              console.error('Video.js Ad Error:', e);
            });
            
            // --- custom Controls --
            const adControls = document.getElementById('custom-controls');
            
            adControls.addEventListener('click', (e) => {
            	const btn = e.target.closest('button');
              if(!btn || !adsManager) return;
              
              const action = btn.dataset.action;
              
              if (action === 'ad-play-pause') {
                if (isAdPaused) {
									adsManager.resume();
                  isAdPaused = false;
                } else {
                	adsManager.pause();

                  isAdPaused = true;
                }
                updateAdPlayPauseIcon();
              }
              
              if (action === 'ad-mute-unmute') {
              	if (adsManager.getVolume() > 0) {
                	adsManager.setVolume(0);
                  soundBtn[0].classList.toggle('mute');
                } else {
                	adsManager.setVolume(1);
                  soundBtn[0].classList.toggle('mute');
                }
              }
            });
            
            function updateAdPlayPauseIcon() {
            	const playPauseBtn = document.getElementById('ad-play-pause-btn');
              playPauseBtn.innerHTML = isAdPaused 
              ? '<div class="dscm-play-btn"></div>'
              : '<div class="dscm-pause-btn"></div>'
            }
            
            function updateAdTime(event) {
              var adData = event.getAdData();
              var remaining = Math.ceil(adData.duration - adData.currentTime);
              adTimer.textContent = 'Ad: ' + remaining + 's';
            }
            [
            'adsready',
            'adstart',
            'adpause',
            'adresume',
            'adend',
            'ads-ad-ended'
            ].forEach(evt => {
            player.on(evt, () => console.log('IMA EVENT:', evt));
            });

            fetch(adTagUrl)
              .then(res => res.text())
              .then(xml => console.log('Raw VAST XML:', xml))
              .catch(err => console.error('VAST Fetch Error:', err));
          })
          .catch(err => console.error('Script loading failed:', err));