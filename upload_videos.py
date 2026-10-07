#!/usr/bin/env python3
# ============================================================
#  TOOLVERSE VIDEO UPLOADER v2 (one-click, sirf missing videos upload karta hai)
#  Run:  python upload_videos.py
#  Windows PC par Python 3 chahiye (python.org se free)
# ============================================================
import json, os, re, sys, getpass, http.client, urllib.request, ssl

REPO = 'imranah10/toolverse_automation'
RELEASE_TAG = 'v1.0-assets'
API = f'https://api.github.com/repos/{REPO}'

# 60 expected video keys (55 mapped + 5 extra)
REQUIRED = '''01_anti_subscription_manifesto 02_pdf_viral_studio 02_zero_upload_privacy_revolution
03_digital_shadow_exposure 03_mind_reader 04_stardust_storm 05_financial_calculators
06_qr_viral_studio 07_contract_forge 08_npm_x_ray 09_digital_shadow 10_pixelpress_compress
11_disposable_temp_mail 12_github_sponsors_finder 13_time_machine 14_speed_art_machine
15_loans_and_retirement 16_chat_reels 17_business_and_data 18_theme_studio
19_universal_clipboard 20_ai_architect_studio 21_flipbook_studio 22_living_photo
23_shopping_and_tax 24_text_symphony 25_video_player_pro 26_developer_icon_library
27_forensics_lab 28_shouldibuy 29_print_smart_pack 30_puzzle_gift 31_health_and_life
32_secret_ink 33_design_and_css 34_ai_boardroom 35_form_filler 36_filecarver_pro
37_vision_switch 38_text_fx_studio 39_link_unfurler_pro 40_css_x_ray 41_watermark_eraser
42_gitscope_pro 43_steganography_studio 44_pdf_sign_and_edit 45_ai_hd_boost
46_github_manager 47_pdf_merge_and_split 51_metadata_stripper_and_editor 52_photo_to_3d
53_color_palette_generator 54_art_converters 57_butterfly_effect_blast_graph
day8_print_smart_pack'''.split()

EXTRA = ['04_ten_second_legal_stack', '05_shouldibuy_ai_impulse_roast',
         '06_developer_swiss_army_knife', '07_solo_founder_build_story',
         '48_extract_everything']

ALL_KEYS = sorted(set(k + '.mp4' for k in REQUIRED) | set(k + '.mp4' for k in EXTRA))

def api_req(url, token=None, method='GET'):
    h = {'User-Agent': 'tv-uploader', 'Accept': 'application/vnd.github+json'}
    if token:
        h['Authorization'] = f'token {token}'
    r = urllib.request.Request(url, headers=h, method=method)
    with urllib.request.urlopen(r, timeout=30) as resp:
        return json.loads(resp.read().decode())

def make_key(folder_name):
    k = folder_name.lower()
    k = re.sub(r'[^a-z0-9_]', '_', k)
    k = re.sub(r'_+', '_', k)
    return k + '.mp4'

def tokens(s):
    return set(t for t in re.split(r'[^a-z0-9]+', s.lower()) if t)

def fuzzy_match(dir_name, missing_keys):
    dt = tokens(dir_name)
    best, best_key = 0.0, None
    for mk in missing_keys:
        mt = tokens(mk.replace('.mp4', ''))
        if not dt or not mt:
            continue
        score = len(dt & mt) / float(min(len(dt), len(mt)))
        if score > best:
            best, best_key = score, mk
    return (best_key, best) if best >= 0.6 else (None, 0.0)

def cdn_exists(key):
    url = f'https://github.com/{REPO}/releases/download/{RELEASE_TAG}/{key}'
    try:
        r = urllib.request.Request(url, headers={'Range': 'bytes=0-0', 'User-Agent': 'tv-uploader'})
        with urllib.request.urlopen(r, timeout=20) as resp:
            return resp.status in (200, 206)
    except Exception:
        return False

def stream_upload(token, release_id, key, filepath):
    """1MB chunks me upload - file memory me nahi jaati"""
    size = os.path.getsize(filepath)
    conn = http.client.HTTPSConnection('uploads.github.com', timeout=600)
    url = f'/repos/{REPO}/releases/{release_id}/assets?name={key}'
    conn.putrequest('POST', url, skip_host=True, skip_accept_encoding=True)
    conn.putheader('Authorization', f'token {token}')
    conn.putheader('User-Agent', 'tv-uploader')
    conn.putheader('Accept', 'application/vnd.github+json')
    conn.putheader('Content-Type', 'video/mp4')
    conn.putheader('Content-Length', str(size))
    conn.endheaders()
    sent = 0
    next_mark = 10 * 1024 * 1024
    with open(filepath, 'rb') as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            conn.send(chunk)
            sent += len(chunk)
            if sent >= next_mark:
                print(f'      ... {sent // (1024*1024)} MB bheja gaya')
                next_mark += 10 * 1024 * 1024
    resp = conn.getresponse()
    body = resp.read().decode()
    conn.close()
    return resp.status, body

