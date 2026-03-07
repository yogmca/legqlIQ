#!/usr/bin/env python3
"""
Script to create a combined logo image with the Legaliq logo and "LegalIQ" text
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_combined_logo():
    """Create a combined logo with image and text"""
    try:
        # Open the logo image
        logo_img = Image.open("public/Legaliq.jpg")
        
        # Resize logo to desired size (75px height - much bigger)
        logo_size = 75
        aspect_ratio = logo_img.width / logo_img.height
        new_width = int(logo_size * aspect_ratio)
        logo_img = logo_img.resize((new_width, logo_size), Image.Resampling.LANCZOS)
        
        # Create a new image with enough width for logo + text
        # Estimate text width (will adjust after measuring)
        combined_width = new_width + 200  # Extra space for text
        combined_height = logo_size
        
        # Create transparent background
        combined_img = Image.new('RGBA', (combined_width, combined_height), (0, 0, 0, 0))
        
        # Paste the logo on the left, centered vertically
        if logo_img.mode != 'RGBA':
            logo_img = logo_img.convert('RGBA')
        
        # Center logo vertically
        logo_y = (combined_height - logo_img.height) // 2
        combined_img.paste(logo_img, (0, logo_y), logo_img)
        
        # Add text "LegalIQ"
        draw = ImageDraw.Draw(combined_img)
        
        # Try to use a bold system font (much smaller text)
        font_size = 28
        try:
            # Try different font paths for macOS
            font_paths = [
                "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
                "/Library/Fonts/Arial Bold.ttf",
            ]
            font = None
            for font_path in font_paths:
                if os.path.exists(font_path):
                    font = ImageFont.truetype(font_path, font_size)
                    break
            
            if font is None:
                font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
        
        # Text to add
        text = "LegalIQ"
        
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Position text right after logo with minimal gap, centered vertically
        text_x = new_width + 4  # 4px gap
        text_y = (combined_height - text_height) // 2 - bbox[1]  # Center vertically
        
        # Use dark color for text visibility
        text_color = (31, 41, 55)  # #1f2937 - dark gray for better visibility
        
        draw.text((text_x, text_y), text, font=font, fill=text_color)
        
        # Crop to actual content width with minimal padding
        final_width = text_x + text_width + 2  # Minimal padding
        combined_img = combined_img.crop((0, 0, final_width, combined_height))
        
        # Save as PNG with transparency
        output_path = "public/LegalIQ-Combined.png"
        combined_img.save(output_path, 'PNG', optimize=True)
        
        print(f"✅ Successfully created combined logo: {output_path}")
        print(f"   Dimensions: {combined_img.size}")
        print(f"   Logo width: {new_width}px")
        print(f"   Text width: {text_width}px")
        print(f"   Total width: {final_width}px")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating combined logo: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    create_combined_logo()
