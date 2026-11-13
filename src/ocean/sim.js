// Game simulation: pure logic over `world` / `input`, no rendering.
// Called once per frame from <GameLoop> with a clamped delta time.
import { BOUNDARY_BUOYS, BOUNDARY_SLOTS, BUOY, BUOYS, CHECKPOINT_RADIUS, colliderRadius, DOCK_RANGE, ENEMY, GRAVITY, ISLANDS, PICKUP, RACE_CHECKPOINTS, SHIP, STATIC_COLLIDERS, WAVES, WAVE_BREAK, WORLD_RADIUS } from './config'
import { getUi, input, saveRaceTime, setRaceUi, setUi, world } from './store'

const TAU = Math.PI * 2;
const SQRT1_2 = Math.SQRT1_2;
const MAX_PARTICLES = 320;
const EDGE_BOUNCE = BUOY.bounce * BUOY.edgeBoost; // boundary knock-back, same as its buoys
// Half-beam / half-length of the boats' hulls (ship-small: 0.96 / 1.9,
// ship-pirate-small at enemy scale: 0.62 / 1.1).
const HULL_BEAM = 0.52;
// Boundary slot -> index into BOUNDARY_BUOYS (-1: a moored ship or the harbor island).
const BUOY_AT_SLOT = Array.from({ length: BOUNDARY_SLOTS }, (_, s) => BOUNDARY_BUOYS.findIndex((b) => b.slot === s));
let nextEnemyId = 1;

const rand = (a, b) => a + Math.random() * (b - a);
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const turnToward = (current, target, maxStep) => {
  const diff = wrapAngle(target - current);
  return current + Math.max(-maxStep, Math.min(maxStep, diff));
};

// --- Particles --------------------------------------------------------------

const PARTICLE_COLORS = {
  smoke: '#e5e7eb',
  fire: '#f97316',
  water: '#e0f2fe',
  wood: '#92400e',
  sand: '#fde68a',
};

export const burst = (x, y, z, type, count, { speed = 3, up = 3, size = 0.35, life = 0.8 } = {}) => {
  for (let i = 0; i < count; i++) {
    if (world.particles.length >= MAX_PARTICLES) world.particles.shift();
    const a = Math.random() * TAU;
    const s = Math.random() * speed;
    world.particles.push({
      x, y, z,
      vx: Math.cos(a) * s,
      vy: rand(up * 0.4, up),
      vz: Math.sin(a) * s,
      life: rand(life * 0.6, life),
      maxLife: life,
      size: rand(size * 0.6, size),
      color: PARTICLE_COLORS[type],
      gravity: type === 'smoke' ? -1.5 : GRAVITY * 0.6,
    });
  }
};

const updateParticles = (dt) => {
  const ps = world.particles;
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.life -= dt;
    if (p.life <= 0) { ps.splice(i, 1); continue; }
    p.vy -= p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    if (p.y < 0 && p.gravity > 0) p.life = 0;
  }
};

// --- Shared physics ---------------------------------------------------------

// Colliders (islands, wreck, buoys) are star-shaped around their center:
// work in their rotated local frame and compare against the edge radius.
const toLocal = (c, x, z) => {
  const dx = x - c.position[0];
  const dz = z - c.position[1];
  const cos = Math.cos(c.rotation);
  const sin = Math.sin(c.rotation);
  return [dx * cos - dz * sin, dx * sin + dz * cos];
};

const fromLocal = (c, lx, lz) => {
  const cos = Math.cos(c.rotation);
  const sin = Math.sin(c.rotation);
  return [c.position[0] + lx * cos + lz * sin, c.position[1] - lx * sin + lz * cos];
};

// Gap between a point and a collider's edge (negative = inside).
const distanceToCollider = (c, x, z) => {
  const [lx, lz] = toLocal(c, x, z);
  return Math.hypot(lx, lz) - colliderRadius(c, Math.atan2(lz, lx));
};

const insideCollider = (c, x, z) => distanceToCollider(c, x, z) < 0;

