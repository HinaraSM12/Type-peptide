// app.js - lógica principal Type-Peptide (Three.js + UI)

document.addEventListener('DOMContentLoaded', function () {
  // Ajustes iniciales de tamaño
  // El wrapper #canvas toma altura con CSS; el canvas ocupa 100% de ese espacio
  $("#myCanvas").height("100%");
  $("#myCanvas").width("100%");

  // --- variables internas ---
  let scene, renderer, camera, controls;
  let mouse, raycaster;
  let ambientLight, spotLight, spotLight2;
  let line;
  let sphereList, groupList, sprite_list, chain_list, names_list;
  let textures = null;

  initScene();
  unlookCamara();  // estado inicial: cámara libre
  animate();

  function initScene() {
    scene = new THREE.Scene();

    const AspectRatio = $("#myCanvas").width() / $("#myCanvas").height();
    camera = new THREE.PerspectiveCamera(45, AspectRatio, 1, 500);
    camera.position.set(0, 0, 50);
    scene.add(camera);

    const canvasDom = document.getElementById("myCanvas");
    renderer = new THREE.WebGLRenderer({ canvas: canvasDom, alpha: true });
    renderer.setSize($("#myCanvas").width(), $("#myCanvas").height());
    renderer.setClearAlpha(0.1);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];

    // Exponer a window para funciones globales
    window.controls = controls;
    window.camera = camera;

    ambientLight = new THREE.AmbientLight(0x404040, 1);
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(1000, 1000, 1000);
    spotLight.castShadow = false;
    spotLight.intensity = 1.2;

    spotLight2 = new THREE.SpotLight(0xffffff);
    spotLight2.position.set(-1000, -1000, -1000);
    spotLight2.castShadow = false;
    spotLight2.intensity = 0.8;

    scene.add(ambientLight, spotLight, spotLight2);

    sphereList = [];
    sprite_list = [];
    chain_list = [];
    names_list = [];
    groupList = [];

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Carga de texturas (sprites de cadena lateral)
    textures = loadTextures("assets/img/");

    // Eventos
    renderer.domElement.addEventListener("click", onDocumentMouseDown, false);
    window.addEventListener("resize", onWindowResize, false);

    // Botones cámara
    const lockBtn = document.getElementById('btnLock');
    const unlockBtn = document.getElementById('btnUnlock');
    if (lockBtn) {
      lockBtn.addEventListener('click', function () {
        setCamMode('lock');
      });
    }
    if (unlockBtn) {
      unlockBtn.addEventListener('click', function () {
        setCamMode('unlock');
      });
      // Estado inicial: cámara desbloqueada y botones en verde
      if (lockBtn && unlockBtn) {
        setCamMode('unlock');
      }

    }

    // Botón "Centrar"
    const centerBtn = document.querySelector('.tp-center-btn');
    if (centerBtn) {
      centerBtn.addEventListener('click', getCamara1);
    }

    // Botón lupa: recalcula todo igual que escribir
    const searchBtn = document.querySelector('.tp-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        $('#aminoacid').trigger('keyup');
      });
    }

    // Validar entrada en el input (solo aminoácidos válidos)
    const input = document.getElementById('aminoacid');
    if (input) {
      input.addEventListener('keypress', function (e) {
        if (!validateEntry(e)) {
          e.preventDefault();
        }
      });
    }

    // Inicializar la tabla por si hay texto precargado
    $('#aminoacid').trigger('keyup');
  }

  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  function onDocumentMouseDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(sphereList, true);
    if (intersects.length > 0) {
      const group = intersects[0].object.parent;
      const nextVisible = !group.children[2].visible;
      group.children[2].visible = nextVisible; // sprite lateral
      group.children[3].visible = nextVisible; // texto nombre
    }
  }

  function onWindowResize() {
    $("#myCanvas").height("100%");
    $("#myCanvas").width("100%");
    const w = $("#myCanvas").width(), h = $("#myCanvas").height();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (controls && typeof controls.handleResize === "function") {
      controls.handleResize();
    }
    if (controls) controls.update();
  }

  // ==========================
  //   DIBUJO DE LA HÉLICE
  // ==========================

  function draw() {
    let aminoacids = (document.getElementById("aminoacid").value || "").toUpperCase();

    if (line) scene.remove(line);

    const geometryLine = new THREE.Geometry();
    const materialLine = new THREE.LineBasicMaterial({ color: 0x000000 });

    for (let i = 0; i < aminoacids.length; i++) {
      geometryLine.vertices.push(new THREE.Vector3(get_x(i), get_y(i), 2 * i));

      if (typeof groupList[i] === "undefined") {
        const aminoGroup = makeGroup(aminoacids.charAt(i), i);
        scene.add(aminoGroup);
        groupList[i] = aminoGroup;
      } else if (groupList[i].letter !== aminoacids.charAt(i)) {
        const newGroup = makeGroup(aminoacids.charAt(i), i);
        scene.remove(groupList[i]);
        const idx = sphereList.indexOf(groupList[i].children[0]);
        if (idx > -1) sphereList.splice(idx, 1);
        scene.add(newGroup);
        groupList[i] = newGroup;
      }
    }

    // Quitar grupos sobrantes
    if (aminoacids.length < groupList.length) {
      const index = aminoacids.length;
      for (let j = index; j < groupList.length; j++) {
        scene.remove(groupList[j]);
        const idx = sphereList.indexOf(groupList[j].children[0]);
        if (idx > -1) sphereList.splice(idx, 1);
      }
      groupList.splice(index, groupList.length - aminoacids.length);
    }

    line = new THREE.Line(geometryLine, materialLine);
    scene.add(line);
  }

  function makeGroup(aminoLetter, peptidePosition) {
    const sphereColor = aminosColor[aminoLetter]; // hex string "#FFFD01"

    // Sprite de cadena lateral (imagen)
    const sideChainTexture = textures[aminoLetter];
    const sideChainImage = new THREE.Sprite(sideChainTexture);
    sideChainImage.scale.set(10, 10, 1);
    sideChainImage.position.set(
      get_x(peptidePosition, (pos_off = 1)),
      get_y(peptidePosition, (pos_off = 1)),
      peptidePosition * 2
    );
    sideChainImage.visible = false;

    // Texto con nombre completo + posición
    const aminoName = makeTextSprite(
      " " + (peptidePosition + 1) + ": " + (aminosFullName[aminoLetter] || aminoLetter) + " ",
      { fontsize: 18, backgroundColor: transparentColor, borderColor: transparentColor }
    );
    aminoName.position.set(
      get_x(peptidePosition, (pos_off = 1.5)),
      get_y(peptidePosition, (neg_off = 0.5)),
      peptidePosition * 2
    );
    aminoName.visible = false;

    // Texto con la letra sobre la esfera
    const aminoGraphLetter = makeTextSprite(" " + aminoLetter + " ", {
      fontsize: 18,
      borderColor: getRGBColor(sphereColor, 1),
      backgroundColor: getRGBColor(sphereColor, 0.2),
    });
    aminoGraphLetter.position.set(
      get_x(peptidePosition),
      get_y(peptidePosition),
      2 * peptidePosition
    );

    // Esfera
    const aminoSphereMaterial = new THREE.MeshLambertMaterial({ color: sphereColor });
    const aminoSphereGeometry = new THREE.SphereGeometry(getRadioAmino(aminoLetter), 32, 32);
    const aminoSphere = new THREE.Mesh(aminoSphereGeometry, aminoSphereMaterial);
    aminoSphere.position.set(
      get_x(peptidePosition),
      get_y(peptidePosition),
      2 * peptidePosition
    );
    aminoSphere.peptidePosition = peptidePosition;
    sphereList.push(aminoSphere);

    // Agrupar todo
    const group = new THREE.Group();
    group.add(aminoSphere);
    group.add(aminoGraphLetter);
    group.add(sideChainImage);
    group.add(aminoName);
    group.letter = aminoLetter;
    group.position = peptidePosition;
    return group;
  }

  // ==========================
  //   CÁMARA / CONTROLES
  // ==========================

  function setCamMode(mode) {
    const lockBtn = document.getElementById('btnLock');
    const unlockBtn = document.getElementById('btnUnlock');
    if (!lockBtn || !unlockBtn) return;

    if (mode === 'lock') {
      lockBtn.style.backgroundColor = '#4b8c7e';
      unlockBtn.style.backgroundColor = '#65bba7ff';
      lookCamara();
    } else {
      unlockBtn.style.backgroundColor = '#4b8c7e';
      lockBtn.style.backgroundColor = '#65bba7ff';
      unlookCamara();
    }
  }
  window.setCamMode = setCamMode;

  // ==========================
  //  INPUT: tabla de propiedades
  // ==========================

  const delay = (function () {
    let timer = 0;
    return function (callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();

  $('#aminoacid').on('keyup', function () {
    delay(function () {
      const seq = ($('#aminoacid').val() || '').toUpperCase();
      if (seq) {
        $(".noaa_th").html(seq.length);
        $(".charge_th").html(formatCharge(getCharge(seq), 4));
        $(".isoelectricPoint_th").html(getIsoEle(seq));
        $(".hidrofobic_th").html(getHidrof(seq));
        $(".boman_th").html(getBoman(seq));
        $(".momem_th").html(getMoment(seq));
        $(".wimley_th").html(getWimley(seq));
      } else {
        $(".noaa_th, .charge_th, .isoelectricPoint_th, .hidrofobic_th, .boman_th, .momem_th, .wimley_th").html("0");
      }
      draw();
    }, 300);
  });

  function formatCharge(value, maxDecimals = 4, epsilon = 1e-8) {
    const v = (typeof value === "number") ? value : parseFloat(value);
    if (!isFinite(v)) return "0";
    if (Math.abs(v) < epsilon) return "0";
    for (let d = 2; d <= maxDecimals; d++) {
      const s = v.toFixed(d);
      const n = Number(s);
      if (Math.abs(n) >= epsilon) return Object.is(n, -0) ? "0" : s;
    }
    return "0";
  }

  // ==========================
  //   Helpers gráficos
  // ==========================

  function makeTextSprite(message, parameters) {
    parameters = parameters || {};

    const fontface = parameters.fontface || "Arial";
    const fontsize = parameters.fontsize || 18;
    const borderThickness = parameters.borderThickness || 4;
    const borderColor = parameters.borderColor || { r: 0, g: 0, b: 0, a: 1.0 };
    const backgroundColor = parameters.backgroundColor || { r: 255, g: 255, b: 255, a: 1.0 };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
    context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`;
    context.lineWidth = borderThickness;

    roundRect(context, borderThickness / 2, borderThickness / 2,
      textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);

    context.fillStyle = "rgba(0,0,0,1.0)";
    context.fillText(message, borderThickness, fontsize + borderThickness);

    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 5, 0.10);
    return sprite;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function loadTextures(path) {
    const textures = {};
    const letters = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
      'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S',
      'T', 'V', 'W', 'Y'];

    letters.forEach(letter => {
      const spriteMap = new THREE.TextureLoader().load(path + letter + ".png");
      const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
      textures[letter] = spriteMaterial;
    });
    return textures;
  }

  // Exponer draw por si quieres llamar desde consola
  window.draw = draw;
});


// ==== Funciones globales de cámara ====

function unlookCamara() {
  if (window.controls) {
    window.controls.enabled = true;
    window.controls.noPan = false;
    window.controls.noRotate = false;
    window.controls.noZoom = false;
  }
}

function lookCamara() {
  if (window.controls) {
    window.controls.enabled = false;
    window.controls.noPan = true;
    window.controls.noRotate = true;
    window.controls.noZoom = true;
  }
}

function getCamara1() {
  if (window.camera && window.controls) {
    const n = (window.groupList && window.groupList.length)
      ? window.groupList.length
      : (document.getElementById('aminoacid')?.value || '').length;
    const z = (n > 0 ? n * 2 + 30 : 50);
    window.camera.position.set(0, 0, z);
    window.controls.target.set(0, 0, 0);
    window.controls.update();
  }
}
