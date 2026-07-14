/* ============================================================
   RTOS/SEC — content data
   Every module has real teaching content, not just a title.
   Tracks: foundations | kernel | crypto | ops
   ============================================================ */

const TRACK_META = {
  foundations: { label: "Foundations", color: "#f5a524" },
  kernel:      { label: "Kernel & memory", color: "#35d0d9" },
  crypto:      { label: "Crypto & keys", color: "#a78bfa" },
  ops:         { label: "Ops & assurance", color: "#4ade80" },
};

const MODULES = [
  {
    n: 1, track: "foundations", title: "Introduction to Real-Time Operating Systems",
    lead: "An RTOS is judged not by how fast it runs but by whether it always responds within a bounded, predictable time. Correctness includes timeliness.",
    why: "Security can never be bolted on at the cost of determinism. A mitigation that adds unbounded latency has broken the system just as surely as an exploit would.",
    points: [
      "Hard vs. soft real-time: a missed deadline is a failure, not a slowdown.",
      "Where they run: flight controllers, ABS/airbag ECUs, infusion pumps, industrial PLCs.",
      "The core tension this whole guide lives in: confidentiality/integrity vs. worst-case latency."
    ], ref: "MOD 01"
  },
  {
    n: 2, track: "foundations", title: "RTOS Security Fundamentals",
    lead: "Threats, vulnerabilities, and risk framed for constrained devices: no MMU on many parts, tiny RAM, physical access by the attacker, and firmware that lives for 20 years.",
    why: "The threat model is different from a server. There is often no user to notice, no admin to patch, and a single trust domain shared by every task.",
    points: [
      "Attack surface: debug ports (JTAG/SWD), buses (SPI/I2C/CAN), radios, OTA update paths.",
      "Constraint reality: crypto must fit the cycle budget and the flash budget.",
      "Risk = likelihood × impact, and impact here can be physical harm."
    ], ref: "MOD 02"
  },
  {
    n: 3, track: "foundations", title: "Security Goals & Objectives",
    lead: "Confidentiality, integrity, availability — plus authentication and, critically for RTOS, timeliness as a first-class property.",
    why: "In real-time systems availability and timeliness dominate. An attacker who only delays your interrupt service routine has still defeated you.",
    points: [
      "CIA reordered: for many control systems integrity and availability outrank confidentiality.",
      "Add timeliness + authenticity to the classic triad.",
      "Define the objective per asset — the key store and the sensor loop need different guarantees."
    ], ref: "MOD 03"
  },
  {
    n: 4, track: "kernel", title: "Architecture & Security Implications",
    lead: "Monolithic vs. microkernel vs. partitioned. Where the kernel, drivers, and system-call boundary sit decides how far a single bug can spread.",
    why: "A monolithic RTOS runs every task in one privileged address space — one buffer overflow owns the aircraft. A microkernel or ARINC 653 partition contains the blast radius.",
    points: [
      "Monolithic (FreeRTOS classic): fast, tiny, but flat trust — everything is ring 0.",
      "Microkernel (seL4, QNX): IPC-mediated, formally verifiable isolation.",
      "Partitioned (ARINC 653 / IMA): time and space partitions enforced by the OS + hardware."
    ], ref: "MOD 04"
  },
  {
    n: 5, track: "kernel", title: "Secure RTOS Design Principles",
    lead: "Least privilege, secure boot, minimal trusted computing base, fail-safe defaults — applied where every byte and cycle is counted.",
    why: "The smaller the TCB, the smaller the surface you must trust and certify. Design is your cheapest security control; you can't test quality in later.",
    points: [
      "Minimise the TCB — seL4's ~10k LOC kernel is a security argument, not just an engineering one.",
      "Fail safe: on fault, enter a known safe state (e.g. actuators de-energised), never an open one.",
      "Establish a chain of trust from immutable ROM upward before any app code runs."
    ], ref: "MOD 05"
  },
  {
    n: 6, track: "kernel", title: "Memory Management & Security",
    lead: "The MPU (not MMU) is your main isolation tool on microcontrollers: coarse regions, hardware-enforced read/write/execute permissions, no virtual memory.",
    why: "No heap protection means one task's buffer overflow silently corrupts another task's stack. An MPU turns that corruption into a fault you can catch and contain.",
    points: [
      "MPU regions: mark flash execute-only, RAM no-execute (W^X) — kills injected shellcode.",
      "Give each task its own stack region; a stack overflow faults instead of scribbling on a neighbour.",
      "Watch FFI and DMA — they can bypass MPU checks entirely if configured carelessly."
    ], ref: "MOD 06"
  },
  {
    n: 7, track: "kernel", title: "Process / Task Management & Security",
    lead: "Task creation, synchronisation, and IPC. Shared resources guarded by mutexes are where priority inversion — and its security cousin, denial of timeliness — live.",
    why: "A low-priority task holding a mutex can block a high-priority one indefinitely. Mars Pathfinder rebooted on this. An attacker can trigger it deliberately.",
    points: [
      "Use priority inheritance (PIP) or priority ceiling (PCP) on every shared mutex.",
      "Bound every blocking call — never wait forever on a resource in a control task.",
      "Validate all data crossing an IPC boundary; treat another task as untrusted input."
    ], ref: "MOD 07"
  },
  {
    n: 8, track: "kernel", title: "Interrupt Handling & Security",
    lead: "Interrupts are the RTOS's reflexes. Their priorities, latency, and the tiny code inside an ISR are a prime target for both faults and attacks.",
    why: "An interrupt storm is a trivial DoS: flood a line and starve every task below it. And an ISR that touches shared state without discipline is a race waiting to be exploited.",
    points: [
      "Keep ISRs minimal — defer work to a task; long ISRs blow your worst-case latency.",
      "Rate-limit or debounce external interrupt sources to blunt interrupt storms.",
      "Never call blocking or non-reentrant functions from an ISR."
    ], ref: "MOD 08"
  },
  {
    n: 9, track: "kernel", title: "Scheduling & Security",
    lead: "Rate-monotonic and deadline-monotonic scheduling give you a provable schedulability bound. Security means protecting that proof from being violated at runtime.",
    why: "Schedulability is a safety argument you submit to a certifier. If an attacker can inject load or extend a task's execution time, they invalidate the proof — see the scheduler lab.",
    points: [
      "RMS bound: n tasks are schedulable if total utilisation ≤ n(2^(1/n) − 1).",
      "Measure real WCET — don't trust average-case timing in a safety case.",
      "Guard against execution-time attacks (e.g. algorithmic complexity blowups on attacker input)."
    ], ref: "MOD 09"
  },
  {
    n: 10, track: "ops", title: "Communication & Networking Security",
    lead: "TLS/DTLS on a device with 64 KB of RAM. Protecting CAN, ARINC 429, MIL-STD-1553, and IP links without breaking the timing budget.",
    why: "Legacy buses like CAN have zero authentication by design — any node can spoof any message. Bolting on security must respect the bus's real-time slots.",
    points: [
      "DTLS over UDP suits lossy real-time links better than TLS-over-TCP head-of-line blocking.",
      "For CAN, add message authentication codes (e.g. AUTOSAR SecOC) within the frame budget.",
      "Segment the network — a compromised infotainment node must not reach the brake bus."
    ], ref: "MOD 10"
  },
  {
    n: 11, track: "kernel", title: "Device Drivers & Security",
    lead: "Drivers run privileged and talk to untrusted hardware. They are the classic soft underbelly: parsing attacker-influenced register and buffer data at ring 0.",
    why: "Most kernel CVEs are driver bugs. A driver that trusts a length field from a peripheral hands an attacker a write primitive in privileged memory.",
    points: [
      "Validate every length and offset that comes from hardware before you index with it.",
      "Constrain DMA with an IOMMU/MPU so a device can't write outside its buffer.",
      "Keep drivers small and, where the architecture allows, run them de-privileged (userspace drivers)."
    ], ref: "MOD 11"
  },
  {
    n: 12, track: "ops", title: "File Systems & Security",
    lead: "Flash file systems, wear levelling, access control, and at-rest encryption on media that can be desoldered and read directly.",
    why: "Physical access is assumed. If secrets sit in plaintext on flash, an attacker with a chip reader has them. Encryption at rest and secure erase are baseline.",
    points: [
      "Encrypt sensitive partitions; keep keys in hardware, never on the same flash.",
      "Remember wear levelling copies old blocks — 'delete' rarely erases; use secure-erase.",
      "Enforce least-privilege access control between tasks and files."
    ], ref: "MOD 12"
  },
  {
    n: 13, track: "crypto", title: "Cryptography & Secure Protocols",
    lead: "Choosing and integrating primitives — AES-GCM, ChaCha20-Poly1305, ECDSA, SHA-2/3 — within cycle and power budgets, ideally on a hardware crypto engine.",
    why: "The algorithm is almost never the weak point; the integration is. Nonce reuse, missing authentication, and homemade modes cause nearly all real embedded crypto failures.",
    points: [
      "Prefer AEAD (GCM, Poly1305) so you never ship encryption without authentication.",
      "Use the hardware crypto accelerator — constant-time and far cheaper on the cycle budget.",
      "Never invent a mode or a padding scheme; use vetted library defaults."
    ], ref: "MOD 13"
  },
  {
    n: 14, track: "crypto", title: "Access Control & Authentication",
    lead: "Authentication, authorization, and accounting on devices that often have no human user — so it's machine-to-machine identity, not passwords.",
    why: "'Admin' on an embedded device usually means a debug command interface. If it authenticates weakly or not at all, it's a backdoor with a warranty.",
    points: [
      "Use asymmetric device identity (a per-device key in secure storage), not shared secrets.",
      "Lock down or disable debug/command interfaces in production builds.",
      "Log security-relevant events even with no console — you'll need them for incident response."
    ], ref: "MOD 14"
  },
  {
    n: 15, track: "ops", title: "Threat Modeling & Risk Assessment",
    lead: "Systematically enumerating what can go wrong using STRIDE, attack trees, and the DO-326A / ED-202A airworthiness security process.",
    why: "You cannot mitigate what you haven't enumerated. A threat model is the document that turns 'we think it's secure' into a defensible, reviewable argument.",
    points: [
      "Apply STRIDE per component and per data-flow crossing a trust boundary.",
      "Build attack trees from the attacker's goal (e.g. 'command an actuator') downward.",
      "Rank by risk, then trace each high risk to a specific control — see the threat map."
    ], ref: "MOD 15"
  },
  {
    n: 16, track: "ops", title: "Security Testing & Validation",
    lead: "Fuzzing protocol parsers, penetration testing debug surfaces, static analysis for undefined behaviour, and verifying that timing holds under attack.",
    why: "Real-time systems need a fourth test axis: does the security control still meet the deadline under adversarial load? Functional pass isn't enough.",
    points: [
      "Fuzz every parser that touches external input (CAN frames, OTA blobs, sensor packets).",
      "Static-analyse for the MISRA-C / CERT-C classes that cause memory corruption.",
      "Test worst-case timing under interrupt storms and max-rate message injection."
    ], ref: "MOD 16"
  },
  {
    n: 17, track: "ops", title: "Secure Coding Practices",
    lead: "MISRA C, CERT C, and defensive patterns: no dynamic allocation after init, bounded loops, checked arithmetic, and validated inputs at every boundary.",
    why: "In C, the language is the vulnerability. Coding standards exist to remove whole classes of undefined behaviour before they become CVEs — and certifiers require them.",
    points: [
      "No malloc after startup — static allocation makes memory use provable and bounded.",
      "Check every integer operation that could overflow before you trust the result.",
      "Validate at the boundary; deep inside the system, invariants should already hold."
    ], ref: "MOD 17"
  },
  {
    n: 18, track: "ops", title: "Security Standards & Regulations",
    lead: "The map of what you must satisfy: DO-178C + DO-326A (avionics), ISO 26262 + ISO/SAE 21434 (automotive), IEC 62443 / ISA-99 (industrial), IEC 62304 (medical).",
    why: "These aren't bureaucracy — they're the shared language between you and the authority that lets your device fly, drive, or treat a patient. The evidence trail is the product.",
    points: [
      "Avionics: DO-178C for safety, DO-326A/ED-202A for airworthiness security.",
      "Automotive: ISO 26262 (safety) pairs with ISO/SAE 21434 (cybersecurity).",
      "Industrial: IEC 62443 defines security levels SL 1–4 for zones and conduits."
    ], ref: "MOD 18"
  },
  {
    n: 19, track: "ops", title: "Incident Response & Recovery",
    lead: "Detection, containment, and recovery on a device that may be unreachable, safety-critical, and unable to simply 'reboot and lose data'.",
    why: "You can't take a flight controller offline to investigate. IR for RTOS means designing detection and safe recovery in from the start, not scrambling after.",
    points: [
      "Design a tamper-evident, append-only event log you can extract post-incident.",
      "Plan a safe-mode fallback: degraded but safe beats fully-featured but compromised.",
      "Have a signed, rollback-protected update path ready before you need to patch in the field."
    ], ref: "MOD 19"
  },
  {
    n: 20, track: "ops", title: "Security Information & Event Management",
    lead: "Log management and analytics for fleets of constrained devices — aggregating sparse, low-bandwidth telemetry into something you can actually reason about.",
    why: "One device's log is noise; a fleet's logs are a signal. Centralised analytics catch the slow, distributed attack that no single node would ever flag.",
    points: [
      "Emit structured, minimal security events — bandwidth and power are scarce.",
      "Timestamp with a trustworthy source; correlation is impossible without synced clocks.",
      "Watch for fleet-wide anomalies (mass auth failures, coordinated timing shifts)."
    ], ref: "MOD 20"
  },
  {
    n: 21, track: "crypto", title: "Secure Communication Protocols",
    lead: "The concrete protocol layer: TLS 1.3, DTLS 1.3, and lightweight options like OSCORE for CoAP, tuned for real-time constraints and session-resumption cost.",
    why: "Handshakes are expensive in cycles and round-trips. Choosing the right protocol and resumption strategy keeps security from blowing your latency budget on every reconnect.",
    points: [
      "Prefer TLS 1.3 / DTLS 1.3 — fewer round trips, safer defaults, no legacy ciphers.",
      "Use session resumption / PSK to avoid a full handshake on every wake-up.",
      "For CoAP/IoT, OSCORE protects the payload end-to-end through proxies."
    ], ref: "MOD 21"
  },
  {
    n: 22, track: "crypto", title: "Secure Boot & Firmware Security",
    lead: "The chain of trust: immutable ROM verifies the bootloader, which verifies firmware, which verifies apps — each stage signature-checked before it runs.",
    why: "Without verified boot, an attacker who writes flash owns the device permanently. This is the single most important control for a device you can't physically guard.",
    points: [
      "Root of trust in mask ROM or OTP — immutable, so the chain has a fixed anchor.",
      "Verify each stage's signature before transferring control; never run unverified code.",
      "Add rollback protection (monotonic version counters) so old, vulnerable firmware can't be reflashed."
    ], ref: "MOD 22"
  },
  {
    n: 23, track: "crypto", title: "Secure Key Management",
    lead: "Generation, storage, distribution, rotation, and revocation of keys on devices deployed for decades — the hardest, most-neglected part of embedded crypto.",
    why: "Great crypto with a hardcoded key is no crypto. Keys must live in hardware (secure element / TPM / TrustZone) and never touch general flash or a shared address space.",
    points: [
      "Generate keys on-device with a real TRNG; never ship identical keys across a fleet.",
      "Store private keys in a secure element / HSM — the key should never leave the boundary.",
      "Plan rotation and revocation before deployment; a 20-year device will outlive its algorithms."
    ], ref: "MOD 23"
  },
  {
    n: 24, track: "foundations", title: "Security for Specific Industries",
    lead: "How the same principles land differently in aerospace (DO-178C, ARINC 653), automotive (AUTOSAR, ISO 21434), and medical (IEC 62304, FDA premarket cyber).",
    why: "The physics and the regulator change the priorities. An aircraft partitions for determinism; a car segments buses; a pump proves it can't overdose a patient. Same toolbox, different proof.",
    points: [
      "Aerospace: time/space partitioning (ARINC 653) so a failed function can't starve a critical one.",
      "Automotive: domain isolation so infotainment can't reach the powertrain bus.",
      "Medical: risk-based, with a documented argument that the device is safe when secure controls fail."
    ], ref: "MOD 24"
  },
  {
    n: 25, track: "foundations", title: "Wrap-Up: Future Directions & Your Next Steps",
    lead: "Post-quantum readiness, formally verified kernels going mainstream, and a career path from embedded developer to safety-and-security architect.",
    why: "The frontier: CNSA 2.0 mandates post-quantum crypto on a timeline that outlives today's devices, and formally verified kernels are moving from research to certified products.",
    points: [
      "Post-quantum: start crypto-agility now so 20-year devices can migrate to ML-KEM / ML-DSA.",
      "Formal methods: seL4-style verified isolation is becoming a practical, certifiable option.",
      "Your path: master one RTOS deeply, one standard fully, and one threat model end to end."
    ], ref: "MOD 25"
  },
];