def main():
    print('=' * 58)
    print('   TOOLVERSE VIDEO UPLOADER v2 - sirf missing videos')
    print('=' * 58)

    token = os.environ.get('GH_TOKEN', '').strip()
    if not token:
        token = getpass.getpass('GitHub token daalo (paste karo, dikhega nahi): ').strip()
    if not token:
        sys.exit('Token nahi mila. Exit.')

    # 1. verify token
    try:
        u = api_req('https://api.github.com/user', token)
        print(f'[1/5] Token OK - hello {u.get("login")}!')
    except Exception as e:
        sys.exit(f'Token galat hai ya expire hua: {e}')

    # 2. fetch release + existing assets
    try:
        rel = api_req(f'{API}/releases/tags/{RELEASE_TAG}', token)
    except Exception as e:
        sys.exit(f'Release {RELEASE_TAG} nahi mila: {e}')
    release_id = rel['id']
    existing = set(a['name'] for a in rel.get('assets', []))
    print(f'[2/5] Release mila (id {release_id}) - CDN par abhi {len(existing)} videos hain')

    missing = [k for k in ALL_KEYS if k not in existing]
    if not missing:
        print('   Sab 60 videos already uploaded hain! Kuch nahi karna.')
    else:
        print(f'   Missing: {len(missing)} videos -> inhe upload karenge')

    # 3. scan local videos
    print('[3/5] Ab videos dhoond raha hoon tumhare computer par...')
    here = os.path.dirname(os.path.abspath(__file__))
    p = input(f'   Videos kis folder me hain? (khali Enter = is script wali folder)\n   Path: ').strip().strip('"')
    root = p if p and os.path.isdir(p) else here
    if p and not os.path.isdir(p):
        print('   !! Wo folder nahi mila, is script wali folder use kar raha hoon')
    print(f'   Scan: {root}')

    found = {}          # key -> filepath
    fuzzy_skipped = []
    for dirpath, dirnames, filenames in os.walk(root):
        mp4s = [f for f in filenames if f.lower().endswith('.mp4')]
        if not mp4s:
            continue
        dir_name = os.path.basename(dirpath.rstrip(os.sep))
        key = make_key(dir_name)
        if key in missing and key not in found:
            found[key] = os.path.join(dirpath, max(mp4s, key=lambda f: os.path.getsize(os.path.join(dirpath, f))))
            continue
        if key not in ALL_KEYS:
            fk, sc = fuzzy_match(dir_name, [m for m in missing if m not in found])
            if fk:
                found[fk] = os.path.join(dirpath, max(mp4s, key=lambda f: os.path.getsize(os.path.join(dirpath, f))))
            else:
                fuzzy_skipped.append(dir_name)

    print(f'   Mile: {len(found)} / {len(missing)} missing videos')
    still_missing = [k for k in missing if k not in found]
    if fuzzy_skipped:
        print(f'   (Ye folders match nahi hue: {", ".join(fuzzy_skipped[:8])}{"..." if len(fuzzy_skipped) > 8 else ""})')

    # 4. upload
    print('[4/5] Upload shuru...')
    done, failed = 0, []
    for i, (key, fp) in enumerate(sorted(found.items()), 1):
        size_mb = os.path.getsize(fp) / (1024 * 1024)
        print(f'   ({i}/{len(found)}) {key} ({size_mb:.1f} MB)')
        try:
            status, body = stream_upload(token, release_id, key, fp)
            if status in (201, 202):
                done += 1
                print('      [OK] upload ho gaya!')
            elif status == 422:
                done += 1
                print('      [OK] pehle se tha, skip')
            else:
                failed.append((key, f'HTTP {status}: {body[:120]}'))
                print(f'      [FAIL] HTTP {status}')
        except Exception as e:
            failed.append((key, str(e)[:120]))
            print(f'      [FAIL] {e}')

    # 5. final CDN verify
    print('[5/5] Final verification (CDN check)...\n')
    ok_list, miss_list = [], []
    for k in ALL_KEYS:
        if cdn_exists(k):
            ok_list.append(k)
        else:
            miss_list.append(k)

    print('=' * 58)
    print('   FINAL REPORT')
    print('=' * 58)
    print(f'   [OK]   CDN par live: {len(ok_list)} / {len(ALL_KEYS)} videos')
    if miss_list:
        print(f'   [MISS] Abhi bhi nahi mile ({len(miss_list)}):')
        for k in miss_list:
            print(f'          - {k}')
    if failed:
        print(f'   Upload errors ({len(failed)}):')
        for k, e in failed:
            print(f'          - {k}: {e}')
    print()
    if not miss_list:
        print('   SAB 60 VIDEOS LIVE HAIN! AUTOMATION 100% READY!')
    else:
        print('   Jo [MISS] hain: un video folders ka naam check karo,')
        print('   ya wo videos dobara banao. Baki sab kaam kar chuka hai.')
    print()
    print('   IMPORTANT: Kaam poora hote hi GitHub token DELETE kar dena!')
    print('   (Settings > Developer settings > Personal access tokens > Delete)')

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\nCancel ho gaya.')
