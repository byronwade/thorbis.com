import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update product image paths to use the new SVG images
async function updateImagePaths() {
  console.log('🔄 Updating product image paths...\n');
  
  // Read the current products file
  const productsPath = path.join(process.cwd(), 'src', 'data', 'products.js');
  let productsContent = fs.readFileSync(productsPath, 'utf8');
  
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
  
  console.log(`📊 Found ${products.length} products to update\n`);
  
  // Update each product's image path
  let updated = 0;
  for (const product of products) {
    try {
      // Generate new SVG image path
      const categoryPath = product.category.toLowerCase().replace(/\s+/g, '-');
      const newImagePath = `/products/${categoryPath}/${product.id}.svg`;
      
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
        
        updated++;
        console.log(`✅ Updated image path for ${product.name}: ${newImagePath}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to update image path for ${product.name}:`, error);
    }
  }
  
  // Write the updated content back
  fs.writeFileSync(productsPath, productsContent);
  
  console.log(`\n🎉 Image path update completed!`);
  console.log(`📊 Total products updated: ${updated}`);
  console.log(`📁 New image format: SVG files in category directories`);
  
  // Generate summary by category
  const categoryCounts = {};
  products.forEach(product => {
    categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
  });
  
  console.log(`\n📋 Products by category:`);
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} products`);
  });
  
  console.log(`\n🚀 Next steps:`);
  console.log(`1. Test the store page to ensure all images load correctly`);
  console.log(`2. Review the new SVG images in public/products/`);
  console.log(`3. Replace SVGs with real photos when ready`);
  console.log(`4. Optimize images for web performance`);
  
  return products;
}

// Run the image path update
updateImagePaths()
  .then(() => {
    console.log('\n✅ Product image path update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Image path update failed:', error);
    process.exit(1);
  });
