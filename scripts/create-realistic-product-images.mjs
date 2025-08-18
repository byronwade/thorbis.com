import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create realistic product images for Thorbis products
// This script provides multiple approaches for generating product images

// Category-based image generation strategies
const imageStrategies = {
  // Hardware Categories - Use professional product photography style
  "POS Systems": {
    style: "professional",
    background: "white",
    lighting: "studio",
    angle: "3/4 view",
    props: "minimal"
  },
  "Self-Service": {
    style: "modern",
    background: "white",
    lighting: "clean",
    angle: "front view",
    props: "none"
  },
  "Kitchen Systems": {
    style: "industrial",
    background: "white",
    lighting: "bright",
    angle: "front view",
    props: "none"
  },
  "Fleet Management": {
    style: "rugged",
    background: "white",
    lighting: "natural",
    angle: "3/4 view",
    props: "minimal"
  },
  "Security Systems": {
    style: "professional",
    background: "white",
    lighting: "studio",
    angle: "front view",
    props: "none"
  },
  "Digital Signage": {
    style: "modern",
    background: "white",
    lighting: "bright",
    angle: "front view",
    props: "none"
  },
  "IoT Sensors": {
    style: "minimal",
    background: "white",
    lighting: "clean",
    angle: "top view",
    props: "none"
  },
  "Trades Equipment": {
    style: "industrial",
    background: "white",
    lighting: "bright",
    angle: "3/4 view",
    props: "minimal"
  },
  "Infrastructure": {
    style: "technical",
    background: "white",
    lighting: "studio",
    angle: "front view",
    props: "none"
  },
  "Safety & Compliance": {
    style: "professional",
    background: "white",
    lighting: "bright",
    angle: "front view",
    props: "none"
  },
  "Customer Experience": {
    style: "modern",
    background: "white",
    lighting: "clean",
    angle: "front view",
    props: "none"
  },
  "Development Tools": {
    style: "technical",
    background: "white",
    lighting: "studio",
    angle: "3/4 view",
    props: "minimal"
  },
  "Computer Vision": {
    style: "futuristic",
    background: "white",
    lighting: "clean",
    angle: "front view",
    props: "none"
  },
  "Training & AR": {
    style: "modern",
    background: "white",
    lighting: "bright",
    angle: "3/4 view",
    props: "minimal"
  },
  "Service Solutions": {
    style: "professional",
    background: "white",
    lighting: "clean",
    angle: "front view",
    props: "none"
  },
  "Outdoor Systems": {
    style: "rugged",
    background: "white",
    lighting: "natural",
    angle: "3/4 view",
    props: "minimal"
  },
  "Edge Computing": {
    style: "technical",
    background: "white",
    lighting: "studio",
    angle: "front view",
    props: "none"
  },
  "Supply House": {
    style: "industrial",
    background: "white",
    lighting: "bright",
    angle: "3/4 view",
    props: "minimal"
  },
  "Inventory Management": {
    style: "professional",
    background: "white",
    lighting: "clean",
    angle: "front view",
    props: "none"
  },
  "Warehouse Systems": {
    style: "industrial",
    background: "white",
    lighting: "bright",
    angle: "3/4 view",
    props: "minimal"
  },

  // Merchandise Categories - Use lifestyle/product photography style
  "Clothing": {
    style: "lifestyle",
    background: "white",
    lighting: "natural",
    angle: "front view",
    props: "mannequin or flat lay"
  },
  "Office Supplies": {
    style: "product",
    background: "white",
    lighting: "studio",
    angle: "3/4 view",
    props: "minimal"
  },
  "Drinkware": {
    style: "product",
    background: "white",
    lighting: "studio",
    angle: "3/4 view",
    props: "none"
  },
  "Bags & Accessories": {
    style: "lifestyle",
    background: "white",
    lighting: "natural",
    angle: "3/4 view",
    props: "minimal"
  },
  "Safety & PPE": {
    style: "product",
    background: "white",
    lighting: "bright",
    angle: "front view",
    props: "none"
  },
  "Tech & Electronics": {
    style: "modern",
    background: "white",
    lighting: "studio",
    angle: "3/4 view",
    props: "minimal"
  },
  "Promotional": {
    style: "product",
    background: "white",
    lighting: "clean",
    angle: "front view",
    props: "none"
  }
};

