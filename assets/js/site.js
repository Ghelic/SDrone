// 모바일 메뉴 열고 닫기 — 모든 페이지 공용
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // 메뉴 항목을 누르면 닫기
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // 화면이 넓어지면 초기화
  window.addEventListener('resize', function () {
    if (window.innerWidth > 760) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // 순찰 흐름도: 드론 위치를 JS가 직접 계산해서 드론과 통신선을 항상 같은 좌표로 그림
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var flowSvg = document.getElementById('patrolFlowSvg');
  if (flowSvg && reduceMotion && typeof flowSvg.pauseAnimations === 'function') {
    flowSvg.pauseAnimations();
  }

  if (flowSvg) {
    var patrolPath = document.getElementById('patrolRoutePath');
    var droneGroup = document.getElementById('droneGroup');
    var uplinkPath = document.getElementById('uplinkPath');
    var uplinkDot = document.getElementById('uplinkDot');
    var antenna = { x: 484, y: 64 };
    var LOOP_MS = 9000;   // 드론이 순찰 경로를 한 바퀴 도는 시간
    var DOT_MS = 1800;    // 통신선 위의 점이 드론→관제센터를 흐르는 시간

    if (patrolPath && droneGroup && uplinkPath) {
      var pathLength = patrolPath.getTotalLength();

      var place = function (now) {
        var loopT = (now % LOOP_MS) / LOOP_MS;
        var pt = patrolPath.getPointAtLength(loopT * pathLength);
        droneGroup.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
        uplinkPath.setAttribute('d', 'M' + pt.x + ',' + pt.y + ' L' + antenna.x + ',' + antenna.y);
        if (uplinkDot) {
          var dotT = (now % DOT_MS) / DOT_MS;
          uplinkDot.setAttribute('cx', pt.x + (antenna.x - pt.x) * dotT);
          uplinkDot.setAttribute('cy', pt.y + (antenna.y - pt.y) * dotT);
        }
      };

      if (reduceMotion) {
        place(0);
      } else {
        requestAnimationFrame(function frame(now) {
          place(now);
          requestAnimationFrame(frame);
        });
      }
    }
  }
});
