from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Load the original logo
logo_img = Image.open('public/Legaliq.jpg').convert('RGBA')

# Resize logo to 120px to match homepage
logo_size = 120
logo_resized = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

# Remove ALL background and change logo colors to dark blue
logo_data = np.array(logo_resized)
r, g, b, a = logo_data.T

# Remove white and light grey backgrounds
background_areas = (r > 200) & (g > 200) & (b > 200)

# Change logo colors to dark blue (#1e3a8a = 30, 58, 138)
# Keep non-background pixels but change their color to dark blue
logo_pixels = ~background_areas.T

# Set all non-background pixels to dark blue
logo_data[logo_pixels, 0] = 30   # R
logo_data[logo_pixels, 1] = 58   # G
logo_data[logo_pixels, 2] = 138  # B
logo_data[logo_pixels, 3] = 255  # Fully opaque

# Make background transparent
logo_data[background_areas.T, 3] = 0

# Create final logo with transparent background and dark blue color
logo_blue = Image.fromarray(logo_data)

# Create a new image with space for logo + text
# Width: 120 (logo) + 15 (gap) + 150 (text) = 285
# Height: 120 (to match logo)
combined_width = 350
combined_height = 120
combined_img = Image.new('RGBA', (combined_width, combined_height), (0, 0, 0, 0))

# Paste the logo on the left
combined_img.paste(logo_blue, (0, 0), logo_blue)

# Add "LegalIQ" text (smaller - 16px to compensate for 150px scaling)
draw = ImageDraw.Draw(combined_img)

# Try to use a bold font - 16px = approximately 21pt
try:
    # Try common system fonts
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 19)
except:
    try:
        font = ImageFont.truetype("/Library/Fonts/Arial Bold.ttf", 19)
    except:
        try:
            font = ImageFont.truetype("Arial", 19)
        except:
            font = ImageFont.load_default()

# Dark blue color (same as logo and homepage CSS)
text_color = (30, 58, 138, 255)  # #1e3a8a in RGBA

# Draw text next to logo (closer - moved left)
text = "LegalIQ"
text_x = 128  # 120 (logo width) + 8 (smaller gap)
text_y = 50   # Center vertically

draw.text((text_x, text_y), text, font=font, fill=text_color)

# Save the combined image
combined_img.save('public/Legaliq-login.png', 'PNG')
print("✅ Created logo for login/register: public/Legaliq-login.png")
print(f"   Size: {combined_width}x{combined_height}px")
print(f"   Logo: {logo_size}x{logo_size}px (dark blue #1e3a8a)")
print(f"   Font size: 32pt (24px like homepage), color: #1e3a8a")
