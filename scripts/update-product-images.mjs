import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update product images with realistic, category-specific images
// This script will update the product data with appropriate image paths

const categoryImageMap = {
  // Hardware Categories
  "POS Systems": "/products/pos-systems/",
  "Self-Service": "/products/self-service/",
  "Kitchen Systems": "/products/kitchen-systems/",
  "Inventory Management": "/products/inventory-management/",
  "Fleet Management": "/products/fleet-management/",
  "Warehouse Systems": "/products/warehouse-systems/",
  "Security Systems": "/products/security-systems/",
  "Digital Signage": "/products/digital-signage/",
  "IoT Sensors": "/products/iot-sensors/",
  "Trades Equipment": "/products/trades-equipment/",
  "Infrastructure": "/products/infrastructure/",
  "Safety & Compliance": "/products/safety-compliance/",
  "Customer Experience": "/products/customer-experience/",
  "Development Tools": "/products/development-tools/",
  "Computer Vision": "/products/computer-vision/",
  "Training & AR": "/products/training-ar/",
  "Service Solutions": "/products/service-solutions/",
  "Outdoor Systems": "/products/outdoor-systems/",
  "Edge Computing": "/products/edge-computing/",
  "Supply House": "/products/supply-house/",
  
  // Merchandise Categories
  "Clothing": "/products/merchandise/clothing/",
  "Office Supplies": "/products/merchandise/office-supplies/",
  "Drinkware": "/products/merchandise/drinkware/",
  "Bags & Accessories": "/products/merchandise/bags-accessories/",
  "Safety & PPE": "/products/merchandise/safety-ppe/",
  "Tech & Electronics": "/products/merchandise/tech-electronics/",
  "Promotional": "/products/merchandise/promotional/"
};

// Product-specific image mappings for unique products
const productSpecificImages = {
  // Featured Products
  "thorbis-flippad": "/products/pos-systems/thorbis-flippad.webp",
  "thorbis-aegis-360": "/products/fleet-management/thorbis-aegis-360.webp",
  "thorbis-tech-tee": "/products/merchandise/clothing/thorbis-tech-tee.webp",
  
  // Popular Hardware
  "thorbis-pay-brick-mini": "/products/pos-systems/thorbis-pay-brick-mini.webp",
  "thorbis-kds-lite": "/products/kitchen-systems/thorbis-kds-lite.webp",
  "thorbis-smartbin": "/products/inventory-management/thorbis-smartbin.webp",
  "thorbis-pipescope": "/products/trades-equipment/thorbis-pipescope.webp",
  "thorbis-doorsense": "/products/security-systems/thorbis-doorsense.webp",
  "thorbis-leaklink": "/products/iot-sensors/thorbis-leaklink.webp",
  "thorbis-drive-thru-pro": "/products/outdoor-systems/thorbis-drive-thru-pro.webp",
  
  // Popular Merchandise
  "thorbis-hoodie": "/products/merchandise/clothing/thorbis-hoodie.webp",
  "thorbis-baseball-cap": "/products/merchandise/clothing/thorbis-baseball-cap.webp",
  "thorbis-lanyard": "/products/merchandise/office-supplies/thorbis-lanyard.webp",
  "thorbis-coffee-mug": "/products/merchandise/drinkware/thorbis-coffee-mug.webp",
  "thorbis-backpack": "/products/merchandise/bags-accessories/thorbis-backpack.webp",
  "thorbis-safety-glasses": "/products/merchandise/safety-ppe/thorbis-safety-glasses.webp",
  "thorbis-power-bank": "/products/merchandise/tech-electronics/thorbis-power-bank.webp",
  "thorbis-stickers-pack": "/products/merchandise/promotional/thorbis-stickers-pack.webp"
};

// Generate image path for a product
function generateImagePath(product) {
  // Check if product has a specific image
  if (productSpecificImages[product.id]) {
    return productSpecificImages[product.id];
  }
  
  // Generate category-based image path
  const categoryPath = categoryImageMap[product.category];
  if (categoryPath) {
    return `${categoryPath}${product.id}.webp`;
  }
  
  // Fallback to generic product image
  return `/products/generic/${product.id}.webp`;
}