// Push a circular body out of every collider and back inside the world boundary.
// Returns true if it hit something.
const collide = (body, radius) => {
  let hit = false;
  for (const c of STATIC_COLLIDERS) {
    let [lx, lz] = toLocal(c, body.x, body.z);
    if (Math.hypot(lx, lz) < 1e-4) lx = 1e-4; // exactly at the center: pick any direction
    const d = Math.hypot(lx, lz);
    const edge = colliderRadius(c, Math.atan2(lz, lx)) + radius;
    if (d < edge) {
      [body.x, body.z] = fromLocal(c, (lx / d) * edge, (lz / d) * edge);
      hit = true;
    }
  }
  // Race rocks are circles; boats meet them as a capsule (long along the
  // heading, narrow abeam) so side-on hits don't trigger a hull-width early.
  // `radius` is half the hull length; the beam is about half of that.
  const beam = radius * HULL_BEAM;
  const half = radius - beam;
  const fx = Math.sin(body.heading);
  const fz = Math.cos(body.heading);
  for (const r of world.race?.rocks ?? []) {
    // Closest point on the hull's center line to the rock.
    const t = Math.max(-half, Math.min(half, (r.cx - body.x) * fx + (r.cz - body.z) * fz));
    const dx = body.x + fx * t - r.cx;
    const dz = body.z + fz * t - r.cz;
    const d = Math.hypot(dx, dz) || 0.0001;
    const min = r.radius + beam;
    if (d < min) {
      body.x += (dx / d) * (min - d);
      body.z += (dz / d) * (min - d);
      hit = true;
    }
  }
  const d = Math.hypot(body.x, body.z);
  const limit = WORLD_RADIUS - radius;
  if (d > limit) {
    const nx = body.x / d; // outward normal
    const nz = body.z / d;
    body.x = nx * limit;
    body.z = nz * limit;
    hit = true;
    // The edge bounces like a buoy: boats with a knock vector are pushed back
    // toward the center instead of sliding along the boundary.
    if ('kx' in body) {
      const knockOut = body.kx * nx + body.kz * nz;
      if (knockOut > 0) {
        body.kx -= nx * knockOut;
        body.kz -= nz * knockOut;
      }
      const vn = (Math.sin(body.heading) * nx + Math.cos(body.heading) * nz) * body.speed;
      if (vn > 0.5) {
        body.kx -= nx * vn * EDGE_BOUNCE;
        body.kz -= nz * vn * EDGE_BOUNCE;
        body.speed *= 0.35;
        burst(body.x + nx * radius, 0.3, body.z + nz * radius, 'water', 8, { speed: 2, up: 3.5, size: 0.35 });
        // Hitting a gap between boundary buoys still shoves the nearest one.
        const n = BOUNDARY_SLOTS;
        const slot = ((Math.round((Math.atan2(nz, nx) / TAU) * n) % n) + n) % n;
        const k = BUOY_AT_SLOT[slot];
        const st = k >= 0 ? world.buoys[BUOYS.length + k] : null;
        if (st?.edge) {
          st.vx += nx * vn * BUOY.push;
          st.vz += nz * vn * BUOY.push;
          st.wobble = Math.min(1, st.wobble + vn / 8);
        }
      }
    }
  }
  return hit;
};

// --- Buoys -----------------------------------------------------------------

const buoyPos = (b) => [b.x0 + b.ox, b.z0 + b.oz];

// Damped spring pulling each buoy back to its anchor.
const updateBuoys = (dt) => {
  for (const st of world.buoys) {
    st.vx += (-BUOY.spring * st.ox - BUOY.damping * st.vx) * dt;
    st.vz += (-BUOY.spring * st.oz - BUOY.damping * st.vz) * dt;
    st.ox += st.vx * dt;
    st.oz += st.vz * dt;
    st.wobble = Math.max(0, st.wobble - dt * 0.7);
  }
};

