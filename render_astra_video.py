import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

WIDTH = 1920
HEIGHT = 1080
FPS = 24

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PHOTO_DIR = os.path.join(BASE_DIR, 'frontend', 'public', 'astra_photos')
OUTPUT_DIR = os.path.join(BASE_DIR, 'generated_videos')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load base photos
p1 = Image.open(os.path.join(PHOTO_DIR, 'astra_real_1.jpg')).convert('RGB')
p2 = Image.open(os.path.join(PHOTO_DIR, 'astra_real_2.jpg')).convert('RGB')
p3 = Image.open(os.path.join(PHOTO_DIR, 'astra_real_3.jpg')).convert('RGB')

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

font_title = get_font(50, bold=True)
font_sub = get_font(32, bold=True)
font_hud = get_font(24, bold=True)
font_mono = get_font(20, bold=False)
font_small = get_font(16, bold=False)

def apply_cinematic_grade(img, crop_box, target_w=WIDTH, target_h=HEIGHT):
    cropped = img.crop(crop_box).resize((target_w, target_h), Image.Resampling.LANCZOS)
    arr = np.array(cropped).astype(np.float32)
    
    y, x = np.ogrid[:target_h, :target_w]
    cx, cy = target_w / 2, target_h / 2
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    max_r = np.sqrt(cx**2 + cy**2)
    vignette = 1.0 - 0.45 * (r / max_r)**1.8
    vignette = np.clip(vignette, 0.4, 1.0)[:, :, np.newaxis]
    
    arr = arr * vignette * 0.85
    arr[:, :, 0] *= 0.90
    arr[:, :, 1] *= 0.98
    arr[:, :, 2] *= 1.08
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def render_clip_4_response():
    output_path = os.path.join(OUTPUT_DIR, "ASTRA_Clip4_Autonomous_Response_10s.mp4")
    total_frames = 10 * FPS # 240 frames
    writer = imageio.get_writer(output_path, fps=FPS, codec='libx264', quality=8, pixelformat='yuv420p', macro_block_size=1)

    print(f"[+] Rendering {total_frames} frames for 10-second Autonomous Response Clip...")

    for f in range(total_frames):
        t = f / FPS
        # Camera choreography on real physical ASTRA device photos
        if t < 2.5:
            prog = t / 2.5
            w_orig, h_orig = p2.size
            zoom = 1.0 + 0.15 * prog
            cw, ch = int(w_orig / zoom), int(h_orig / zoom)
            cx, cy = int(w_orig * 0.5), int(h_orig * 0.55)
            box = (cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2)
            frame = apply_cinematic_grade(p2, box)
        elif t < 5.5:
            prog = (t - 2.5) / 3.0
            w_orig, h_orig = p3.size
            zoom = 1.08 + 0.12 * prog
            cw, ch = int(w_orig / zoom), int(h_orig / zoom)
            cx = int(w_orig * (0.5 + 0.08 * prog))
            cy = int(h_orig * 0.48)
            box = (cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2)
            frame = apply_cinematic_grade(p3, box)
        elif t < 8.0:
            prog = (t - 5.5) / 2.5
            w_orig, h_orig = p1.size
            zoom = 1.15 - 0.08 * prog
            cw, ch = int(w_orig / zoom), int(h_orig / zoom)
            cx = int(w_orig * (0.45 + 0.1 * prog))
            cy = int(h_orig * 0.52)
            box = (cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2)
            frame = apply_cinematic_grade(p1, box)
        else:
            prog = (t - 8.0) / 2.0
            w_orig, h_orig = p2.size
            zoom = 1.05 + 0.05 * prog
            cw, ch = int(w_orig / zoom), int(h_orig / zoom)
            cx = int(w_orig * 0.5)
            cy = int(h_orig * 0.5)
            box = (cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2)
            frame = apply_cinematic_grade(p2, box)

        draw = ImageDraw.Draw(frame, "RGBA")

        # Top Banner
        draw.rectangle([(0, 0), (WIDTH, 90)], fill=(0, 0, 0, 190))
        draw.line([(0, 90), (WIDTH, 90)], fill=(6, 182, 212, 160), width=2)
        draw.text((60, 24), "AIZEN • ASTRA AUTONOMOUS CYBER DEFENSE", fill=(255, 255, 255, 240), font=font_sub)
        timecode_str = f"TIMECODE: 00:0{int(t):01d}:{int((t % 1)*100):02d} | 24 FPS"
        draw.text((WIDTH - 420, 32), timecode_str, fill=(6, 182, 212, 220), font=font_mono)

        # Pulse indicator
        pulse_alpha = int(128 + 127 * math.sin(f * 0.4))
        draw.ellipse([(WIDTH - 450, 36), (WIDTH - 434, 52)], fill=(239, 68, 68, pulse_alpha))

        # Bottom Banner
        draw.rectangle([(0, HEIGHT - 80), (WIDTH, HEIGHT)], fill=(0, 0, 0, 200))
        draw.line([(0, HEIGHT - 80), (WIDTH, HEIGHT - 80)], fill=(255, 255, 255, 40), width=1)
        draw.text((60, HEIGHT - 55), "HARDWARE: REAL ASTRA 4WD CYBER ROVER • AUTONOMOUS EDR HEURISTICS", fill=(161, 161, 170, 200), font=font_mono)
        
        # Live Progress bar
        bar_w = int((t / 10.0) * (WIDTH - 120))
        draw.rectangle([(60, HEIGHT - 16), (60 + bar_w, HEIGHT - 10)], fill=(6, 182, 212, 240))

        # Sequence Overlay
        if t < 2.0:
            card_w, card_h = 760, 140
            cx, cy = WIDTH // 2, HEIGHT // 2 - 40
            draw.rectangle([(cx - card_w//2, cy - card_h//2), (cx + card_w//2, cy + card_h//2)], fill=(0, 0, 0, 220), outline=(6, 182, 212, 200), width=3)
            draw.text((cx - 320, cy - 40), "# AUTONOMOUS RESPONSE", fill=(6, 182, 212, 255), font=font_title)
            draw.text((cx - 240, cy + 20), "THREAT CONFIRMED • PLAYBOOK INITIATED", fill=(255, 255, 255, 200), font=font_hud)

        elif t < 4.2:
            box_x, box_y = 80, 160
            box_outline = (239, 68, 68, 220) if t < 3.2 else (16, 185, 129, 220)
            draw.rectangle([(box_x, box_y), (box_x + 650, box_y + 260)], fill=(0, 0, 0, 210), outline=box_outline, width=2)
            draw.text((box_x + 30, box_y + 25), "RESPONSE 01 / 04", fill=(161, 161, 170, 220), font=font_small)
            draw.text((box_x + 30, box_y + 55), "ISOLATING ENDPOINT", fill=(255, 255, 255, 255), font=font_sub)
            draw.text((box_x + 30, box_y + 110), "Target: Workstation-01 (192.168.1.104)", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((box_x + 30, box_y + 145), "Action: Network Interface Card Disabled", fill=(212, 212, 216, 200), font=font_mono)
            
            status_text = "ISOLATING TRAFFIC..." if t < 3.2 else "ISOLATION COMPLETE ✓"
            status_color = (239, 68, 68, 255) if t < 3.2 else (16, 185, 129, 255)
            draw.text((box_x + 30, box_y + 195), status_text, fill=status_color, font=font_hud)

        elif t < 6.4:
            box_x, box_y = 80, 160
            box_outline = (245, 158, 11, 220) if t < 5.2 else (16, 185, 129, 220)
            draw.rectangle([(box_x, box_y), (box_x + 680, box_y + 260)], fill=(0, 0, 0, 210), outline=box_outline, width=2)
            draw.text((box_x + 30, box_y + 25), "RESPONSE 02 / 04", fill=(161, 161, 170, 220), font=font_small)
            draw.text((box_x + 30, box_y + 55), "BLOCKING LATERAL MOVEMENT", fill=(255, 255, 255, 255), font=font_sub)
            draw.text((box_x + 30, box_y + 110), "Threat Vector: SMB/RPC Port 445 Propagation", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((box_x + 30, box_y + 145), "Action: Zero-Trust Micro-Segmentation Applied", fill=(212, 212, 216, 200), font=font_mono)
            
            status_text = "SEVERING LATERAL BRIDGES..." if t < 5.2 else "LATERAL MOVEMENT BLOCKED ✓"
            status_color = (245, 158, 11, 255) if t < 5.2 else (16, 185, 129, 255)
            draw.text((box_x + 30, box_y + 195), status_text, fill=status_color, font=font_hud)

        elif t < 8.4:
            box_x, box_y = 80, 160
            box_outline = (239, 68, 68, 220) if t < 7.3 else (16, 185, 129, 220)
            draw.rectangle([(box_x, box_y), (box_x + 720, box_y + 260)], fill=(0, 0, 0, 210), outline=box_outline, width=2)
            draw.text((box_x + 30, box_y + 25), "RESPONSE 03 / 04", fill=(161, 161, 170, 220), font=font_small)
            draw.text((box_x + 30, box_y + 55), "TERMINATING MALICIOUS PROCESS", fill=(255, 255, 255, 255), font=font_sub)
            draw.text((box_x + 30, box_y + 110), "Malware Signature: Trojan:Win32/LockBit Heuristic", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((box_x + 30, box_y + 145), "Action: Force Kill Process ID 4821 (svchost_suspicious)", fill=(212, 212, 216, 200), font=font_mono)
            
            status_text = "TERMINATING THREAD..." if t < 7.3 else "MALICIOUS PROCESS TERMINATED ✓"
            status_color = (239, 68, 68, 255) if t < 7.3 else (16, 185, 129, 255)
            draw.text((box_x + 30, box_y + 195), status_text, fill=status_color, font=font_hud)

        else:
            box_x, box_y = 80, 160
            draw.rectangle([(box_x, box_y), (box_x + 750, box_y + 270)], fill=(0, 0, 0, 220), outline=(16, 185, 129, 240), width=2)
            draw.text((box_x + 30, box_y + 25), "RESPONSE 04 / 04 • FINAL CONTAINMENT", fill=(161, 161, 170, 220), font=font_small)
            draw.text((box_x + 30, box_y + 55), "PROTECTING REMAINING ENDPOINTS", fill=(255, 255, 255, 255), font=font_sub)
            draw.text((box_x + 30, box_y + 110), "Fleet Status: 8/8 Host Nodes Synchronized", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((box_x + 30, box_y + 145), "Rover Position: Deployed at Incident Origin", fill=(212, 212, 216, 200), font=font_mono)
            draw.text((box_x + 30, box_y + 195), "ENDPOINTS PROTECTED ✓  |  SYSTEM SECURE", fill=(16, 185, 129, 255), font=font_hud)

        # Side Telemetry Widget
        rad_x, rad_y = WIDTH - 260, 160
        draw.rectangle([(rad_x, rad_y), (rad_x + 180, rad_y + 220)], fill=(0, 0, 0, 190), outline=(6, 182, 212, 120), width=1)
        draw.text((rad_x + 15, rad_y + 12), "ASTRA SENSORS", fill=(6, 182, 212, 220), font=font_small)
        draw.ellipse([(rad_x + 30, rad_y + 45), (rad_x + 150, rad_y + 165)], outline=(6, 182, 212, 100), width=1)
        draw.ellipse([(rad_x + 60, rad_y + 75), (rad_x + 120, rad_y + 135)], outline=(6, 182, 212, 80), width=1)
        
        angle = f * 0.15
        end_x = rad_x + 90 + int(60 * math.cos(angle))
        end_y = rad_y + 105 + int(60 * math.sin(angle))
        draw.line([(rad_x + 90, rad_y + 105), (end_x, end_y)], fill=(6, 182, 212, 200), width=2)
        draw.text((rad_x + 25, rad_y + 185), "RADAR: ACTIVE", fill=(16, 185, 129, 220), font=font_small)

        writer.append_data(np.array(frame))

    writer.close()
    print(f"[✓] Successfully generated MP4 video at: {output_path} (Size: {os.path.getsize(output_path)} bytes)")
    return output_path

if __name__ == '__main__':
    render_clip_4_response()