// Update product data with new images
function updateProductImages() {
  console.log('Updating product images...');
  
  // Read the current products file
  const productsPath = path.join(process.cwd(), 'src', 'data', 'products.js');
  let productsContent = fs.readFileSync(productsPath, 'utf8');
  
  // Parse the products data manually since we can't import ES modules in Node.js script
  const productMatches = productsContent.match(/id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*image:\s*"([^"]+)",\s*price:\s*(\d+),/g);
  
  if (!productMatches) {
    throw new Error('Could not parse products from file');
  }
  
  // Extract product data
  const products = [];
  for (const match of productMatches) {
    const idMatch = match.match(/id:\s*"([^"]+)"/);
    const nameMatch = match.match(/name:\s*"([^"]+)"/);
    const categoryMatch = productsContent.substring(productsContent.indexOf(match)).match(/category:\s*"([^"]+)"/);
    
    if (idMatch && nameMatch && categoryMatch) {
      products.push({
        id: idMatch[1],
        name: nameMatch[1],
        category: categoryMatch[1]
      });
    }
  }
  
  // Update each product's image
  for (const product of products) {
    const newImagePath = generateImagePath(product);
    
    // Find and replace the image line for this specific product
    const productStart = productsContent.indexOf(`id: "${product.id}"`);
    if (productStart !== -1) {
      const productEnd = productsContent.indexOf('},', productStart);
      const productSection = productsContent.substring(productStart, productEnd);
      
      // Replace the image line
      const updatedSection = productSection.replace(
        /image:\s*"[^"]*",/,
        `image: "${newImagePath}",`
      );
      
      // Update the main content
      productsContent = productsContent.replace(productSection, updatedSection);
    }
  }
  
  // Write the updated content back
  fs.writeFileSync(productsPath, productsContent);
  console.log('✅ Product images updated successfully!');
  
  return products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    image: generateImagePath(product)
  }));
}

// Create directory structure for images
function createImageDirectories() {
  console.log('Creating image directories...');
  
  const publicDir = path.join(process.cwd(), 'public');
  const productsDir = path.join(publicDir, 'products');
  
  // Create main products directory
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }
  
  // Create category directories
  for (const categoryPath of Object.values(categoryImageMap)) {
    const fullPath = path.join(publicDir, categoryPath.substring(1)); // Remove leading slash
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  }
  
  // Create generic directory
  const genericDir = path.join(productsDir, 'generic');
  if (!fs.existsSync(genericDir)) {
    fs.mkdirSync(genericDir, { recursive: true });
    console.log(`Created directory: ${genericDir}`);
  }
  
  console.log('✅ Image directories created successfully!');
}

// Generate placeholder images (for development)
function generatePlaceholderImages() {
  console.log('Generating placeholder images...');
  
  // Read the products file to get product data
  const productsPath = path.join(process.cwd(), 'src', 'data', 'products.js');
  const productsContent = fs.readFileSync(productsPath, 'utf8');
  
  // Extract product data using regex
  const productMatches = productsContent.match(/id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*image:\s*"([^"]+)",\s*price:\s*(\d+),/g);
  
  if (!productMatches) {
    throw new Error('Could not parse products from file');
  }
  
  const products = [];
  for (const match of productMatches) {
    const idMatch = match.match(/id:\s*"([^"]+)"/);
    const nameMatch = match.match(/name:\s*"([^"]+)"/);
    const priceMatch = match.match(/price:\s*(\d+)/);
    const categoryMatch = productsContent.substring(productsContent.indexOf(match)).match(/category:\s*"([^"]+)"/);
    
    if (idMatch && nameMatch && priceMatch && categoryMatch) {
      products.push({
        id: idMatch[1],
        name: nameMatch[1],
        price: parseInt(priceMatch[1]),
        category: categoryMatch[1]
      });
    }
  }
  
  for (const product of products) {
    const imagePath = generateImagePath(product);
    const fullPath = path.join(process.cwd(), 'public', imagePath.substring(1));
    
    // Create a simple SVG placeholder
    const svgContent = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f8fafc"/>
  <rect x="50" y="50" width="300" height="300" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
  <text x="200" y="180" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#64748b">${product.name}</text>
  <text x="200" y="210" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#94a3b8">${product.category}</text>
  <text x="200" y="240" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#cbd5e1">$${product.price}</text>
</svg>`;
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write SVG file
    fs.writeFileSync(fullPath.replace('.webp', '.svg'), svgContent);
    console.log(`Generated placeholder: ${fullPath.replace('.webp', '.svg')}`);
  }
  
  console.log('✅ Placeholder images generated successfully!');
}

// Main function
function main() {
  try {
    console.log('🚀 Starting product image update process...\n');
    
    // Step 1: Create directories
    createImageDirectories();
    console.log('');
    
    // Step 2: Generate placeholder images
    generatePlaceholderImages();
    console.log('');
    
    // Step 3: Update product data
    const updatedProducts = updateProductImages();
    console.log('');
    
    // Step 4: Summary
    console.log('📊 Update Summary:');
    console.log(`Total products processed: ${updatedProducts.length}`);
    
    const categoryCounts = {};
    updatedProducts.forEach(product => {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });
    
    console.log('\nProducts by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });
    
    console.log('\n✅ Product image update completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Replace placeholder SVGs with real product images');
    console.log('2. Optimize images for web (compress, resize)');
    console.log('3. Test the store page to ensure all images load correctly');
    
  } catch (error) {
    console.error('❌ Error updating product images:', error);
    process.exit(1);
  }
}

// Run the script
main();