// A boat touching a buoy: separate them, shove the buoy away and bounce the
// boat back (boats with a knock vector) instead of stopping dead.
const bumpBuoys = (body, radius) => {
  world.buoys.forEach((st) => {
    const b = st;
    const [bx, bz] = buoyPos(st);
    const dx = body.x - bx;
    const dz = body.z - bz;
    const d = Math.hypot(dx, dz) || 0.0001;
    const min = radius + b.halfX;
    if (d >= min) return;
    const nx = dx / d;
    const nz = dz / d;
    const overlap = min - d;
    body.x += nx * overlap * 0.6;
    body.z += nz * overlap * 0.6;
    st.ox -= nx * overlap * 0.4;
    st.oz -= nz * overlap * 0.4;

    // Boat velocity along the contact normal (negative = moving into the buoy).
    const vn = (Math.sin(body.heading) * nx + Math.cos(body.heading) * nz) * body.speed;
    if (vn >= -0.5) return;
    st.vx += nx * vn * BUOY.push;
    st.vz += nz * vn * BUOY.push;
    st.wobble = Math.min(1, st.wobble + -vn / 8);
    if ('kx' in body) {
      const bounce = st.edge ? BUOY.bounce * BUOY.edgeBoost : BUOY.bounce;
      body.kx += nx * -vn * bounce;
      body.kz += nz * -vn * bounce;
      body.speed *= 0.35;
    }
    burst(bx, 0.3, bz, 'water', 6, { speed: 2, up: 3, size: 0.3 });
  });
};

const fireBall = (x, z, vx, vz, vy, fromPlayer) => {
  world.balls.push({ x, y: 1, z, vx, vy, vz, fromPlayer });
  burst(x, 1.1, z, 'smoke', 4, { speed: 1.2, up: 1.5, size: 0.5, life: 0.9 });
};

// --- Player -----------------------------------------------------------------

const updateShip = (dt, controllable, exploring) => {
  const s = world.ship;
  // Ease between the big exploring ship and the normal combat size.
  const targetScale = exploring ? SHIP.exploreScale : 1;
  s.scale += (targetScale - s.scale) * (1 - Math.exp(-dt * 3));
  const radius = SHIP.radius * s.scale;
  let throttle = 0;
  let turn = 0;

  if (controllable) {
    const joyMag = Math.hypot(input.joyX, input.joyY);
    if (joyMag > 0.15) {
      // Joystick is screen-relative: convert to a world direction for the
      // isometric camera (camera sits at +X +Y +Z looking at the ship).
      const dx = (input.joyX - input.joyY) * SQRT1_2;
      const dz = (-input.joyX - input.joyY) * SQRT1_2;
      const target = Math.atan2(dx, dz);
      const diff = Math.abs(wrapAngle(target - s.heading));
      const turnStep = SHIP.turnRate * 1.3 * dt;
      s.heading = turnToward(s.heading, target, turnStep);
      throttle = Math.min(1, joyMag) * (diff > Math.PI / 2 ? 0.25 : 1);
    } else {
      throttle = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
      turn = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    }
  }

  // Race power-ups / debuffs scale top speed (and acceleration) for a while.
  let mul = 1;
  if (s.effect) {
    s.effect.t -= dt;
    if (s.effect.t <= 0) {
      s.effect = null;
      if (world.race) setRaceUi({ effect: null });
    } else {
      mul = s.effect.speed;
    }
  }
  const maxSpeed = SHIP.maxSpeed * mul;

  // Speed with acceleration and water drag.
  if (throttle > 0) s.speed += SHIP.accel * Math.max(1, mul) * throttle * dt;
  else if (throttle < 0) s.speed += SHIP.accel * throttle * dt * 0.8;
  s.speed -= s.speed * SHIP.drag * dt * (throttle === 0 ? 1 : 0.25);
  // Above the (possibly reduced) top speed: bleed off quickly but not instantly.
  if (s.speed > maxSpeed) s.speed = Math.max(maxSpeed, s.speed - (s.speed - maxSpeed) * 4 * dt);
  s.speed = Math.max(-SHIP.reverseSpeed, s.speed);

  // Boats steer better when moving; keep a little authority at rest.
  const steer = 0.35 + 0.65 * Math.min(1, Math.abs(s.speed) / SHIP.maxSpeed);
  if (s.effect?.type === 'boost' && Math.random() < dt * 30) {
    burst(s.x - Math.sin(s.heading) * radius, 0.4, s.z - Math.cos(s.heading) * radius, 'fire', 1, { speed: 1, up: 1.5, size: 0.3, life: 0.5 });
  }
  s.heading = wrapAngle(s.heading + turn * SHIP.turnRate * steer * dt * Math.sign(s.speed || 1));

  s.x += Math.sin(s.heading) * s.speed * dt;
  s.z += Math.cos(s.heading) * s.speed * dt;
  // Knock-back from bumping into things, fading out.
  s.x += s.kx * dt;
  s.z += s.kz * dt;
  const fade = Math.exp(-dt * 2.5);
  s.kx *= fade;
  s.kz *= fade;
  bumpBuoys(s, radius);
  if (collide(s, radius)) s.speed *= 0.6;

  // Wake: foam bubbles off the stern, more of them the faster we go.
  if (Math.abs(s.speed) > 2 && Math.random() < dt * Math.abs(s.speed) * 1.6) {
    burst(s.x - Math.sin(s.heading) * radius, 0.15, s.z - Math.cos(s.heading) * radius, 'water', 1, { speed: 0.6, up: 1, size: 0.3, life: 0.9 });
  }

  s.cooldown = Math.max(0, s.cooldown - dt);
  s.hitFlash = Math.max(0, s.hitFlash - dt);

  if (controllable && input.fire && s.cooldown === 0) {
    s.cooldown = SHIP.cannonCooldown;
    fireBroadside(s);
  }
};