/* ---------------- THREAT MAP (STRIDE across the stack) ---------------- */
const STRIDE = ["Spoofing","Tampering","Repudiation","Info disclosure","DoS","Elevation"];

const THREATS = [
  {
    layer: "Boot & firmware",
    sub: "Root of trust · the anchor everything else rests on",
    attack: "An attacker with flash-write access (physical or via an unsigned update path) replaces the firmware with their own. If boot doesn't verify signatures, the malicious image runs with full privilege on every power-up — a permanent, invisible foothold.",
    incident: "Echoes the class of attacks behind badge-of-trust bypasses in IoT devices and the reason automotive ECUs moved to hardware secure boot after researchers reflashed them over the diagnostic port.",
    fix: "Anchor a chain of trust in immutable ROM/OTP, signature-verify each stage before running it, and add monotonic rollback counters so old vulnerable firmware can't be reflashed. (Modules 5, 22.)",
    hits: [1,1,0,0,0,1]
  },
  {
    layer: "Kernel & scheduler",
    sub: "Determinism as a security property",
    attack: "The attacker doesn't crash the kernel — they make a critical task miss its deadline. Injected load, an interrupt storm, or a triggered priority inversion starves the control loop. Against a flight or brake controller, denial of timeliness is denial of safety.",
    incident: "Mars Pathfinder's 1997 repeated resets were an unintentional priority inversion — a low-priority task held a mutex the high-priority task needed. An attacker can induce the same condition on purpose.",
    fix: "Enforce priority inheritance or ceiling protocols on shared mutexes, prove schedulability with real WCET, and rate-limit interrupt sources. (Modules 7, 8, 9.)",
    hits: [0,0,0,0,1,0]
  },
  {
    layer: "Memory & tasks",
    sub: "Isolation on parts with no MMU",
    attack: "A buffer overflow in one task, on a flat memory model, overwrites another task's stack or the kernel — turning a bug into a write primitive. Without W^X, injected data becomes injected code.",
    incident: "The staple of embedded CVEs: unchecked memcpy/strcpy in message handlers. FreeRTOS TCP/IP stack advisories over the years are textbook examples of remote memory corruption.",
    fix: "Use the MPU to give each task its own region, mark RAM no-execute and flash execute-only (W^X), and validate every length before you copy. (Modules 6, 11, 17.)",
    hits: [0,1,0,1,0,1]
  },
  {
    layer: "Drivers & I/O",
    sub: "Privileged code parsing untrusted hardware",
    attack: "A driver trusts a length or offset field coming from a peripheral or bus and indexes with it, or programs a DMA descriptor from attacker-influenced values — handing over a privileged read/write anywhere in memory.",
    incident: "DMA-based attacks (the 'Thunderclap' class) showed peripherals reading and writing kernel memory when the IOMMU wasn't constraining them. The same lesson applies to embedded DMA engines.",
    fix: "Validate all hardware-supplied lengths/offsets, constrain DMA with an IOMMU/MPU, and keep drivers minimal and de-privileged where the architecture allows. (Module 11.)",
    hits: [0,1,0,1,0,1]
  },
  {
    layer: "Comms & buses",
    sub: "Legacy buses trust every node",
    attack: "On CAN, ARINC 429, or MIL-STD-1553 there is no built-in authentication — any node can transmit any message ID. A compromised low-criticality node injects forged commands onto a shared bus that a critical controller obeys.",
    incident: "The 2015 Jeep Cherokee remote hack pivoted from the infotainment head unit onto the CAN bus and sent forged frames to steering and brakes — a direct consequence of an unsegmented, unauthenticated bus.",
    fix: "Add message authentication (AUTOSAR SecOC) within the frame budget, segment networks so low-trust nodes can't reach critical buses, and use DTLS 1.3 on IP links. (Modules 10, 21.)",
    hits: [1,1,1,0,1,0]
  },
  {
    layer: "Crypto & keys",
    sub: "Integration, not algorithm, is where it breaks",
    attack: "A hardcoded key in flash, a reused AES-GCM nonce, or encryption without authentication (raw CBC). None of these break the cipher — they make it irrelevant. One extracted device key can compromise a whole fleet.",
    incident: "Countless embedded products have shipped a single shared key baked into firmware; once one unit is dumped, every unit is open. Nonce-reuse in GCM has broken real deployed systems' confidentiality and integrity at once.",
    fix: "Use AEAD modes, generate per-device keys on-device with a TRNG, and store private keys in a secure element that they never leave. (Modules 13, 22, 23 — and the code bench below.)",
    hits: [1,1,0,1,0,1]
  },
];

