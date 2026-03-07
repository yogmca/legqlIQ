#!/usr/bin/env python3
"""
Script to remove white background from Legaliq.jpg
"""

from PIL import Image
import numpy as np

def remove_white_background(image_path, output_path):
    """Remove white background from image"""
    try:
        # Open the image
        img = Image.open(image_path)
        img = img.convert("RGBA")
        
        # Convert to numpy array
        data = np.array(img)
        
        # Get RGB channels
        red, green, blue, alpha = data.T
        
        # Replace white (also shades close to white) with transparent
        # Define white as RGB values all above 240
        white_areas = (red > 240) & (green > 240) & (blue > 240)
        data[..., :-1][white_areas.T] = (255, 255, 255)  # Keep RGB as white
        data[..., -1][white_areas.T] = 0  # Set alpha to 0 (transparent)
        
        # Convert back to image
        img_no_bg = Image.fromarray(data)
        
        # Save
        img_no_bg.save(output_path, 'PNG')
        print(f"✅ Successfully removed white background from {image_path}")
        print(f"   Saved to: {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    remove_white_background("public/Legaliq.jpg", "public/Legaliq-no-bg.png")