// Three cannons per side, both sides at once.
const fireBroadside = (s) => {
  const fx = Math.sin(s.heading);
  const fz = Math.cos(s.heading);
  const lx = Math.cos(s.heading); // left vector
  const lz = -Math.sin(s.heading);
  for (const side of [1, -1]) {
    for (const k of [-0.9, 0, 0.9]) {
      const x = s.x + (lx * side * 1.2 + fx * k) * s.scale;
      const z = s.z + (lz * side * 1.2 + fz * k) * s.scale;
      const spread = rand(-1, 1);
      fireBall(
        x, z,
        lx * side * SHIP.ballSpeed + fx * (s.speed + spread),
        lz * side * SHIP.ballSpeed + fz * (s.speed + spread),
        SHIP.ballLift + rand(-0.4, 0.4),
        true,
      );
    }
  }
};

// --- Enemies & waves --------------------------------------------------------

const spawnWave = (index) => spawnEnemies(WAVES[index]);

const spawnEnemies = (cfg) => {
  const s = world.ship;
  for (let i = 0; i < cfg.count; i++) {
    const a = (i / cfg.count) * TAU + rand(-0.3, 0.3);
    const e = {
      id: nextEnemyId++,
      x: s.x + Math.cos(a) * 42,
      z: s.z + Math.sin(a) * 42,
      heading: 0,
      speed: cfg.speed,
      hp: cfg.hp,
      maxHp: cfg.hp,
      fireIn: rand(...cfg.fireEvery) + 1.5,
      fireEvery: cfg.fireEvery,
      orbitDir: Math.random() < 0.5 ? 1 : -1,
      sinking: false,
      sinkT: 0,
      hitFlash: 0,
    };
    collide(e, ENEMY.radius);
    e.heading = Math.atan2(s.x - e.x, s.z - e.z);
    world.enemies.push(e);
  }
  setUi({ enemyIds: world.enemies.map((e) => e.id) });
};

