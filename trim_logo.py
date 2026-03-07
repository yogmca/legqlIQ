#!/usr/bin/env python3
"""
Script to trim white space from the Legaliq.jpg logo image
"""

from PIL import Image
import sys

def trim_whitespace(image_path):
    """Trim white space from an image"""
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Get the bounding box of non-white pixels
        # We'll consider pixels with RGB values > 240 as "white"
        bbox = img.getbbox()
        
        if bbox:
            # Crop the image to the bounding box
            img_cropped = img.crop(bbox)
            
            # Save the cropped image
            img_cropped.save(image_path, 'JPEG', quality=95)
            print(f"✅ Successfully trimmed white space from {image_path}")
            print(f"   Original size: {img.size}")
            print(f"   New size: {img_cropped.size}")
            return True
        else:
            print(f"⚠️  No white space detected in {image_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing image: {e}")
        return False

if __name__ == "__main__":
    image_path = "public/Legaliq.jpg"
    trim_whitespace(image_path)
