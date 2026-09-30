#!/usr/bin/env python3
"""
ASTRA EDR - Raspberry Pi 7" Touchscreen Wi-Fi Boot Portal & Kiosk Dispatcher
=============================================================================
Runs on local port 5000. Provides a full-screen, touch-friendly Wi-Fi connection
portal with built-in virtual keyboard. Automatically checks internet status and
redirects to your hosted Vercel SOC console once connected.
Leaves all serial ports (/dev/ttyACM*, /dev/ttyUSB*) and Arduino Uno scripts 100% intact.
"""

import json
import os
import re
import socket
import subprocess
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 5000
# Default fallback Vercel URL (can be customized or passed as argument)
DEFAULT_VERCEL_URL = "https://astra-defense.vercel.app"

# Configuration file to store saved target URL
CONFIG_FILE = os.path.expanduser("~/kiosk/kiosk_config.json")

def load_target_url():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                data = json.load(f)
                return data.get("target_url", DEFAULT_VERCEL_URL)
        except Exception:
            pass
    return DEFAULT_VERCEL_URL

def save_target_url(url):
    try:
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, "w") as f:
            json.dump({"target_url": url}, f)
    except Exception:
        pass

def get_network_status():
    """Check internet connectivity and fetch current SSID and IP address."""
    connected = False
    ip_addr = None
    ssid = None

    # Check internet reachability
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(2.0)
        s.connect(("8.8.8.8", 53))
        ip_addr = s.getsockname()[0]
        s.close()
        connected = True
    except Exception:
        connected = False

    # Get active Wi-Fi SSID
    try:
        res = subprocess.run(
            ["nmcli", "-t", "-f", "ACTIVE,SSID", "dev", "wifi"],
            capture_output=True,
            text=True,
            timeout=3
        )
        for line in res.stdout.strip().split("\n"):
            if line.startswith("yes:"):
                ssid = line.split(":", 1)[1].strip()
                break
    except Exception:
        pass

    if not ssid:
        try:
            res = subprocess.run(["iwgetid", "-r"], capture_output=True, text=True, timeout=3)
            val = res.stdout.strip()
            if val:
                ssid = val
        except Exception:
            pass

    return {
        "connected": connected,
        "ip": ip_addr or "Not Assigned",
        "ssid": ssid or ("Connected" if connected else "Disconnected"),
        "target_url": load_target_url()
    }

def scan_wifi_networks():
    """Scan and return available SSIDs with signal strength and security type."""
    networks = []
    seen = set()

    try:
        # Trigger background rescan
        subprocess.run(["nmcli", "dev", "wifi", "rescan"], capture_output=True, timeout=5)
    except Exception:
        pass

    try:
        res = subprocess.run(
            ["nmcli", "-t", "-f", "SSID,SIGNAL,SECURITY", "dev", "wifi", "list"],
            capture_output=True,
            text=True,
            timeout=8
        )
        for line in res.stdout.strip().split("\n"):
            parts = line.split(":")
            if len(parts) >= 1:
                s_name = parts[0].strip()
                if s_name and s_name not in seen and not s_name.startswith("--"):
                    seen.add(s_name)
                    signal = parts[1].strip() if len(parts) > 1 else "50"
                    sec = parts[2].strip() if len(parts) > 2 else "Open"
                    networks.append({
                        "ssid": s_name,
                        "signal": int(signal) if signal.isdigit() else 50,
                        "security": sec or "Open"
                    })
    except Exception:
        pass

    # Sort by signal strength descending
    networks.sort(key=lambda x: x["signal"], reverse=True)
    return networks

def connect_to_wifi(ssid, password):
    """Execute Wi-Fi connection via nmcli."""
    if not ssid:
        return {"success": False, "error": "SSID is required"}

    cmd = ["nmcli", "dev", "wifi", "connect", ssid]
    if password:
        cmd.extend(["password", password])

    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=25)
        if res.returncode == 0 or "successfully activated" in res.stdout.lower():
            # Wait 2 seconds for IP assignment
            import time
            time.sleep(2)
            status = get_network_status()
            return {
                "success": True,
                "message": "Connected successfully",
                "ip": status["ip"],
                "ssid": status["ssid"]
            }
        else:
            err = res.stderr.strip() or res.stdout.strip()
            return {"success": False, "error": err or "Failed to connect to network"}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Connection timed out. Check password."}
    except Exception as e:
        return {"success": False, "error": str(e)}

HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ASTRA KIOSK // NETWORK BOOT</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-touch-callout: none; user-select: none; }
    body {
      background: #04060a;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }
    .cyber-grid {
      position: fixed; inset: 0; pointer-events: none; opacity: 0.15;
      background-image: linear-gradient(to right, rgba(0, 229, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    header {
      background: #080d16;
      border-bottom: 1px solid rgba(0, 229, 255, 0.25);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      width: 32px; height: 32px;
      border: 1px solid #00e5ff;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; color: #00e5ff;
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }
    .brand-title {
      font-size: 18px; font-weight: 800; letter-spacing: 2px;
      background: linear-gradient(to right, #ffffff, #00e5ff);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .brand-subtitle { font-size: 9px; letter-spacing: 1px; color: #64748b; text-transform: uppercase; font-family: monospace; }
    
    .status-badge {
      font-family: monospace; font-size: 11px; padding: 5px 10px;
      border-radius: 20px; display: flex; align-items: center; gap: 6px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .status-online { background: rgba(0, 255, 136, 0.12); border-color: rgba(0, 255, 136, 0.4); color: #00ff88; }
    .status-offline { background: rgba(255, 23, 68, 0.12); border-color: rgba(255, 23, 68, 0.4); color: #ff1744; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot-green { background: #00ff88; box-shadow: 0 0 8px #00ff88; }
    .dot-red { background: #ff1744; box-shadow: 0 0 8px #ff1744; }

    main {
      flex: 1;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
      position: relative;
      z-index: 5;
    }

    /* Connected View */
    #connected-view {
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      flex: 1;
      gap: 14px;
      padding: 20px;
    }
    .shield-icon {
      width: 68px; height: 68px; border-radius: 50%;
      border: 2px solid #00ff88;
      display: flex; align-items: center; justify-content: center;
      color: #00ff88; font-size: 32px;
      box-shadow: 0 0 25px rgba(0, 255, 136, 0.35);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 0 15px rgba(0, 255, 136, 0.2); }
      50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(0, 255, 136, 0.5); }
      100% { transform: scale(1); box-shadow: 0 0 15px rgba(0, 255, 136, 0.2); }
    }
    .redirect-title { font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 1px; }
    .redirect-sub { font-family: monospace; font-size: 13px; color: #00e5ff; }
    .progress-bar-container {
      width: 100%; max-width: 380px; height: 8px;
      background: #0f172a; border-radius: 4px; overflow: hidden;
      border: 1px solid rgba(0, 229, 255, 0.3);
    }
    .progress-bar {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, #00e5ff, #00ff88);
      transition: width 0.1s linear;
    }
    .btn-manual {
      margin-top: 10px;
      background: #00e5ff; color: #04060a;
      font-weight: 700; padding: 10px 24px; border-radius: 6px;
      font-size: 13px; letter-spacing: 1px; text-transform: uppercase;
      border: none; cursor: pointer;
    }

    /* Disconnected Setup View */
    #disconnected-view {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 10px;
    }
    .portal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      flex: 1;
    }
    @media (max-width: 700px) {
      .portal-grid { grid-template-columns: 1fr; }
    }
    .panel {
      background: #080d16;
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 8px;
      padding: 10px;
      display: flex;
      flex-direction: column;
    }
    .panel-header {
      font-family: monospace; font-size: 11px; font-weight: 700;
      color: #00e5ff; text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;
    }
    .btn-scan {
      background: rgba(0, 229, 255, 0.15); border: 1px solid #00e5ff;
      color: #00e5ff; padding: 4px 8px; border-radius: 4px; font-size: 10px;
      font-family: monospace; cursor: pointer;
    }
    .network-list {
      flex: 1; overflow-y: auto; max-height: 180px; display: flex; flex-direction: column; gap: 6px;
    }
    .network-item {
      background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px; padding: 8px 10px;
      display: flex; align-items: center; justify-content: space-between;
      cursor: pointer; transition: all 0.2s;
    }
    .network-item.selected {
      background: rgba(0, 229, 255, 0.15);
      border-color: #00e5ff;
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
    }
    .network-name { font-size: 13px; font-weight: 600; color: #ffffff; }
    .network-info { font-family: monospace; font-size: 10px; color: #94a3b8; }
    
    .input-group {
      margin-bottom: 8px;
    }
    .input-label { font-family: monospace; font-size: 10px; color: #94a3b8; margin-bottom: 4px; display: block; }
    .input-box {
      width: 100%; padding: 8px 10px;
      background: #0f172a; border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 4px; color: #ffffff; font-size: 14px;
      font-family: monospace; outline: none;
    }
    .input-box:focus { border-color: #00e5ff; box-shadow: 0 0 8px rgba(0, 229, 255, 0.3); }

    .btn-connect {
      width: 100%; padding: 10px;
      background: linear-gradient(90deg, #00e5ff, #00ff88);
      border: none; border-radius: 6px;
      color: #04060a; font-weight: 800; font-size: 13px;
      letter-spacing: 1.5px; text-transform: uppercase;
      cursor: pointer; margin-top: 4px;
    }
    .btn-connect:disabled { opacity: 0.5; cursor: not-allowed; }

    /* On-Screen Touch Keyboard */
    .keyboard-container {
      background: #080d16;
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 8px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 6px;
    }
    .kb-row {
      display: flex;
      gap: 4px;
      justify-content: center;
    }
    .kb-key {
      flex: 1;
      height: 38px;
      min-width: 24px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: #e2e8f0;
      font-size: 14px;
      font-weight: 600;
      font-family: monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
    }
    .kb-key:active {
      background: #00e5ff;
      color: #04060a;
      transform: scale(0.96);
    }
    .kb-key-wide { flex: 1.6; font-size: 11px; background: #1e293b; color: #00e5ff; }
    .kb-key-space { flex: 4; }

    #toast {
      position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%);
      background: #ff1744; color: #fff; font-family: monospace; font-size: 12px;
      padding: 8px 16px; border-radius: 20px; display: none; z-index: 100;
      box-shadow: 0 0 15px rgba(255, 23, 68, 0.5);
    }
  </style>
</head>
<body>
  <div class="cyber-grid"></div>

  <header>
    <div class="brand">
      <div class="brand-logo">A</div>
      <div>
        <div class="brand-title">ASTRA EDR</div>
        <div class="brand-subtitle">7" Hardware Kiosk Bootloader</div>
      </div>
    </div>
    <div id="status-badge" class="status-badge status-offline">
      <span class="dot dot-red" id="status-dot"></span>
      <span id="status-text">OFFLINE</span>
    </div>
  </header>

  <main>
    <!-- View 1: Wi-Fi Connected -> Auto Redirect -->
    <div id="connected-view">
      <div class="shield-icon">✓</div>
      <div>
        <div class="redirect-title">WI-FI LINK ESTABLISHED</div>
        <div class="redirect-sub" id="connected-info">SSID: Scanning... // IP: ...</div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="progress-bar"></div>
      </div>
      <p style="font-family: monospace; font-size: 11px; color: #94a3b8;">
        Launching ASTRA Cloud Console in <span id="countdown">2</span>s...
      </p>
      <div style="display:flex; gap: 8px;">
        <button class="btn-manual" onclick="redirectToApp()">ENTER NOW</button>
        <button class="btn-manual" style="background:#1e293b; color:#94a3b8;" onclick="forceConfigureWifi()">CHANGE WI-FI</button>
      </div>
    </div>

    <!-- View 2: Disconnected -> Select & Connect -->
    <div id="disconnected-view">
      <div class="portal-grid">
        <!-- Left Column: Available Networks -->
        <div class="panel">
          <div class="panel-header">
            <span>DETECTION LIST</span>
            <button class="btn-scan" onclick="scanNetworks()">↻ SCAN</button>
          </div>
          <div class="network-list" id="network-list">
            <div style="font-family: monospace; font-size: 11px; color: #64748b; padding: 10px; text-align: center;">
              Scanning wireless channels...
            </div>
          </div>
        </div>

        <!-- Right Column: Selected SSID & Credentials -->
        <div class="panel">
          <div class="panel-header">AUTHENTICATION</div>
          
          <div class="input-group">
            <label class="input-label">SELECTED SSID</label>
            <input type="text" id="target-ssid" class="input-box" placeholder="Select from list or type..." onfocus="setActiveInput('target-ssid')">
          </div>

          <div class="input-group">
            <label class="input-label">WI-FI PASSPHRASE</label>
            <input type="password" id="target-pwd" class="input-box" placeholder="Enter network key..." onfocus="setActiveInput('target-pwd')">
          </div>

          <div class="input-group">
            <label class="input-label">HOSTED CONSOLE URL</label>
            <input type="text" id="target-url" class="input-box" placeholder="https://your-astra.vercel.app" onfocus="setActiveInput('target-url')">
          </div>

          <button id="btn-connect" class="btn-connect" onclick="connectWifi()">
            CONNECT & LAUNCH
          </button>
        </div>
      </div>

      <!-- Built-in 7" Touch Screen On-Screen Keyboard -->
      <div class="keyboard-container" id="onscreen-keyboard">
        <!-- Row 1 Numbers -->
        <div class="kb-row">
          <div class="kb-key" onclick="pressKey('1')">1</div>
          <div class="kb-key" onclick="pressKey('2')">2</div>
          <div class="kb-key" onclick="pressKey('3')">3</div>
          <div class="kb-key" onclick="pressKey('4')">4</div>
          <div class="kb-key" onclick="pressKey('5')">5</div>
          <div class="kb-key" onclick="pressKey('6')">6</div>
          <div class="kb-key" onclick="pressKey('7')">7</div>
          <div class="kb-key" onclick="pressKey('8')">8</div>
          <div class="kb-key" onclick="pressKey('9')">9</div>
          <div class="kb-key" onclick="pressKey('0')">0</div>
          <div class="kb-key kb-key-wide" onclick="pressBackspace()">⌫</div>
        </div>
        <!-- Row 2 QWERTY -->
        <div class="kb-row">
          <div class="kb-key" onclick="pressKey('q')">q</div>
          <div class="kb-key" onclick="pressKey('w')">w</div>
          <div class="kb-key" onclick="pressKey('e')">e</div>
          <div class="kb-key" onclick="pressKey('r')">r</div>
          <div class="kb-key" onclick="pressKey('t')">t</div>
          <div class="kb-key" onclick="pressKey('y')">y</div>
          <div class="kb-key" onclick="pressKey('u')">u</div>
          <div class="kb-key" onclick="pressKey('i')">i</div>
          <div class="kb-key" onclick="pressKey('o')">o</div>
          <div class="kb-key" onclick="pressKey('p')">p</div>
          <div class="kb-key" onclick="pressKey('-')">-</div>
        </div>
        <!-- Row 3 ASDF -->
        <div class="kb-row">
          <div class="kb-key" onclick="pressKey('a')">a</div>
          <div class="kb-key" onclick="pressKey('s')">s</div>
          <div class="kb-key" onclick="pressKey('d')">d</div>
          <div class="kb-key" onclick="pressKey('f')">f</div>
          <div class="kb-key" onclick="pressKey('g')">g</div>
          <div class="kb-key" onclick="pressKey('h')">h</div>
          <div class="kb-key" onclick="pressKey('j')">j</div>
          <div class="kb-key" onclick="pressKey('k')">k</div>
          <div class="kb-key" onclick="pressKey('l')">l</div>
          <div class="kb-key" onclick="pressKey('@')">@</div>
          <div class="kb-key" onclick="pressKey('.')">.</div>
        </div>
        <!-- Row 4 ZXCV -->
        <div class="kb-row">
          <div class="kb-key kb-key-wide" id="shift-key" onclick="toggleShift()">⇧ SHIFT</div>
          <div class="kb-key" onclick="pressKey('z')">z</div>
          <div class="kb-key" onclick="pressKey('x')">x</div>
          <div class="kb-key" onclick="pressKey('c')">c</div>
          <div class="kb-key" onclick="pressKey('v')">v</div>
          <div class="kb-key" onclick="pressKey('b')">b</div>
          <div class="kb-key" onclick="pressKey('n')">n</div>
          <div class="kb-key" onclick="pressKey('m')">m</div>
          <div class="kb-key" onclick="pressKey('_')">_</div>
          <div class="kb-key kb-key-wide" onclick="clearInput()">CLEAR</div>
        </div>
        <!-- Row 5 Space -->
        <div class="kb-row">
          <div class="kb-key kb-key-space" onclick="pressKey(' ')">SPACE</div>
        </div>
      </div>
    </div>
  </main>

  <div id="toast"></div>

  <script>
    let currentTargetUrl = "https://astra-defense.vercel.app";
    let activeInputId = "target-pwd";
    let isShift = false;
    let redirectTimer = null;
    let progressTimer = null;

    function showToast(msg, isError = true) {
      const toast = document.getElementById("toast");
      toast.innerText = msg;
      toast.style.background = isError ? "#ff1744" : "#00ff88";
      toast.style.color = isError ? "#ffffff" : "#04060a";
      toast.style.display = "block";
      setTimeout(() => { toast.style.display = "none"; }, 4000);
    }

    function setActiveInput(id) {
      activeInputId = id;
    }

    function pressKey(char) {
      const el = document.getElementById(activeInputId);
      if (!el) return;
      const key = isShift ? char.toUpperCase() : char;
      el.value += key;
    }

    function pressBackspace() {
      const el = document.getElementById(activeInputId);
      if (!el || !el.value) return;
      el.value = el.value.slice(0, -1);
    }

    function clearInput() {
      const el = document.getElementById(activeInputId);
      if (!el) return;
      el.value = "";
    }

    function toggleShift() {
      isShift = !isShift;
      document.getElementById("shift-key").style.background = isShift ? "#00e5ff" : "#1e293b";
      document.getElementById("shift-key").style.color = isShift ? "#04060a" : "#00e5ff";
    }

    function selectNetwork(ssid) {
      document.getElementById("target-ssid").value = ssid;
      document.querySelectorAll(".network-item").forEach(el => el.classList.remove("selected"));
      const target = document.getElementById("net-" + btoa(ssid).replace(/=/g, ''));
      if (target) target.classList.add("selected");
      setActiveInput("target-pwd");
      document.getElementById("target-pwd").focus();
    }

    async function checkStatus() {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        currentTargetUrl = data.target_url || currentTargetUrl;
        document.getElementById("target-url").value = currentTargetUrl;

        const badge = document.getElementById("status-badge");
        const dot = document.getElementById("status-dot");
        const text = document.getElementById("status-text");

        if (data.connected) {
          badge.className = "status-badge status-online";
          dot.className = "dot dot-green";
          text.innerText = "ONLINE // " + (data.ssid || "CONNECTED");
          
          document.getElementById("connected-info").innerText = 
            "SSID: " + data.ssid + " // IP: " + data.ip;
          
          document.getElementById("disconnected-view").style.display = "none";
          document.getElementById("connected-view").style.display = "flex";

          startRedirectCountdown();
        } else {
          badge.className = "status-badge status-offline";
          dot.className = "dot dot-red";
          text.innerText = "OFFLINE // NO WI-FI";

          document.getElementById("connected-view").style.display = "none";
          document.getElementById("disconnected-view").style.display = "flex";

          scanNetworks();
        }
      } catch (e) {
        console.error("Status error", e);
      }
    }

    function startRedirectCountdown() {
      if (redirectTimer) return;
      let progress = 0;
      const bar = document.getElementById("progress-bar");
      const cd = document.getElementById("countdown");
      
      progressTimer = setInterval(() => {
        progress += 5;
        if (bar) bar.style.width = progress + "%";
        if (cd) cd.innerText = Math.max(0, Math.ceil((100 - progress) / 50));
      }, 100);

      redirectTimer = setTimeout(() => {
        redirectToApp();
      }, 2000);
    }

    function forceConfigureWifi() {
      if (redirectTimer) clearTimeout(redirectTimer);
      if (progressTimer) clearInterval(progressTimer);
      redirectTimer = null;
      document.getElementById("connected-view").style.display = "none";
      document.getElementById("disconnected-view").style.display = "flex";
      scanNetworks();
    }

    function redirectToApp() {
      window.location.href = currentTargetUrl;
    }

    async function scanNetworks() {
      const listEl = document.getElementById("network-list");
      listEl.innerHTML = '<div style="font-family: monospace; font-size: 11px; color: #00e5ff; padding: 10px; text-align: center;">Scanning Wi-Fi channels...</div>';
      
      try {
        const res = await fetch("/api/scan");
        const list = await res.json();
        listEl.innerHTML = "";

        if (list.length === 0) {
          listEl.innerHTML = '<div style="font-family: monospace; font-size: 11px; color: #64748b; padding: 10px; text-align: center;">No networks detected. Click scan to retry.</div>';
          return;
        }

        list.forEach(net => {
          const item = document.createElement("div");
          const safeId = "net-" + btoa(net.ssid).replace(/=/g, '');
          item.id = safeId;
          item.className = "network-item";
          item.onclick = () => selectNetwork(net.ssid);

          item.innerHTML = `
            <div>
              <div class="network-name">${net.ssid}</div>
              <div class="network-info">${net.security}</div>
            </div>
            <div style="font-family: monospace; font-size: 12px; color: #00e5ff;">
              ${net.signal}%
            </div>
          `;
          listEl.appendChild(item);
        });
      } catch (e) {
        listEl.innerHTML = '<div style="color: #ff1744; font-size: 11px; padding: 8px;">Scan error. Retry.</div>';
      }
    }

    async function connectWifi() {
      const ssid = document.getElementById("target-ssid").value.trim();
      const pwd = document.getElementById("target-pwd").value;
      const url = document.getElementById("target-url").value.trim();
      const btn = document.getElementById("btn-connect");

      if (!ssid) {
        showToast("Please select or enter an SSID.");
        return;
      }

      btn.disabled = true;
      btn.innerText = "CONNECTING...";

      try {
        const res = await fetch("/api/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ssid, password: pwd, target_url: url })
        });
        const data = await res.json();

        if (data.success) {
          showToast("Connected successfully!", false);
          setTimeout(() => {
            checkStatus();
          }, 1500);
        } else {
          showToast(data.error || "Connection failed. Check password.");
          btn.disabled = false;
          btn.innerText = "CONNECT & LAUNCH";
        }
      } catch (e) {
        showToast("Request error: " + e.message);
        btn.disabled = false;
        btn.innerText = "CONNECT & LAUNCH";
      }
    }

    window.onload = () => {
      checkStatus();
    };
  </script>
</body>
</html>
"""

class KioskHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ["/", "/index.html"]:
            body = HTML_PAGE.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif path == "/api/status":
            self._send_json(get_network_status())
        elif path == "/api/scan":
            self._send_json(scan_wifi_networks())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        
        try:
            req_data = json.loads(post_body)
        except Exception:
            req_data = {}

        if path == "/api/connect":
            ssid = req_data.get("ssid", "")
            pwd = req_data.get("password", "")
            target_url = req_data.get("target_url")
            if target_url:
                save_target_url(target_url)

            res = connect_to_wifi(ssid, pwd)
            self._send_json(res)
        elif path == "/api/target":
            target_url = req_data.get("target_url")
            if target_url:
                save_target_url(target_url)
            self._send_json({"success": True, "target_url": load_target_url()})
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silence verbose request logs
        return

def run_server():
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, KioskHandler)
    print(f"[*] ASTRA Wi-Fi Boot Portal listening on http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].startswith("http"):
        save_target_url(sys.argv[1])
    run_server()