const updateEnemies = (dt, canFire) => {
  const s = world.ship;
  let removed = false;
  for (let i = world.enemies.length - 1; i >= 0; i--) {
    const e = world.enemies[i];
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    if (e.sinking) {
      e.sinkT += dt;
      if (e.sinkT > 2) { world.enemies.splice(i, 1); removed = true; }
      continue;
    }
    // Circle the player at orbit distance.
    const dx = e.x - s.x;
    const dz = e.z - s.z;
    const d = Math.hypot(dx, dz) || 1;
    const a = Math.atan2(dz, dx) + e.orbitDir * 0.7;
    const r = Math.min(d, ENEMY.orbitDistance);
    const tx = s.x + Math.cos(a) * r;
    const tz = s.z + Math.sin(a) * r;
    e.heading = turnToward(e.heading, Math.atan2(tx - e.x, tz - e.z), 2.4 * dt);
    e.x += Math.sin(e.heading) * e.speed * dt;
    e.z += Math.cos(e.heading) * e.speed * dt;

    // Keep enemies from stacking on each other or on the player.
    for (const o of world.enemies) {
      if (o === e || o.sinking) continue;
      const ox = e.x - o.x;
      const oz = e.z - o.z;
      const od = Math.hypot(ox, oz) || 0.001;
      if (od < ENEMY.radius * 2.4) {
        e.x += (ox / od) * (ENEMY.radius * 2.4 - od) * 0.5;
        e.z += (oz / od) * (ENEMY.radius * 2.4 - od) * 0.5;
      }
    }
    const pd = Math.hypot(e.x - s.x, e.z - s.z) || 0.001;
    if (pd < ENEMY.radius + SHIP.radius) {
      const push = ENEMY.radius + SHIP.radius - pd;
      e.x += ((e.x - s.x) / pd) * push;
      e.z += ((e.z - s.z) / pd) * push;
    }
    bumpBuoys(e, ENEMY.radius);
    collide(e, ENEMY.radius);

    // Lob a cannonball at where the player will be, with some error.
    e.fireIn -= dt;
    if (canFire && e.fireIn <= 0 && pd < ENEMY.fireRange) {
      e.fireIn = rand(...e.fireEvery);
      const lift = ENEMY.ballLift;
      const flight = (lift + Math.sqrt(lift * lift + 2 * GRAVITY * 0.2)) / GRAVITY;
      const px = s.x + Math.sin(s.heading) * s.speed * flight + rand(-1.4, 1.4);
      const pz = s.z + Math.cos(s.heading) * s.speed * flight + rand(-1.4, 1.4);
      fireBall(e.x, e.z, (px - e.x) / flight, (pz - e.z) / flight, lift, false);
    }
  }
  if (removed) setUi({ enemyIds: world.enemies.map((e) => e.id) });
};

const updateWaves = (dt, ui) => {
  if (ui.waveState === 'incoming') {
    world.waveTimer -= dt;
    if (world.waveTimer <= 0) {
      spawnWave(ui.wave);
      setUi({ wave: ui.wave + 1, waveState: 'fighting' });
    }
    return;
  }
  if (ui.waveState === 'fighting' && !world.enemies.some((e) => !e.sinking)) {
    if (ui.wave >= WAVES.length) {
      setUi({ mode: 'victory', waveState: 'idle' });
    } else {
      world.waveTimer = WAVE_BREAK;
      setUi({ waveState: 'incoming' });
    }
  }
};

// --- Cannonballs ------------------------------------------------------------

const damagePlayer = () => {
  const s = world.ship;
  s.hp = Math.max(0, s.hp - 1);
  s.hitFlash = 0.3;
  burst(s.x, 1.2, s.z, 'fire', 8, { speed: 3, up: 4 });
  burst(s.x, 1.2, s.z, 'wood', 6, { speed: 4, up: 5, size: 0.25 });
  setUi({ hp: s.hp });
  if (s.hp === 0) {
    s.speed = 0;
    burst(s.x, 1, s.z, 'smoke', 20, { speed: 2, up: 3, size: 0.8, life: 1.6 });
    if (world.race) {
      world.race.state = 'failed';
      world.race.shells = [];
      setRaceUi({ state: 'failed' });
    } else {
      setUi({ mode: 'defeat', waveState: 'idle' });
    }
  }
};

