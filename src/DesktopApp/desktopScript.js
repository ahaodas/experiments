export const init = (channel) => {
  channel.addEventListener('message', ({data}) => {
    const xyz = JSON.parse(data);
    if (typeof xyz === "object") useXyz(xyz);
  })

  const wrapper = document.getElementById('wrapper')
  const subscene =  document.getElementById('subscene')
  const ship = document.getElementById('ship')
  const rotateX = document.getElementById('rotateX')
  const rotateY = document.getElementById('rotateY')
  const rotateZ = document.getElementById('rotateZ')
  const scene = document.getElementById('scene')
  const spinbase = document.getElementById('spinbase')
  scene.style.visibility = 'visible'
  subscene.style.visibility = 'visible'
  const editorUirotateZ = document.getElementById('editorUirotateZ')
  const editorUirotateX = document.getElementById('editorUirotateX')
  const editorUirotateY = document.getElementById('editorUirotateY')

  let fireXyz, XyzOStatic

  var xyzHistory = [];
  var XyzM = (fireXyz = { x: 0, y: 0, z: 0 })
  var XyzO = (XyzOStatic = { rotateX: 0, rotateY: 0, rotateZ: 0 })
  var speed = 0;
  var tracksCount = 0;
  var move = false;
  //fillTracks();

  function Subscene() {
    this.rotateX =
      this.rotateY =
      this.rotateZ =
      this.dx =
      this.dz =
      this.positionX =
      this.positionY =
      this.positionZ =
        0;

    this.set = (obj) => {
      this.rotateX = -obj.rotateX;
      this.rotateY = -obj.rotateY;
      this.rotateZ = -obj.rotateZ;
      var a = (obj.rotateY * Math.PI) / 180;
      this.positionX += speed * 20 * Math.sin(a);
      this.positionZ += (speed / 100) * Math.cos(a);
      spinbase.style.backgroundPositionY = this.positionZ * 0.1 + "%";
    };
    this.getStyleString = () => {
      return setOrientation(this); // +  ` translateX(${this.positionX}px) translateZ(${this.positionZ}px)`;
    };
  }

  var subsceneObj = new Subscene();

  var keyboard = function () {
    this.dispatch = (key, keyup) => {
      this[key](keyup);
      setStyle();
    };
    this.dispatch.bind(this);
    this.ArrowRight = (keyup) => {
      !keyup && (XyzO.rotateZ -= 10);
    }; // XyzOStatic.rotateZ = keyup ? 0: -20; }
    this.ArrowLeft = (keyup) => {
      XyzO.rotateZ += 10;
    }; // XyzOStatic.rotateZ =  keyup ? 0: 20; }
    this.ArrowUp = (keyup) => {
      XyzO.rotateY += 10;
    }; // XyzOStatic.rotateY = keyup ? 0: 10; }
    this.ArrowDown = (keyup) => {
      XyzO.rotateY -= 10;
    }; // XyzOStatic.rotateY = keyup ? 0: -10; }
    this.q = (keyup) => {
      XyzO.rotateX -= 10;
    }; // XyzOStatic.rotateX = keyup ? 0: -10; }
    this.e = (keyup) => {
      XyzO.rotateX += 10;
    }; //  XyzOStatic.rotateX = keyup ? 0: 10; }
    this.Space = (keyup) => (speed = 5);
  };

  // var k = new keyboard()
  // window.addEventListener('keydown', e => {
  //     console.log(e)
  //     if (k[e.code]) {
  //         e.preventDefault()
  //         k.dispatch(e.code)
  //     }
  // })
  // window.addEventListener('keyup', e => {
  //     if ((e.code = 'Space')) {
  //         e.preventDefault()
  //         speed = 0
  //            k.dispatch(e.code, true);
  //     }
  // })


  function setOrientation(xyz) {
    return `rotateZ(${xyz.rotateX}deg) rotateX(${xyz.rotateY}deg)  rotateY(${xyz.rotateZ}deg)`;
  }
  function setMotion(xyz) {
    return ` translate3d(${xyz.x}px, ${xyz.y}px, ${xyz.z}px)`;
  }

  function useXyz(xyz) {
    setStyle();
    rotate(xyz);
    if (move) move(xyz);
  }

  function moove(xyzAcc) {
    //   console.log("acss", xyzAcc);
    XyzM.z += speed * xyzAcc.x; // West to East
    XyzM.x += speed * xyzAcc.y; // South to North
    XyzM.y += speed * xyzAcc.x;
    //   console.log(Xyz);
  }
  ship.style.transform = "rotateX(0)";

  function filterRotation(deg) {
    return deg > 180 ? deg - 360 : deg;
  }

  function setStyle(stop) {
    var fireXyz = xyzHistory[xyzHistory.length - 1];
    if (move) {
      subsceneObj.speed = move ? 5 : 0;
      subsceneObj.set(XyzO);
    }
    ship.style.transform = setOrientation(XyzOStatic);
    subscene.style.transform = subsceneObj.getStyleString();
    //     shipReflected.style.transform = setOrientation(XyzO);

    requestAnimationFrame(function () {
      setStyle();
    });
  }
  //
  // function drawTrace() {
  //     newTrace()
  //        requestAnimationFrame(function(){  drawTrace();}, 100)
  //     setInterval(() => newTrace(), 100)
  // }

  function rotate(xyz) {
    console.log(XyzO)
    xyzHistory.push(XyzO);
    XyzO.rotateX = xyz.x;
    XyzO.rotateY = xyz.y;
    XyzO.rotateZ = xyz.z;
  }

  var tracesCount = 0;

  function newTrace() {
    if (tracesCount < 15 && move) {
      var track = document.createElement("div");
      track.className = "track";
      track.style.transform = setOrientation(XyzO);
      wrapper.appendChild(track);
      tracesCount++;
      setTimeout(() => {
        tracesCount--;
        wrapper.removeChild(track);
      }, 1000);
    }
  }

  function EditorUi(e) {
    if (e) {
      if (e.id == "subsceneVisible") {
        subscene.classList[e.checked ? "add" : "remove"]("hidden");
        return;
      }
      document.getElementsByClassName(
        `${e.id[e.id.length - 1].toLowerCase()}-axis`,
      )[0].style.opacity = `${e.checked ? 0 : 1}`;
      return;
    }
    rotateX.innerHTML = ": " + editorUirotateX.value;
    rotateY.innerHTML = ": " + editorUirotateY.value;
    rotateZ.innerHTML = ": " + editorUirotateZ.value;

    scene.style.transform = `rotateZ(${editorUirotateZ.value}deg) rotateX(${editorUirotateX.value}deg) rotateY(${editorUirotateY.value}deg)`;
  }
};