// Generate professional SVG placeholder with realistic styling
function generateRealisticSVG(product, strategy) {
  const { name, category, price } = product;
  
  // Create a more realistic product visualization
  const svgContent = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="400" height="400" fill="#ffffff"/>
  
  <!-- Product container -->
  <rect x="50" y="80" width="300" height="240" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" rx="8"/>
  
  <!-- Product visualization based on category -->
  ${generateProductVisualization(category, strategy)}
  
  <!-- Product name -->
  <text x="200" y="340" font-family="Arial, sans-serif" font-size="14" font-weight="600" text-anchor="middle" fill="#1e293b">${name}</text>
  
  <!-- Category -->
  <text x="200" y="360" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#64748b">${category}</text>
  
  <!-- Price -->
  <text x="200" y="380" font-family="Arial, sans-serif" font-size="16" font-weight="700" text-anchor="middle" fill="#3b82f6">$${price}</text>
</svg>`;

  return svgContent;
}

// Generate different product visualizations based on category
function generateProductVisualization(category, strategy) {
  const { style, angle } = strategy;
  
  switch (category) {
    case "POS Systems":
      return `
        <!-- POS Terminal -->
        <rect x="120" y="120" width="160" height="120" fill="#1e293b" rx="4"/>
        <rect x="130" y="130" width="140" height="80" fill="#475569" rx="2"/>
        <rect x="140" y="140" width="120" height="60" fill="#64748b"/>
        <rect x="150" y="220" width="100" height="10" fill="#94a3b8" rx="2"/>
      `;
    
    case "Self-Service":
      return `
        <!-- Kiosk -->
        <rect x="100" y="100" width="200" height="160" fill="#1e293b" rx="8"/>
        <rect x="110" y="110" width="180" height="120" fill="#475569" rx="4"/>
        <rect x="120" y="120" width="160" height="100" fill="#64748b"/>
        <circle cx="200" cy="170" r="15" fill="#3b82f6"/>
      `;
    
    case "Kitchen Systems":
      return `
        <!-- Kitchen Display -->
        <rect x="120" y="120" width="160" height="120" fill="#dc2626" rx="4"/>
        <rect x="130" y="130" width="140" height="80" fill="#ef4444" rx="2"/>
        <rect x="140" y="140" width="120" height="60" fill="#f87171"/>
        <rect x="150" y="220" width="100" height="10" fill="#fca5a5" rx="2"/>
      `;
    
    case "Fleet Management":
      return `
        <!-- Vehicle Device -->
        <rect x="140" y="140" width="120" height="80" fill="#1e293b" rx="6"/>
        <rect x="150" y="150" width="100" height="50" fill="#475569" rx="3"/>
        <circle cx="200" cy="175" r="8" fill="#3b82f6"/>
        <rect x="160" y="210" width="80" height="6" fill="#94a3b8" rx="3"/>
      `;
    
    case "Security Systems":
      return `
        <!-- Security Camera -->
        <circle cx="200" cy="160" r="40" fill="#1e293b"/>
        <circle cx="200" cy="160" r="30" fill="#475569"/>
        <circle cx="200" cy="160" r="20" fill="#64748b"/>
        <circle cx="200" cy="160" r="10" fill="#3b82f6"/>
        <rect x="180" y="200" width="40" height="20" fill="#1e293b" rx="2"/>
      `;
    
    case "Clothing":
      return `
        <!-- T-Shirt -->
        <rect x="150" y="140" width="100" height="80" fill="#3b82f6" rx="20"/>
        <rect x="170" y="150" width="60" height="40" fill="#1e40af"/>
        <text x="200" y="175" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#ffffff">T</text>
        <rect x="180" y="220" width="40" height="20" fill="#1e40af" rx="10"/>
      `;
    
    case "Office Supplies":
      return `
        <!-- Lanyard -->
        <rect x="180" y="140" width="40" height="80" fill="#3b82f6" rx="20"/>
        <circle cx="200" cy="160" r="15" fill="#1e40af"/>
        <rect x="190" y="200" width="20" height="20" fill="#1e40af" rx="2"/>
      `;
    
    case "Drinkware":
      return `
        <!-- Coffee Mug -->
        <rect x="160" y="160" width="80" height="60" fill="#f59e0b" rx="10"/>
        <rect x="150" y="150" width="100" height="80" fill="#fbbf24" rx="15"/>
        <rect x="170" y="170" width="60" height="40" fill="#fcd34d"/>
        <rect x="180" y="140" width="20" height="20" fill="#f59e0b" rx="10"/>
      `;
    
    case "Tech & Electronics":
      return `
        <!-- Power Bank -->
        <rect x="140" y="140" width="120" height="80" fill="#1e293b" rx="8"/>
        <rect x="150" y="150" width="100" height="50" fill="#475569" rx="4"/>
        <rect x="160" y="160" width="80" height="30" fill="#64748b"/>
        <circle cx="200" cy="175" r="8" fill="#3b82f6"/>
        <rect x="170" y="210" width="60" height="6" fill="#94a3b8" rx="3"/>
      `;
    
    default:
      return `
        <!-- Generic Product -->
        <rect x="140" y="140" width="120" height="80" fill="#6b7280" rx="8"/>
        <rect x="150" y="150" width="100" height="50" fill="#9ca3af" rx="4"/>
        <rect x="160" y="160" width="80" height="30" fill="#d1d5db"/>
        <circle cx="200" cy="175" r="8" fill="#3b82f6"/>
      `;
  }
}

// Generate realistic product images
async function generateRealisticProductImages() {
  console.log('🚀 Starting realistic product image generation...\n');
  
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
  
  console.log(`📊 Found ${products.length} products to process\n`);
  
  // Create products directory
  const productsDir = path.join(process.cwd(), 'public', 'products');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }
  
  // Create category directories
  const categories = [...new Set(products.map(p => p.category))];
  for (const category of categories) {
    const categoryDir = path.join(productsDir, category.toLowerCase().replace(/\s+/g, '-'));
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
  }
  
  // Generate images for each product
  let processed = 0;
  for (const product of products) {
    try {
      const strategy = imageStrategies[product.category] || imageStrategies["default"];
      const svgContent = generateRealisticSVG(product, strategy);
      
      // Determine image path based on category
      const categoryPath = product.category.toLowerCase().replace(/\s+/g, '-');
      const imagePath = path.join(productsDir, categoryPath, `${product.id}.svg`);
      
      // Ensure directory exists
      const dir = path.dirname(imagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write SVG file
      fs.writeFileSync(imagePath, svgContent);
      
      processed++;
      console.log(`✅ Generated realistic image for ${product.name} (${product.category})`);
      
      // Update progress
      if (processed % 10 === 0) {
        console.log(`📈 Progress: ${processed}/${products.length} products processed`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to generate image for ${product.name}:`, error);
    }
  }
  
  console.log(`\n🎉 Realistic image generation completed!`);
  console.log(`📊 Total products processed: ${processed}`);
  console.log(`📁 Images saved to: public/products/`);
  
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
  console.log(`1. Review generated images in public/products/`);
  console.log(`2. Replace SVGs with real photos when ready`);
  console.log(`3. Optimize images for web performance`);
  console.log(`4. Test store page functionality`);
  
  return products;
}

// Run the realistic image generation
generateRealisticProductImages()
  .then(() => {
    console.log('\n✅ Realistic product image generation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Realistic image generation failed:', error);
    process.exit(1);
  });