const damageEnemy = (e) => {
  e.hp -= 1;
  e.hitFlash = 0.25;
  burst(e.x, 1, e.z, 'wood', 6, { speed: 4, up: 5, size: 0.25 });
  if (e.hp <= 0) {
    e.sinking = true;
    burst(e.x, 1, e.z, 'fire', 14, { speed: 4, up: 6, size: 0.45 });
    burst(e.x, 1, e.z, 'smoke', 10, { speed: 1.5, up: 2, size: 0.8, life: 1.6 });
  }
};

const updateBalls = (dt, ui) => {
  const balls = world.balls;
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    b.vy -= GRAVITY * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.z += b.vz * dt;

    let gone = false;
    if (b.y < 2.2) {
      if (b.fromPlayer) {
        const target = world.enemies.find((e) => !e.sinking && Math.hypot(e.x - b.x, e.z - b.z) < ENEMY.radius + 0.5);
        if (target) { damageEnemy(target); gone = true; }
      } else if ((ui.mode === 'combat' || ui.mode === 'race') && world.ship.hp > 0 && Math.hypot(world.ship.x - b.x, world.ship.z - b.z) < SHIP.radius + 0.3) {
        damagePlayer();
        gone = true;
      }
      if (!gone) {
        world.buoys.forEach((st) => {
          if (gone) return;
          const [bx, bz] = buoyPos(st);
          if (Math.hypot(bx - b.x, bz - b.z) < st.halfX + 0.3) {
            st.vx += b.vx * 0.25;
            st.vz += b.vz * 0.25;
            st.wobble = 1;
            burst(bx, 0.8, bz, 'water', 8, { speed: 2, up: 4, size: 0.3 });
            gone = true;
          }
        });
      }
      if (!gone) {
        for (const r of world.race?.rocks ?? []) {
          if (Math.hypot(r.cx - b.x, r.cz - b.z) < r.radius) {
            burst(b.x, Math.max(b.y, 0.5), b.z, 'sand', 6, { speed: 2, up: 3, size: 0.25 });
            gone = true;
            break;
          }
        }
      }
      if (!gone) {
        for (const c of STATIC_COLLIDERS) {
          if (insideCollider(c, b.x, b.z)) {
            burst(b.x, Math.max(b.y, 0.5), b.z, 'sand', 6, { speed: 2, up: 3, size: 0.25 });
            gone = true;
            break;
          }
        }
      }
    }
    if (!gone && b.y <= 0) {
      burst(b.x, 0.1, b.z, 'water', 8, { speed: 1.5, up: 5, size: 0.3, life: 0.7 });
      gone = true;
    }
    if (gone) balls.splice(i, 1);
  }
};

// --- Race -------------------------------------------------------------------

const applyPickup = (p) => {
  const s = world.ship;
  if (p.type === 'repair') {
    s.hp = Math.min(SHIP.maxHp, s.hp + PICKUP.repair.hp);
    setUi({ hp: s.hp });
    burst(p.x, 1, p.z, 'wood', 8, { speed: 2, up: 4, size: 0.25 });
    return;
  }
  s.effect = { type: p.type, t: PICKUP[p.type].duration, speed: PICKUP[p.type].speed };
  if (p.type === 'boost') s.speed = Math.max(s.speed, SHIP.maxSpeed);
  setRaceUi({ effect: p.type });
  burst(p.x, 0.5, p.z, p.type === 'boost' ? 'fire' : 'water', 10, { speed: 3, up: 4, size: 0.35 });
};

