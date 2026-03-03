from PIL import Image
import numpy as np

# Load the original logo
img = Image.open('public/Legaliq.jpg').convert('RGBA')
data = np.array(img)

# Get RGB channels
r, g, b, a = data.T

# Define white areas (pixels that are very close to white)
white_areas = (r > 240) & (g > 240) & (b > 240)

# Make white areas transparent
data[..., 3] = np.where(white_areas.T, 0, 255)

# Create new image
img_transparent = Image.fromarray(data)

# Save as PNG with transparency
img_transparent.save('public/Legaliq-transparent.png', 'PNG')
print("✅ Created transparent logo: public/Legaliq-transparent.png")
