import os
from PIL import Image, ImageDraw

def create_rounded_image(im):
    mask = Image.new('L', im.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, im.size[0], im.size[1]), fill=255)
    rounded = Image.new('RGBA', im.size, (0, 0, 0, 0))
    rounded.paste(im, (0, 0), mask=mask)
    return rounded

def make_app_icon(logo_path, size, bg_color=(0, 0, 0, 255)):
    base = Image.new('RGBA', (size, size), bg_color)
    logo = Image.open(logo_path).convert('RGBA')
    
    # Scale logo with padding (e.g. 80% of container)
    pad = int(size * 0.1)
    target_inner_w = size - (pad * 2)
    target_inner_h = size - (pad * 2)
    
    logo.thumbnail((target_inner_w, target_inner_h), Image.Resampling.LANCZOS)
    
    # Center logo
    x = (size - logo.width) // 2
    y = (size - logo.height) // 2
    base.paste(logo, (x, y), mask=logo)
    return base

def make_splash(logo_path, width, height, bg_color=(0, 0, 0, 255)):
    base = Image.new('RGBA', (width, height), bg_color)
    logo = Image.open(logo_path).convert('RGBA')
    
    # Scale logo to ~50% of min dimension
    min_dim = min(width, height)
    max_logo_w = int(min_dim * 0.6)
    max_logo_h = int(min_dim * 0.6)
    
    logo.thumbnail((max_logo_w, max_logo_h), Image.Resampling.LANCZOS)
    
    x = (width - logo.width) // 2
    y = (height - logo.height) // 2
    base.paste(logo, (x, y), mask=logo)
    return base

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_path = os.path.join(root, 'assets', 'images', 'logo.png')
    
    if not os.path.exists(logo_path):
        print(f"Error: logo no encontrado en {logo_path}")
        return
        
    print(f"Generando assets desde {logo_path}...")
    
    # 1. iOS Assets
    ios_icon_dir = os.path.join(root, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset')
    if os.path.exists(ios_icon_dir):
        icon_1024 = make_app_icon(logo_path, 1024)
        icon_1024.convert('RGB').save(os.path.join(ios_icon_dir, 'AppIcon-512@2x.png'), 'PNG')
        print("  -> Icono iOS 1024x1024 generado")
        
    ios_splash_dir = os.path.join(root, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset')
    if os.path.exists(ios_splash_dir):
        splash_ios = make_splash(logo_path, 2732, 2732)
        splash_ios.convert('RGB').save(os.path.join(ios_splash_dir, 'splash-2732x2732.png'), 'PNG')
        splash_ios.convert('RGB').save(os.path.join(ios_splash_dir, 'splash-2732x2732-1.png'), 'PNG')
        splash_ios.convert('RGB').save(os.path.join(ios_splash_dir, 'splash-2732x2732-2.png'), 'PNG')
        print("  -> Splash screens iOS generados")
        
    # 2. Android Assets
    android_res = os.path.join(root, 'android', 'app', 'src', 'main', 'res')
    if os.path.exists(android_res):
        mipmap_sizes = {
            'mipmap-mdpi': 48,
            'mipmap-hdpi': 72,
            'mipmap-xhdpi': 96,
            'mipmap-xxhdpi': 144,
            'mipmap-xxxhdpi': 192
        }
        for folder, sz in mipmap_sizes.items():
            fpath = os.path.join(android_res, folder)
            os.makedirs(fpath, exist_ok=True)
            
            icon = make_app_icon(logo_path, sz)
            icon.save(os.path.join(fpath, 'ic_launcher.png'), 'PNG')
            
            round_icon = create_rounded_image(icon)
            round_icon.save(os.path.join(fpath, 'ic_launcher_round.png'), 'PNG')
            
            # Foreground for adaptive icon
            fg = Image.new('RGBA', (sz, sz), (0, 0, 0, 0))
            logo = Image.open(logo_path).convert('RGBA')
            inner = int(sz * 0.72)
            logo.thumbnail((inner, inner), Image.Resampling.LANCZOS)
            x = (sz - logo.width) // 2
            y = (sz - logo.height) // 2
            fg.paste(logo, (x, y), mask=logo)
            fg.save(os.path.join(fpath, 'ic_launcher_foreground.png'), 'PNG')
            
        print("  -> Iconos Android (mdpi -> xxxhdpi) generados")
        
        # Splash screens Android (drawables)
        port_resolutions = {
            'drawable-port-mdpi': (320, 480),
            'drawable-port-hdpi': (480, 800),
            'drawable-port-xhdpi': (720, 1280),
            'drawable-port-xxhdpi': (960, 1600),
            'drawable-port-xxxhdpi': (1280, 1920),
            'drawable': (480, 800)
        }
        for folder, (w, h) in port_resolutions.items():
            fpath = os.path.join(android_res, folder)
            os.makedirs(fpath, exist_ok=True)
            splash_img = make_splash(logo_path, w, h)
            splash_img.convert('RGB').save(os.path.join(fpath, 'splash.png'), 'PNG')
            
        land_resolutions = {
            'drawable-land-mdpi': (480, 320),
            'drawable-land-hdpi': (800, 480),
            'drawable-land-xhdpi': (1280, 720),
            'drawable-land-xxhdpi': (1600, 960),
            'drawable-land-xxxhdpi': (1920, 1280)
        }
        for folder, (w, h) in land_resolutions.items():
            fpath = os.path.join(android_res, folder)
            os.makedirs(fpath, exist_ok=True)
            splash_img = make_splash(logo_path, w, h)
            splash_img.convert('RGB').save(os.path.join(fpath, 'splash.png'), 'PNG')
            
        print("  -> Splash screens Android generados en drawable-*")

    print(">> Todos los recursos nativos se han generado con exito!")

if __name__ == '__main__':
    main()