/* ---------------- CODE BENCH (flaw vs. fix) ---------------- */
/* Tokens are pre-classed spans for lightweight highlighting. */
const SNIPPETS = [
  {
    id: "nonce",
    title: "AES-GCM nonce reuse",
    desc: "GCM is only secure if every (key, nonce) pair is used once. Reuse the nonce under the same key and an attacker can forge messages and recover the keystream. This is the most common embedded crypto failure.",
    bad: {
      note: "A fixed nonce means every message uses the same keystream position. Two ciphertexts XOR'd together leak plaintext, and the authentication tag can be forged.",
      code:
`<span class="c">/* FLAWED: nonce is constant across every call */</span>
<span class="k">static</span> <span class="k">const</span> <span class="t">uint8_t</span> nonce[<span class="n">12</span>] = { <span class="n">0</span> };  <span class="c">/* never changes */</span>

<span class="t">int</span> <span class="f">encrypt_msg</span>(<span class="t">uint8_t</span> *ct, <span class="k">const</span> <span class="t">uint8_t</span> *pt, <span class="t">size_t</span> len) {
    <span class="k">return</span> <span class="f">aes_gcm_encrypt</span>(key, nonce, pt, len, ct, tag);
}`
    },
    good: {
      note: "Derive a unique nonce per message — here a monotonic counter, stored in non-volatile memory so it never repeats across reboots. A random 96-bit nonce is also fine if your TRNG is sound.",
      code:
`<span class="c">/* HARDENED: monotonic per-message nonce, persisted */</span>
<span class="t">int</span> <span class="f">encrypt_msg</span>(<span class="t">uint8_t</span> *ct, <span class="k">const</span> <span class="t">uint8_t</span> *pt, <span class="t">size_t</span> len) {
    <span class="t">uint8_t</span> nonce[<span class="n">12</span>];
    <span class="t">uint64_t</span> ctr = <span class="f">nv_counter_next</span>();  <span class="c">/* survives reboot, never repeats */</span>
    <span class="f">memcpy</span>(nonce, &device_id, <span class="n">4</span>);  <span class="c">/* 32-bit unique prefix */</span>
    <span class="f">memcpy</span>(nonce + <span class="n">4</span>, &ctr, <span class="n">8</span>);   <span class="c">/* 64-bit counter    */</span>
    <span class="k">return</span> <span class="f">aes_gcm_encrypt</span>(key, nonce, pt, len, ct, tag);
}`
    }
  },
  {
    id: "key",
    title: "Hardcoded key in firmware",
    desc: "A key compiled into the binary is a key in every attacker's hands the moment one device is dumped. Dump-and-extract is a 20-minute job with a chip reader.",
    bad: {
      note: "The key sits in flash in plaintext, identical on every unit. One extracted device compromises the entire fleet — and you can never rotate it without a full reflash.",
      code:
`<span class="c">/* FLAWED: shared key baked into the image */</span>
<span class="k">static</span> <span class="k">const</span> <span class="t">uint8_t</span> aes_key[<span class="n">32</span>] = {
    <span class="n">0x2b</span>, <span class="n">0x7e</span>, <span class="n">0x15</span>, <span class="n">0x16</span>, <span class="n">0x28</span>, <span class="n">0xae</span>, <span class="c">/* ... */</span>
};

<span class="f">crypto_init</span>(aes_key);  <span class="c">/* same secret on 100k devices */</span>`
    },
    good: {
      note: "The key is generated on-device at provisioning and lives inside a secure element. Application code references it by handle and never sees the raw bytes — extraction yields nothing.",
      code:
`<span class="c">/* HARDENED: key never leaves the secure element */</span>
<span class="t">key_handle_t</span> <span class="f">provision_device_key</span>(<span class="t">void</span>) {
    <span class="t">key_handle_t</span> h;
    <span class="c">/* SE generates a unique key internally using its TRNG */</span>
    <span class="f">se_generate_key</span>(SE_ALG_AES_256, SE_NON_EXPORTABLE, &h);
    <span class="k">return</span> h;  <span class="c">/* only a handle crosses the boundary */</span>
}

<span class="c">/* encryption runs *inside* the SE; key bytes never hit RAM */</span>
<span class="f">se_aes_gcm_encrypt</span>(h, nonce, pt, len, ct, tag);`
    }
  },
  {
    id: "auth",
    title: "Encryption without authentication",
    desc: "Raw CBC (or CTR) hides the data but doesn't detect tampering. An attacker can flip ciphertext bits to flip plaintext bits — bit-flipping and padding-oracle attacks live here.",
    bad: {
      note: "CBC provides confidentiality only. There is no integrity check, so a modified ciphertext decrypts to attacker-influenced plaintext with no error raised.",
      code:
`<span class="c">/* FLAWED: CBC alone — no integrity, no authenticity */</span>
<span class="f">aes_cbc_encrypt</span>(key, iv, pt, len, ct);
<span class="f">send</span>(ct, len);

<span class="c">/* receiver blindly decrypts whatever arrives */</span>
<span class="f">aes_cbc_decrypt</span>(key, iv, ct, len, pt);
<span class="f">act_on</span>(pt);  <span class="c">/* trusts tampered data */</span>`
    },
    good: {
      note: "Use an AEAD mode (GCM or ChaCha20-Poly1305). Decryption fails closed if the tag doesn't verify, so tampered data is rejected before it can be acted on.",
      code:
`<span class="c">/* HARDENED: AEAD verifies before it decrypts */</span>
<span class="f">aes_gcm_encrypt</span>(key, nonce, pt, len, ct, tag);
<span class="f">send</span>(ct, len, tag);

<span class="t">int</span> ok = <span class="f">aes_gcm_decrypt</span>(key, nonce, ct, len, pt, tag);
<span class="k">if</span> (ok != <span class="n">0</span>) {
    <span class="f">log_security_event</span>(EVT_TAG_FAIL);
    <span class="k">return</span> ERR_TAMPER;   <span class="c">/* fail closed — never act on it */</span>
}
<span class="f">act_on</span>(pt);`
    }
  },
  {
    id: "prng",
    title: "Predictable RNG seed",
    desc: "Keys, nonces, and challenges are only as strong as the randomness behind them. Seeding a PRNG from the clock or a fixed value makes every 'secret' guessable.",
    bad: {
      note: "srand(time(NULL)) has maybe a few thousand plausible values per boot window. An attacker reconstructs the seed and regenerates every key the device will ever make.",
      code:
`<span class="c">/* FLAWED: seed is low-entropy and guessable */</span>
<span class="f">srand</span>(<span class="f">time</span>(<span class="k">NULL</span>));           <span class="c">/* seconds of entropy... */</span>
<span class="t">uint32_t</span> <span class="f">gen_token</span>(<span class="t">void</span>) {
    <span class="k">return</span> <span class="f">rand</span>();               <span class="c">/* not cryptographic  */</span>
}`
    },
    good: {
      note: "Pull from the hardware TRNG for anything security-relevant. If you need a stream, seed a CSPRNG (e.g. CTR-DRBG) from the TRNG — never from the clock, MAC, or a counter.",
      code:
`<span class="c">/* HARDENED: hardware TRNG feeds a CSPRNG */</span>
<span class="t">int</span> <span class="f">gen_token</span>(<span class="t">uint8_t</span> *out, <span class="t">size_t</span> n) {
    <span class="c">/* block until the TRNG has real entropy */</span>
    <span class="k">if</span> (<span class="f">trng_read</span>(out, n) != n)
        <span class="k">return</span> ERR_ENTROPY;   <span class="c">/* fail, don't fall back to rand() */</span>
    <span class="k">return</span> <span class="n">0</span>;
}`
    }
  },
  {
    id: "mpu",
    title: "Task isolation with the MPU",
    desc: "On an MCU with no MMU, the Memory Protection Unit is your isolation boundary. Configure it so a task fault stays contained instead of corrupting the whole system.",
    bad: {
      note: "With no MPU regions set, every task shares one flat, fully-privileged address space. One overflow scribbles across task stacks and kernel data with nothing to stop it.",
      code:
`<span class="c">/* FLAWED: flat memory, everything privileged */</span>
<span class="f">task_create</span>(sensor_task, PRIO_HI, stack_hi, <span class="n">512</span>);
<span class="f">task_create</span>(comms_task,  PRIO_LO, stack_lo, <span class="n">512</span>);
<span class="c">/* comms overflow can walk straight into sensor's stack */</span>
<span class="f">scheduler_start</span>();`
    },
    good: {
      note: "Give each task an MPU region covering only its own stack, mark it no-execute (W^X), and let the fault handler catch any overrun. Corruption becomes a contained, detectable fault.",
      code:
`<span class="c">/* HARDENED: per-task MPU region, W^X, guarded */</span>
<span class="t">mpu_region_t</span> r = {
    .base  = (<span class="t">uint32_t</span>)stack_lo,
    .size  = <span class="n">512</span>,
    .attr  = MPU_RW | MPU_NX  <span class="c">/* writable, never executable */</span>
};
<span class="f">mpu_configure</span>(comms_task, &r);
<span class="c">/* an overrun now triggers MemManage_Handler, not silent corruption */</span>
<span class="f">scheduler_start</span>();`
    }
  },
  {
    id: "input",
    title: "Trusting a length field from the bus",
    desc: "The recurring driver bug: a packet says how long it is, and the parser believes it. Attacker sets a huge length, you copy past your buffer, they own privileged memory.",
    bad: {
      note: "hdr->len comes off the wire under attacker control. memcpy trusts it and writes far past buf — a classic remote memory-corruption primitive.",
      code:
`<span class="c">/* FLAWED: attacker controls the length */</span>
<span class="t">void</span> <span class="f">on_frame</span>(<span class="k">const</span> <span class="t">frame_t</span> *hdr, <span class="k">const</span> <span class="t">uint8_t</span> *payload) {
    <span class="t">uint8_t</span> buf[<span class="n">64</span>];
    <span class="f">memcpy</span>(buf, payload, hdr->len);  <span class="c">/* len may be 60000 */</span>
    <span class="f">process</span>(buf, hdr->len);
}`
    },
    good: {
      note: "Validate the length against your real buffer size before you copy, and reject anything out of range. The check is two lines and closes an entire vulnerability class.",
      code:
`<span class="c">/* HARDENED: bound-check before you trust it */</span>
<span class="t">void</span> <span class="f">on_frame</span>(<span class="k">const</span> <span class="t">frame_t</span> *hdr, <span class="k">const</span> <span class="t">uint8_t</span> *payload) {
    <span class="t">uint8_t</span> buf[<span class="n">64</span>];
    <span class="k">if</span> (hdr->len > <span class="k">sizeof</span>(buf)) {
        <span class="f">log_security_event</span>(EVT_BAD_LEN);
        <span class="k">return</span>;                  <span class="c">/* drop the frame */</span>
    }
    <span class="f">memcpy</span>(buf, payload, hdr->len);
    <span class="f">process</span>(buf, hdr->len);
}`
    }
  },
];
