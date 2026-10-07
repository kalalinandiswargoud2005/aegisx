import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

BASE_DIR = r"c:\Users\goudk\OneDrive\Desktop\hod"
INPUT_VIDEO = os.path.join(BASE_DIR, "gemini_generated_video_ca59c427.mp4")
OUTPUT_MASTER = os.path.join(BASE_DIR, "ASTRA_Master_Extended_Video.mp4")
OUTPUT_CLIP4 = os.path.join(BASE_DIR, "ASTRA_Clip4_Autonomous_Response.mp4")
LAST_FRAME_PATH = os.path.join(BASE_DIR, "4-2", "last_frame_clip3.jpg")
PHOTO_DIR = os.path.join(BASE_DIR, "4-2", "frontend", "public", "astra_photos")

WIDTH = 1280
HEIGHT = 720
FPS = 24.0

# Fonts
def get_font(size, bold=False):
    font_paths = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\consola.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return ImageFont.load_default()

font_title = get_font(38, bold=True)
font_sub = get_font(24, bold=True)
font_hud = get_font(20, bold=True)
font_mono = get_font(15, bold=False)
font_small = get_font(13, bold=False)

# Load reference assets
last_frame_img = Image.open(LAST_FRAME_PATH).convert('RGB') if os.path.exists(LAST_FRAME_PATH) else None
p1 = Image.open(os.path.join(PHOTO_DIR, 'astra_real_1.jpg')).convert('RGB')
p2 = Image.open(os.path.join(PHOTO_DIR, 'astra_real_2.jpg')).convert('RGB')
p3 = Image.open(os.path.join(PHOTO_DIR, 'astra_real_3.jpg')).convert('RGB')