// Island mortars: aim near where the player is heading, mark that spot on the
// water, and the shell lands after `delay` seconds. It only hurts if the ship
// is still inside the marked circle.
const updateMortars = (dt, r) => {
  const cfg = r.cfg.mortar;
  if (!cfg) return;
  const s = world.ship;
  for (const m of r.mortars) {
    m.recoil = Math.max(0, m.recoil - dt * 3);
    m.aim = turnToward(m.aim, Math.atan2(s.x - m.x, s.z - m.z), 3 * dt);
    m.fireIn -= dt;
    if (m.fireIn > 0 || Math.hypot(s.x - m.x, s.z - m.z) > cfg.range) continue;
    m.fireIn = rand(...cfg.every);
    m.recoil = 1;
    const lead = cfg.delay * 0.6;
    r.shells.push({
      x: s.x + Math.sin(s.heading) * s.speed * lead + rand(-1.5, 1.5),
      z: s.z + Math.cos(s.heading) * s.speed * lead + rand(-1.5, 1.5),
      t: 0,
      delay: cfg.delay,
      radius: cfg.radius,
    });
    burst(m.x, 1.8, m.z, 'smoke', 6, { speed: 1.2, up: 2.5, size: 0.6, life: 1 });
  }
  for (let i = r.shells.length - 1; i >= 0; i--) {
    const sh = r.shells[i];
    sh.t += dt;
    if (sh.t < sh.delay) continue;
    r.shells.splice(i, 1);
    burst(sh.x, 0.3, sh.z, 'water', 16, { speed: 3, up: 7, size: 0.4, life: 0.9 });
    burst(sh.x, 0.6, sh.z, 'fire', 8, { speed: 3, up: 4, size: 0.4 });
    if (s.hp > 0 && Math.hypot(s.x - sh.x, s.z - sh.z) < sh.radius + SHIP.radius * 0.5) damagePlayer();
  }
};

const updateRace = (dt) => {
  const r = world.race;
  if (r.state === 'countdown') {
    r.countdown -= dt;
    if (r.countdown <= 0) {
      r.state = 'running';
      setRaceUi({ state: 'running', count: 0 });
    } else {
      setRaceUi({ count: Math.ceil(r.countdown) });
    }
    return;
  }
  if (r.state !== 'running') return;

  r.time += dt;
  if (r.cfg.enemies && !r.enemiesSpawned) {
    r.enemiesSpawned = true;
    spawnEnemies(r.cfg.enemies);
  }

  const s = world.ship;
  const [cx, cz] = RACE_CHECKPOINTS[r.next];
  if (Math.hypot(s.x - cx, s.z - cz) < CHECKPOINT_RADIUS + SHIP.radius * 0.5) {
    burst(cx, 0.5, cz, 'sand', 14, { speed: 4, up: 6, size: 0.35 });
    r.next += 1;
    if (r.next >= RACE_CHECKPOINTS.length) {
      r.state = 'finished';
      r.shells = [];
      s.effect = null;
      const { best, record } = saveRaceTime(r.difficulty, r.time);
      setRaceUi({ state: 'finished', next: r.next, effect: null, result: { time: r.time, best, record } });
      return;
    }
    setRaceUi({ next: r.next });
  }

  for (const p of r.pickups) {
    if (!p.taken && Math.hypot(s.x - p.x, s.z - p.z) < PICKUP.radius + SHIP.radius * 0.5) {
      p.taken = true;
      applyPickup(p);
    }
  }
  updateMortars(dt, r);
};

// --- Docking ----------------------------------------------------------------

const updateProximity = (ui) => {
  const s = world.ship;
  let near = null;
  if (ui.mode === 'explore') {
    let best = Infinity;
    for (const island of ISLANDS) {
      const d = distanceToCollider(island, s.x, s.z) - SHIP.radius * s.scale;
      if (d < DOCK_RANGE && d < best) { best = d; near = island.id; }
    }
  }
  setUi({ nearIsland: near });
};

// --- Frame ------------------------------------------------------------------

export const step = (dt) => {
  world.time += dt;
  const ui = getUi();
  updateParticles(dt);
  if (ui.openIsland) return; // game paused while reading a modal

  updateBuoys(dt);
  const racing = ui.mode === 'race' && world.race?.state === 'running';
  const playing = ui.mode === 'explore' || ui.mode === 'combat' || racing;
  updateShip(dt, playing, ui.mode === 'explore');
  if (ui.mode === 'race') updateRace(dt);
  if (ui.mode !== 'explore') {
    if (ui.mode === 'combat') updateWaves(dt, ui);
    updateEnemies(dt, ui.mode === 'combat' || racing);
  }
  updateBalls(dt, getUi());
  updateProximity(getUi());
};