def grade_and_crop(img, crop_box, target_w=WIDTH, target_h=HEIGHT):
    cropped = img.crop(crop_box).resize((target_w, target_h), Image.Resampling.LANCZOS)
    arr = np.array(cropped).astype(np.float32)
    y, x = np.ogrid[:target_h, :target_w]
    cx, cy = target_w / 2, target_h / 2
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    max_r = np.sqrt(cx**2 + cy**2)
    vignette = 1.0 - 0.35 * (r / max_r)**1.8
    vignette = np.clip(vignette, 0.45, 1.0)[:, :, np.newaxis]
    arr = arr * vignette * 0.90
    arr[:, :, 0] *= 0.92
    arr[:, :, 1] *= 0.98
    arr[:, :, 2] *= 1.06
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def generate_clip4_frames():
    clip_frames = []
    total_frames = int(10 * FPS) # 240 frames

    for f in range(total_frames):
        t = f / FPS
        
        # Camera Pan & Zoom based on Real Hardware
        if t < 1.5 and last_frame_img is not None:
            # Smooth transition from Clip 3 last frame
            prog = t / 1.5
            w, h = last_frame_img.size
            zoom = 1.0 + 0.08 * prog
            cw, ch = int(w / zoom), int(h / zoom)
            cx, cy = int(w * 0.5), int(h * 0.5)
            box = (cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2)
            frame = grade_and_crop(last_frame_img, box)
        elif t < 3.5:
            # RESPONSE 01: Focus on Rover & Isolation
            prog = (t - 1.5) / 2.0
            w, h = p2.size
            zoom = 1.05 + 0.10 * prog
            cw, ch = int(w / zoom), int(h / zoom)
            cx, cy = int(w * 0.5), int(h * 0.55)
            box = (cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2)
            frame = grade_and_crop(p2, box)
        elif t < 6.0:
            # RESPONSE 02: Threat Paths & Lateral movement
            prog = (t - 3.5) / 2.5
            w, h = p3.size
            zoom = 1.10 + 0.08 * prog
            cw, ch = int(w / zoom), int(h / zoom)
            cx = int(w * (0.50 + 0.06 * prog))
            cy = int(h * 0.48)
            box = (cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2)
            frame = grade_and_crop(p3, box)
        elif t < 8.0:
            # RESPONSE 03: Process termination
            prog = (t - 6.0) / 2.0
            w, h = p1.size
            zoom = 1.12 - 0.05 * prog
            cw, ch = int(w / zoom), int(h / zoom)
            cx = int(w * 0.48)
            cy = int(h * 0.52)
            box = (cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2)
            frame = grade_and_crop(p1, box)
        else:
            # RESPONSE 04 & END FRAME: Protected fleet and Rover Guard
            prog = (t - 8.0) / 2.0
            w, h = p2.size
            zoom = 1.06 + 0.04 * prog
            cw, ch = int(w / zoom), int(h / zoom)
            cx, cy = int(w * 0.5), int(h * 0.5)
            box = (cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2)
            frame = grade_and_crop(p2, box)

        draw = ImageDraw.Draw(frame, "RGBA")

        # Top HUD Bar
        draw.rectangle([(0, 0), (WIDTH, 65)], fill=(0, 0, 0, 190))
        draw.line([(0, 65), (WIDTH, 65)], fill=(6, 182, 212, 160), width=2)
        draw.text((40, 18), "AIZEN • ASTRA AUTONOMOUS CYBER DEFENSE", fill=(255, 255, 255, 240), font=font_sub)
        timecode = f"T+ 00:{int(40 + t):02d}:{int((t % 1)*100):02d}"
        draw.text((WIDTH - 280, 22), timecode, fill=(6, 182, 212, 220), font=font_mono)

        # Pulse indicator
        pulse_alpha = int(128 + 127 * math.sin(f * 0.45))
        draw.ellipse([(WIDTH - 305, 26), (WIDTH - 291, 40)], fill=(239, 68, 68, pulse_alpha))

        # Bottom Bar
        draw.rectangle([(0, HEIGHT - 55), (WIDTH, HEIGHT)], fill=(0, 0, 0, 210))
        draw.line([(0, HEIGHT - 55), (WIDTH, HEIGHT - 55)], fill=(255, 255, 255, 40), width=1)
        draw.text((40, HEIGHT - 38), "ASTRA HARDWARE ROVER • AUTONOMOUS EDR ACTIVE", fill=(161, 161, 170, 200), font=font_small)
        
        # Scrubber bar
        bar_w = int((t / 10.0) * (WIDTH - 80))
        draw.rectangle([(40, HEIGHT - 12), (40 + bar_w, HEIGHT - 7)], fill=(6, 182, 212, 240))

        # Dynamic Response Stage Cards
        if t < 1.8:
            # # AUTONOMOUS RESPONSE
            card_w, card_h = 560, 100
            cx, cy = WIDTH // 2, HEIGHT // 2 - 30
            draw.rectangle([(cx - card_w//2, cy - card_h//2), (cx + card_w//2, cy + card_h//2)], fill=(0, 0, 0, 220), outline=(6, 182, 212, 220), width=2)
            draw.text((cx - 240, cy - 30), "# AUTONOMOUS RESPONSE", fill=(6, 182, 212, 255), font=font_title)
            draw.text((cx - 180, cy + 15), "COUNTER-PLAYBOOK SYNTHESIZED • SURGICAL EXECUTION", fill=(255, 255, 255, 200), font=font_small)

        elif t < 3.8:
            # RESPONSE 01: ISOLATING ENDPOINT
            bx, by = 50, 110
            is_done = t >= 2.8
            outline_col = (16, 185, 129, 220) if is_done else (239, 68, 68, 220)
            draw.rectangle([(bx, by), (bx + 500, by + 190)], fill=(0, 0, 0, 210), outline=outline_col, width=2)
            draw.text((bx + 20, by + 16), "RESPONSE 01", fill=(161, 161, 170, 220), font=font_small)
            draw.text((bx + 20, by + 40), "ISOLATING ENDPOINT", fill=(255, 255, 255, 255), font=font_sub)
            draw.text((bx + 20, by + 80), "Compromised Host: 192.168.1.104", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((bx + 20, by + 105), "Network State: Physical & Logical Severance", fill=(212, 212, 216, 200), font=font_mono)
            
            st_text = "ISOLATION COMPLETE ✓" if is_done else "ISOLATING ENDPOINT..."
            st_col = (16, 185, 129, 255) if is_done else (239, 68, 68, 255)
            draw.text((bx + 20, by + 145), st_text, fill=st_col, font=font_hud)

        elif t < 5.8:
            # RESPONSE 02: BLOCKING LATERAL MOVEMENT
            bx, by = 50, 110
            is_done = t >= 4.8
            outline_col = (16, 185, 129, 220) if is_done else (245, 158, 11, 220)
            draw.rectangle([(bx, by), (bx + 520, by + 190)], fill=(0, 0, 0, 210), outline=outline_col, width=2)
            draw.text((bx + 20, by + 16), "RESPONSE 02", fill=(161, 161, 170, 220), font=font_small)
            draw.text((bx + 20, by + 40), "BLOCKING LATERAL MOVEMENT", fill=(255, 255, 255, 255), font=font_sub)
            draw.text((bx + 20, by + 80), "Threat Vector: SMB/RPC Propagation Paths", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((bx + 20, by + 105), "Action: Inter-Device Communication Blocked", fill=(212, 212, 216, 200), font=font_mono)
            
            st_text = "LATERAL MOVEMENT BLOCKED ✓" if is_done else "SEVERING THREAT PATHS..."
            st_col = (16, 185, 129, 255) if is_done else (245, 158, 11, 255)
            draw.text((bx + 20, by + 145), st_text, fill=st_col, font=font_hud)

        elif t < 7.8:
            # RESPONSE 03: TERMINATING MALICIOUS PROCESS
            bx, by = 50, 110
            is_done = t >= 6.8
            outline_col = (16, 185, 129, 220) if is_done else (239, 68, 68, 220)
            draw.rectangle([(bx, by), (bx + 550, by + 190)], fill=(0, 0, 0, 210), outline=outline_col, width=2)
            draw.text((bx + 20, by + 16), "RESPONSE 03", fill=(161, 161, 170, 220), font=font_small)
            draw.text((bx + 20, by + 40), "TERMINATING MALICIOUS PROCESS", fill=(255, 255, 255, 255), font=font_sub)
            draw.text((bx + 20, by + 80), "Process: PID 4821 (svchost_suspicious.exe)", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((bx + 20, by + 105), "Action: Kernel-Level Memory & Thread Kill", fill=(212, 212, 216, 200), font=font_mono)
            
            st_text = "MALICIOUS PROCESS TERMINATED ✓" if is_done else "TERMINATING PROCESS THREADS..."
            st_col = (16, 185, 129, 255) if is_done else (239, 68, 68, 255)
            draw.text((bx + 20, by + 145), st_text, fill=st_col, font=font_hud)

        else:
            # RESPONSE 04 & END FRAME: PROTECTING REMAINING ENDPOINTS
            bx, by = 50, 110
            draw.rectangle([(bx, by), (bx + 560, by + 200)], fill=(0, 0, 0, 220), outline=(16, 185, 129, 240), width=2)
            draw.text((bx + 20, by + 16), "RESPONSE 04 • FINAL CONTAINMENT", fill=(161, 161, 170, 220), font=font_small)
            draw.text((bx + 20, by + 40), "PROTECTING REMAINING ENDPOINTS", fill=(255, 255, 255, 255), font=font_sub)
            draw.text((bx + 20, by + 80), "Compromised Host: Quarantined & Contained", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((bx + 20, by + 105), "Fleet Network: 100% Protected & Online", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((bx + 20, by + 148), "ENDPOINTS PROTECTED ✓", fill=(16, 185, 129, 255), font=font_hud)

        # Right-side Mini Radar / Fleet Map
        rad_x, rad_y = WIDTH - 220, 100
        draw.rectangle([(rad_x, rad_y), (rad_x + 180, rad_y + 190)], fill=(0, 0, 0, 190), outline=(6, 182, 212, 120), width=1)
        draw.text((rad_x + 15, rad_y + 10), "FLEET TOPOLOGY", fill=(6, 182, 212, 220), font=font_small)
        
        # Laptops status dots
        # Center host (isolated)
        draw.ellipse([(rad_x + 80, rad_y + 75), (rad_x + 100, rad_y + 95)], fill=(239, 68, 68, 240) if t < 3.8 else (245, 158, 11, 240))
        # Adjacent laptops (protected)
        coords = [(40, 50), (140, 50), (40, 120), (140, 120)]
        for cx, cy in coords:
            col = (16, 185, 129, 240) if t >= 7.8 else (6, 182, 212, 180)
            draw.ellipse([(rad_x + cx, rad_y + cy), (rad_x + cx + 14, rad_y + cy + 14)], fill=col)
            draw.line([(rad_x + 90, rad_y + 85), (rad_x + cx + 7, rad_y + cy + 7)], fill=(255, 255, 255, 30), width=1)

        draw.text((rad_x + 20, rad_y + 160), "FLEET: PROTECTED" if t >= 7.8 else "MONITORING...", fill=(16, 185, 129, 240) if t >= 7.8 else (6, 182, 212, 200), font=font_small)

        clip_frames.append(np.array(frame))

    return clip_frames

def build_all():
    print("[1/3] Generating Clip 4 Autonomous Response frames...")
    clip4_frames = generate_clip4_frames()

    print("[2/3] Writing standalone Clip 4 MP4 video...")
    writer_clip4 = imageio.get_writer(OUTPUT_CLIP4, fps=FPS, codec='libx264', quality=8, pixelformat='yuv420p', macro_block_size=1)
    for f in clip4_frames:
        writer_clip4.append_data(f)
    writer_clip4.close()
    print(f"  -> Generated: {OUTPUT_CLIP4} ({os.path.getsize(OUTPUT_CLIP4)} bytes)")

    print("[3/3] Merging original 40s Gemini video with Clip 4 into Master Video...")
    writer_master = imageio.get_writer(OUTPUT_MASTER, fps=FPS, codec='libx264', quality=8, pixelformat='yuv420p', macro_block_size=1)
    
    # Read original video frames
    reader = imageio.get_reader(INPUT_VIDEO, 'ffmpeg')
    count = 0
    for frame in reader:
        writer_master.append_data(frame)
        count += 1
    reader.close()
    print(f"  -> Appended {count} frames from original video ({count/FPS:.1f}s)")

    # Append new Clip 4 frames
    for frame in clip4_frames:
        writer_master.append_data(frame)
    writer_master.close()
    print(f"  -> Appended {len(clip4_frames)} frames from Clip 4 ({len(clip4_frames)/FPS:.1f}s)")
    print(f"  -> Master Video Saved: {OUTPUT_MASTER} ({os.path.getsize(OUTPUT_MASTER)} bytes)")

if __name__ == '__main__':
    build_all()
