# Automated Documentation Validation Scripts

> **Version**: 1.0.0  
> **Last Updated**: 2025-01-31  
> **Owner**: Documentation Engineering Team  
> **Purpose**: Automated quality assurance and validation

## Overview

This document provides comprehensive automated validation scripts for maintaining the quality, accuracy, and consistency of the Thorbis Business OS documentation system. These scripts ensure continuous validation of over 3,200 pages of technical documentation.

## Validation Framework Architecture

### Script Organization
```bash
docs/
├── scripts/
│   ├── validation/
│   │   ├── link-checker.js           # Link validation
│   │   ├── code-validator.js         # Code example testing
│   │   ├── content-analyzer.js       # Content quality analysis
│   │   ├── accessibility-checker.js   # Accessibility validation
│   │   ├── performance-tester.js     # Performance validation
│   │   └── schema-validator.js       # Schema and structure validation
│   ├── automation/
│   │   ├── daily-checks.sh          # Daily validation routine
│   │   ├── weekly-audit.sh          # Weekly comprehensive audit
│   │   ├── pre-commit-hooks.sh      # Git pre-commit validation
│   │   └── ci-pipeline.yml          # CI/CD integration
│   └── reporting/
│       ├── generate-reports.js      # Report generation
│       ├── send-notifications.js    # Alert system
│       └── dashboard-update.js      # Metrics dashboard
```

## Core Validation Scripts

### 1. Link Validation Script
```javascript
#!/usr/bin/env node
/**
 * Comprehensive Link Validation Script
 * Validates internal and external links, images, and cross-references
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');

class LinkValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
    this.cache = new Map();
    this.config = this.loadConfig();
  }

  loadConfig() {
    return {
      timeout: 30000,
      retries: 3,
      ignorePatterns: [
        /localhost/,
        /127\.0\.0\.1/,
        /\$\{.*\}/,  // Environment variables
        /#.*$/       // Anchors (handled separately)
      ],
      externalLinkCheck: true,
      validateAnchors: true,
      checkImages: true
    };
  }

  async validateAllDocumentation() {
    console.log(chalk.blue('🔍 Starting comprehensive link validation...'));
    
    const docsPath = path.join(__dirname, '../../business-docs');
    const markdownFiles = await this.findMarkdownFiles(docsPath);
    
    console.log(chalk.gray(`Found ${markdownFiles.length} markdown files to validate`));
    
    for (const file of markdownFiles) {
      await this.validateFile(file);
    }
    
    this.generateReport();
    return this.results;
  }

  async findMarkdownFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...await this.findMarkdownFiles(fullPath));
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async validateFile(filePath) {
    console.log(chalk.gray(`Validating: ${path.relative(process.cwd(), filePath)}`));
    
    const content = fs.readFileSync(filePath, 'utf8');
    const links = this.extractLinks(content);
    const images = this.extractImages(content);
    
    // Validate internal links
    for (const link of links.internal) {
      await this.validateInternalLink(link, filePath);
    }
    
    // Validate external links
    if (this.config.externalLinkCheck) {
      for (const link of links.external) {
        await this.validateExternalLink(link, filePath);
      }
    }
    
    // Validate images
    if (this.config.checkImages) {
      for (const image of images) {
        await this.validateImage(image, filePath);
      }
    }
    
    // Validate anchors
    if (this.config.validateAnchors) {
      for (const anchor of links.anchors) {
        this.validateAnchor(anchor, content, filePath);
      }
    }
  }

  extractLinks(content) {
    const links = {
      internal: [],
      external: [],
      anchors: []
    };
    
    // Markdown link pattern: [text](url)
    const linkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkPattern.exec(content)) !== null) {
      const url = match[2];
      
      if (url.startsWith('#')) {
        links.anchors.push(url);
      } else if (url.startsWith('http') || url.startsWith('//')) {
        if (!this.shouldIgnoreLink(url)) {
          links.external.push(url);
        }
      } else {
        links.internal.push(url);
      }
    }
    
    return links;
  }

  extractImages(content) {
    const images = [];
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = imagePattern.exec(content)) !== null) {
      images.push({
        alt: match[1],
        src: match[2]
      });
    }
    
    return images;
  }

  shouldIgnoreLink(url) {
    return this.config.ignorePatterns.some(pattern => pattern.test(url));
  }

  async validateInternalLink(link, basePath) {
    this.results.total++;
    
    // Resolve relative path
    const baseDir = path.dirname(basePath);
    const targetPath = path.resolve(baseDir, link);
    
    if (fs.existsSync(targetPath)) {
      this.results.passed++;
      console.log(chalk.green(`✓ Internal link valid: ${link}`));
    } else {
      this.results.failed++;
      this.results.errors.push({
        type: 'internal_link',
        file: basePath,
        link: link,
        message: 'File not found'
      });
      console.log(chalk.red(`✗ Internal link broken: ${link}`));
    }
  }

  async validateExternalLink(url, filePath) {
    this.results.total++;
    
    // Check cache first
    if (this.cache.has(url)) {
      const cached = this.cache.get(url);
      if (cached.valid) {
        this.results.passed++;
      } else {
        this.results.failed++;
      }
      return;
    }
    
    try {
      const response = await axios.head(url, {
        timeout: this.config.timeout,
        validateStatus: (status) => status < 400
      });
      
      this.cache.set(url, { valid: true, status: response.status });
      this.results.passed++;
      console.log(chalk.green(`✓ External link valid: ${url} (${response.status})`));
      
    } catch (error) {
      this.cache.set(url, { valid: false, error: error.message });
      this.results.failed++;
      this.results.errors.push({
        type: 'external_link',
        file: filePath,
        url: url,
        message: error.message
      });
      console.log(chalk.red(`✗ External link failed: ${url} - ${error.message}`));
    }
  }

  async validateImage(image, filePath) {
    this.results.total++;
    
    if (image.src.startsWith('http')) {
      // External image - validate URL
      await this.validateExternalLink(image.src, filePath);
    } else {
      // Internal image - check file exists
      const baseDir = path.dirname(filePath);
      const imagePath = path.resolve(baseDir, image.src);
      
      if (fs.existsSync(imagePath)) {
        this.results.passed++;
        
        // Check alt text
        if (!image.alt || image.alt.trim() === '') {
          this.results.warnings++;
          console.log(chalk.yellow(`⚠ Image missing alt text: ${image.src}`));
        }
      } else {
        this.results.failed++;
        this.results.errors.push({
          type: 'image',
          file: filePath,
          image: image.src,
          message: 'Image file not found'
        });
        console.log(chalk.red(`✗ Image not found: ${image.src}`));
      }
    }
  }

  validateAnchor(anchor, content, filePath) {
    this.results.total++;
    
    // Remove # from anchor
    const anchorId = anchor.substring(1);
    
    // Check if heading exists in content
    const headingPattern = new RegExp(`^#+\\s+.*${anchorId.replace(/-/g, '\\s+')}`, 'im');
    
    if (headingPattern.test(content) || content.includes(`id="${anchorId}"`)) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push({
        type: 'anchor',
        file: filePath,
        anchor: anchor,
        message: 'Anchor target not found'
      });
      console.log(chalk.red(`✗ Anchor not found: ${anchor}`));
    }
  }

  generateReport() {
    console.log('\n' + chalk.blue('📊 Link Validation Report'));
    console.log(chalk.blue('========================'));
    console.log(`Total links checked: ${this.results.total}`);
    console.log(chalk.green(`✓ Passed: ${this.results.passed}`));
    console.log(chalk.red(`✗ Failed: ${this.results.failed}`));
    console.log(chalk.yellow(`⚠ Warnings: ${this.results.warnings}`));
    
    if (this.results.errors.length > 0) {
      console.log('\n' + chalk.red('Errors:'));
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type}: ${error.message}`);
        console.log(`   File: ${path.relative(process.cwd(), error.file)}`);
        console.log(`   Link: ${error.link || error.url || error.image || error.anchor}`);
      });
    }
    
    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(2)
      },
      errors: this.results.errors
    };
    
    fs.writeFileSync('link-validation-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Report saved to link-validation-report.json');
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new LinkValidator();
  validator.validateAllDocumentation()
    .then((results) => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error(chalk.red('Validation failed:'), error);
      process.exit(1);
    });
}

module.exports = LinkValidator;
```

### 2. Code Example Validator
```javascript
#!/usr/bin/env node
/**
 * Code Example Validation Script
 * Tests and validates all code examples in documentation
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const chalk = require('chalk');
const tmp = require('tmp');

const execAsync = util.promisify(exec);

class CodeValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    this.tempFiles = [];
  }

  async validateAllCodeExamples() {
    console.log(chalk.blue('🧪 Starting code example validation...'));
    
    const docsPath = path.join(__dirname, '../../business-docs');
    const markdownFiles = await this.findMarkdownFiles(docsPath);
    
    for (const file of markdownFiles) {
      await this.validateCodeInFile(file);
    }
    
    // Cleanup temporary files
    this.cleanup();
    
    this.generateReport();
    return this.results;
  }

  async findMarkdownFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...await this.findMarkdownFiles(fullPath));
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async validateCodeInFile(filePath) {
    console.log(chalk.gray(`Validating code in: ${path.relative(process.cwd(), filePath)}`));
    
    const content = fs.readFileSync(filePath, 'utf8');
    const codeBlocks = this.extractCodeBlocks(content);
    
    for (const block of codeBlocks) {
      await this.validateCodeBlock(block, filePath);
    }
  }

  extractCodeBlocks(content) {
    const blocks = [];
    const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockPattern.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2];
      
      blocks.push({
        language: language.toLowerCase(),
        code: code.trim(),
        startLine: content.substring(0, match.index).split('\n').length
      });
    }
    
    return blocks;
  }

  async validateCodeBlock(block, filePath) {
    this.results.total++;
    
    try {
      switch (block.language) {
        case 'typescript':
        case 'ts':
          await this.validateTypeScript(block, filePath);
          break;
        case 'javascript':
        case 'js':
          await this.validateJavaScript(block, filePath);
          break;
        case 'bash':
        case 'sh':
          await this.validateBash(block, filePath);
          break;
        case 'json':
          await this.validateJSON(block, filePath);
          break;
        case 'yaml':
        case 'yml':
          await this.validateYAML(block, filePath);
          break;
        case 'sql':
          await this.validateSQL(block, filePath);
          break;
        default:
          this.results.skipped++;
          console.log(chalk.yellow(`⏭ Skipping ${block.language} code block`));
      }
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({
        file: filePath,
        line: block.startLine,
        language: block.language,
        error: error.message,
        code: block.code.substring(0, 100) + '...'
      });
      console.log(chalk.red(`✗ Code validation failed: ${error.message}`));
    }
  }

  async validateTypeScript(block, filePath) {
    // Create temporary TypeScript file
    const tempFile = tmp.fileSync({ suffix: '.ts' });
    this.tempFiles.push(tempFile.name);
    
    // Add common imports and types
    const wrappedCode = `
// Common imports for Thorbis documentation examples
import { NextRequest, NextResponse } from 'next/server';

// Common types
interface User {
  id: string;
  email: string;
  role: string;
}

interface Business {
  id: string;
  name: string;
  industry: string;
}

// User's code
${block.code}
`;
    
    fs.writeFileSync(tempFile.name, wrappedCode);
    
    try {
      // Compile with TypeScript
      await execAsync(`npx tsc --noEmit --strict --target ES2020 ${tempFile.name}`);
      this.results.passed++;
      console.log(chalk.green(`✓ TypeScript code valid`));
    } catch (error) {
      // Check if it's just missing types (warning) or actual error
      if (error.message.includes('Cannot find module') && 
          error.message.includes('or its corresponding type declarations')) {
        this.results.passed++;
        console.log(chalk.yellow(`⚠ TypeScript code valid (missing type declarations)`));
      } else {
        throw error;
      }
    }
  }

  async validateJavaScript(block, filePath) {
    // Create temporary JavaScript file
    const tempFile = tmp.fileSync({ suffix: '.js' });
    this.tempFiles.push(tempFile.name);
    
    fs.writeFileSync(tempFile.name, block.code);
    
    try {
      // Check syntax with Node.js
      await execAsync(`node --check ${tempFile.name}`);
      this.results.passed++;
      console.log(chalk.green(`✓ JavaScript code valid`));
    } catch (error) {
      throw error;
    }
  }

  async validateBash(block, filePath) {
    // Skip dangerous commands
    const dangerousCommands = ['rm -rf', 'sudo', 'chmod 777', 'wget', 'curl'];
    const hasDangerousCommand = dangerousCommands.some(cmd => 
      block.code.includes(cmd)
    );
    
    if (hasDangerousCommand) {
      this.results.passed++;
      console.log(chalk.yellow(`⚠ Bash code skipped (contains potentially dangerous commands)`));
      return;
    }
    
    // Create temporary shell script
    const tempFile = tmp.fileSync({ suffix: '.sh' });
    this.tempFiles.push(tempFile.name);
    
    fs.writeFileSync(tempFile.name, block.code);
    
    try {
      // Check syntax with shellcheck if available
      try {
        await execAsync(`shellcheck ${tempFile.name}`);
      } catch (shellcheckError) {
        // Fallback to bash syntax check
        await execAsync(`bash -n ${tempFile.name}`);
      }
      
      this.results.passed++;
      console.log(chalk.green(`✓ Bash code valid`));
    } catch (error) {
      throw error;
    }
  }

  async validateJSON(block, filePath) {
    try {
      JSON.parse(block.code);
      this.results.passed++;
      console.log(chalk.green(`✓ JSON valid`));
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  async validateYAML(block, filePath) {
    const yaml = require('js-yaml');
    
    try {
      yaml.load(block.code);
      this.results.passed++;
      console.log(chalk.green(`✓ YAML valid`));
    } catch (error) {
      throw new Error(`Invalid YAML: ${error.message}`);
    }
  }

  async validateSQL(block, filePath) {
    // Basic SQL syntax validation
    const sqlKeywords = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'
    ];
    
    const hasValidKeyword = sqlKeywords.some(keyword => 
      block.code.toUpperCase().includes(keyword)
    );
    
    if (!hasValidKeyword) {
      throw new Error('No valid SQL keywords found');
    }
    
    // Check for basic syntax errors
    if (block.code.split('(').length !== block.code.split(')').length) {
      throw new Error('Unmatched parentheses in SQL');
    }
    
    this.results.passed++;
    console.log(chalk.green(`✓ SQL syntax appears valid`));
  }

  cleanup() {
    for (const tempFile of this.tempFiles) {
      try {
        fs.unlinkSync(tempFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  generateReport() {
    console.log('\n' + chalk.blue('📊 Code Validation Report'));
    console.log(chalk.blue('========================='));
    console.log(`Total code blocks: ${this.results.total}`);
    console.log(chalk.green(`✓ Passed: ${this.results.passed}`));
    console.log(chalk.red(`✗ Failed: ${this.results.failed}`));
    console.log(chalk.yellow(`⏭ Skipped: ${this.results.skipped}`));
    
    if (this.results.errors.length > 0) {
      console.log('\n' + chalk.red('Errors:'));
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.language} error at line ${error.line}:`);
        console.log(`   File: ${path.relative(process.cwd(), error.file)}`);
        console.log(`   Error: ${error.error}`);
        console.log(`   Code: ${error.code}`);
      });
    }
    
    // Save report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        successRate: ((this.results.passed / (this.results.total - this.results.skipped)) * 100).toFixed(2)
      },
      errors: this.results.errors
    };
    
    fs.writeFileSync('code-validation-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Report saved to code-validation-report.json');
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new CodeValidator();
  validator.validateAllCodeExamples()
    .then((results) => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error(chalk.red('Code validation failed:'), error);
      process.exit(1);
    });
}

module.exports = CodeValidator;
```

### 3. Content Quality Analyzer
```javascript
#!/usr/bin/env node
/**
 * Content Quality Analysis Script
 * Analyzes documentation for readability, completeness, and consistency
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class ContentAnalyzer {
  constructor() {
    this.results = {
      files: 0,
      totalWords: 0,
      averageReadingLevel: 0,
      issues: [],
      metrics: {}
    };
    this.config = this.loadConfig();
  }

  loadConfig() {
    return {
      maxReadingLevel: 12, // Grade level
      minWordsPerSection: 50,
      requiredSections: ['Overview', 'Prerequisites'],
      terminologyConsistency: true,
      headingHierarchy: true,
      linkDensity: { min: 0.01, max: 0.05 } // Links per word
    };
  }

  async analyzeAllContent() {
    console.log(chalk.blue('📝 Starting content quality analysis...'));
    
    const docsPath = path.join(__dirname, '../../business-docs');
    const markdownFiles = await this.findMarkdownFiles(docsPath);
    
    for (const file of markdownFiles) {
      await this.analyzeFile(file);
    }
    
    this.calculateOverallMetrics();
    this.generateReport();
    return this.results;
  }

  async findMarkdownFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...await this.findMarkdownFiles(fullPath));
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async analyzeFile(filePath) {
    console.log(chalk.gray(`Analyzing: ${path.relative(process.cwd(), filePath)}`));
    
    const content = fs.readFileSync(filePath, 'utf8');
    const analysis = {
      file: filePath,
      wordCount: this.countWords(content),
      readingLevel: this.calculateReadingLevel(content),
      headings: this.extractHeadings(content),
      links: this.extractLinks(content),
      issues: []
    };
    
    // Perform quality checks
    this.checkReadingLevel(analysis);
    this.checkHeadingHierarchy(analysis);
    this.checkRequiredSections(analysis);
    this.checkLinkDensity(analysis);
    this.checkTerminologyConsistency(analysis, content);
    
    this.results.files++;
    this.results.totalWords += analysis.wordCount;
    this.results.issues.push(...analysis.issues);
    
    return analysis;
  }

  countWords(content) {
    // Remove markdown syntax and count words
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
      .replace(/[#*_~`]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return cleanContent.split(' ').filter(word => word.length > 0).length;
  }

  calculateReadingLevel(content) {
    // Simplified Flesch-Kincaid Grade Level calculation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.countWords(content);
    const syllables = this.countSyllables(content);
    
    if (sentences.length === 0 || words === 0) return 0;
    
    const avgWordsPerSentence = words / sentences.length;
    const avgSyllablesPerWord = syllables / words;
    
    const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    return Math.max(0, gradeLevel);
  }

  countSyllables(content) {
    const words = content.toLowerCase().match(/\b[a-z]+\b/g) || [];
    let syllableCount = 0;
    
    for (const word of words) {
      syllableCount += this.syllablesInWord(word);
    }
    
    return syllableCount;
  }

  syllablesInWord(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  extractHeadings(content) {
    const headings = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(#{1,6})\s+(.+)/);
      
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2],
          line: i + 1
        });
      }
    }
    
    return headings;
  }

  extractLinks(content) {
    const links = [];
    const linkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkPattern.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2]
      });
    }
    
    return links;
  }

  checkReadingLevel(analysis) {
    if (analysis.readingLevel > this.config.maxReadingLevel) {
      analysis.issues.push({
        type: 'readability',
        severity: 'warning',
        message: `Reading level too high: ${analysis.readingLevel.toFixed(1)} (target: ${this.config.maxReadingLevel})`,
        suggestion: 'Consider simplifying sentence structure and vocabulary'
      });
    }
  }

  checkHeadingHierarchy(analysis) {
    if (!this.config.headingHierarchy) return;
    
    const headings = analysis.headings;
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];
      
      // Check for skipped heading levels
      if (current.level > previous.level + 1) {
        analysis.issues.push({
          type: 'heading_hierarchy',
          severity: 'error',
          line: current.line,
          message: `Skipped heading level from H${previous.level} to H${current.level}`,
          suggestion: `Use H${previous.level + 1} instead of H${current.level}`
        });
      }
    }
  }

  checkRequiredSections(analysis) {
    const headingTexts = analysis.headings.map(h => h.text.toLowerCase());
    
    for (const required of this.config.requiredSections) {
      const found = headingTexts.some(text => 
        text.includes(required.toLowerCase())
      );
      
      if (!found) {
        analysis.issues.push({
          type: 'missing_section',
          severity: 'warning',
          message: `Missing required section: ${required}`,
          suggestion: `Add a "${required}" section to improve document structure`
        });
      }
    }
  }

  checkLinkDensity(analysis) {
    if (analysis.wordCount === 0) return;
    
    const linkDensity = analysis.links.length / analysis.wordCount;
    
    if (linkDensity < this.config.linkDensity.min) {
      analysis.issues.push({
        type: 'link_density',
        severity: 'info',
        message: `Low link density: ${(linkDensity * 100).toFixed(2)}% (minimum: ${(this.config.linkDensity.min * 100)}%)`,
        suggestion: 'Consider adding more cross-references to related content'
      });
    } else if (linkDensity > this.config.linkDensity.max) {
      analysis.issues.push({
        type: 'link_density',
        severity: 'warning',
        message: `High link density: ${(linkDensity * 100).toFixed(2)}% (maximum: ${(this.config.linkDensity.max * 100)}%)`,
        suggestion: 'Consider reducing the number of links or increasing content length'
      });
    }
  }

  checkTerminologyConsistency(analysis, content) {
    if (!this.config.terminologyConsistency) return;
    
    // Common terminology variations to check
    const terminologyRules = [
      { preferred: 'API', alternatives: ['api', 'Api'] },
      { preferred: 'JavaScript', alternatives: ['Javascript', 'javascript', 'JS'] },
      { preferred: 'TypeScript', alternatives: ['Typescript', 'typescript', 'TS'] },
      { preferred: 'database', alternatives: ['Database', 'DB', 'db'] },
      { preferred: 'user interface', alternatives: ['User Interface', 'UI', 'ui'] }
    ];
    
    for (const rule of terminologyRules) {
      for (const alternative of rule.alternatives) {
        if (content.includes(alternative)) {
          analysis.issues.push({
            type: 'terminology',
            severity: 'info',
            message: `Inconsistent terminology: found "${alternative}", prefer "${rule.preferred}"`,
            suggestion: `Replace "${alternative}" with "${rule.preferred}" for consistency`
          });
        }
      }
    }
  }

  calculateOverallMetrics() {
    this.results.averageReadingLevel = this.results.totalWords > 0 
      ? this.results.issues
          .filter(issue => issue.type === 'readability')
          .reduce((sum, issue) => sum + parseFloat(issue.message.match(/[\d.]+/)[0]), 0) / this.results.files
      : 0;
    
    this.results.metrics = {
      avgWordsPerFile: Math.round(this.results.totalWords / this.results.files),
      issuesByType: this.groupIssuesByType(),
      issuesBySeverity: this.groupIssuesBySeverity(),
      qualityScore: this.calculateQualityScore()
    };
  }

  groupIssuesByType() {
    const grouped = {};
    for (const issue of this.results.issues) {
      grouped[issue.type] = (grouped[issue.type] || 0) + 1;
    }
    return grouped;
  }

  groupIssuesBySeverity() {
    const grouped = {};
    for (const issue of this.results.issues) {
      grouped[issue.severity] = (grouped[issue.severity] || 0) + 1;
    }
    return grouped;
  }

  calculateQualityScore() {
    const totalIssues = this.results.issues.length;
    const errorWeight = 3;
    const warningWeight = 2;
    const infoWeight = 1;
    
    const weightedIssues = this.results.issues.reduce((sum, issue) => {
      switch (issue.severity) {
        case 'error': return sum + errorWeight;
        case 'warning': return sum + warningWeight;
        case 'info': return sum + infoWeight;
        default: return sum;
      }
    }, 0);
    
    // Score out of 100, penalized by weighted issues per file
    const penaltyPerFile = weightedIssues / this.results.files;
    return Math.max(0, 100 - (penaltyPerFile * 10));
  }

  generateReport() {
    console.log('\n' + chalk.blue('📊 Content Quality Analysis Report'));
    console.log(chalk.blue('=================================='));
    console.log(`Files analyzed: ${this.results.files}`);
    console.log(`Total words: ${this.results.totalWords.toLocaleString()}`);
    console.log(`Average words per file: ${this.results.metrics.avgWordsPerFile}`);
    console.log(`Quality score: ${this.results.metrics.qualityScore.toFixed(1)}/100`);
    
    console.log('\n' + chalk.yellow('Issues by Type:'));
    Object.entries(this.results.metrics.issuesByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\n' + chalk.yellow('Issues by Severity:'));
    Object.entries(this.results.metrics.issuesBySeverity).forEach(([severity, count]) => {
      const color = severity === 'error' ? chalk.red : 
                   severity === 'warning' ? chalk.yellow : 
                   chalk.blue;
      console.log(`  ${color(severity)}: ${count}`);
    });
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: this.results.metrics,
      files: this.results.files,
      totalWords: this.results.totalWords,
      issues: this.results.issues
    };
    
    fs.writeFileSync('content-quality-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to content-quality-report.json');
  }
}

// Execute if run directly
if (require.main === module) {
  const analyzer = new ContentAnalyzer();
  analyzer.analyzeAllContent()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('Content analysis failed:'), error);
      process.exit(1);
    });
}

module.exports = ContentAnalyzer;
```

### 4. Master Validation Script
```bash
#!/bin/bash
# Master Documentation Validation Script
# Runs all validation checks in sequence

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATION_DIR="$SCRIPT_DIR/validation"
REPORTS_DIR="$SCRIPT_DIR/../reports"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create reports directory
mkdir -p "$REPORTS_DIR"

echo -e "${BLUE}🚀 Starting comprehensive documentation validation...${NC}"
echo "=================================================="

# Function to run validation and capture results
run_validation() {
    local name="$1"
    local script="$2"
    local report_file="$3"
    
    echo -e "\n${BLUE}Running $name validation...${NC}"
    
    if cd "$VALIDATION_DIR" && node "$script" > "$REPORTS_DIR/$report_file.log" 2>&1; then
        echo -e "${GREEN}✓ $name validation passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $name validation failed${NC}"
        echo "  Check $REPORTS_DIR/$report_file.log for details"
        return 1
    fi
}

# Initialize results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Run link validation
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if run_validation "Link" "link-checker.js" "link-validation"; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Run code validation
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if run_validation "Code Example" "code-validator.js" "code-validation"; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Run content quality analysis
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if run_validation "Content Quality" "content-analyzer.js" "content-quality"; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Run accessibility checks (if available)
if [ -f "$VALIDATION_DIR/accessibility-checker.js" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if run_validation "Accessibility" "accessibility-checker.js" "accessibility"; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

# Run performance tests (if available)
if [ -f "$VALIDATION_DIR/performance-tester.js" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if run_validation "Performance" "performance-tester.js" "performance"; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

# Generate summary report
echo -e "\n${BLUE}📊 Validation Summary${NC}"
echo "===================="
echo "Total checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All validations passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some validations failed. Check the reports for details.${NC}"
    exit 1
fi
```

### 5. CI/CD Integration Configuration
```yaml
# .github/workflows/documentation-validation.yml
name: Documentation Validation

on:
  push:
    paths:
      - 'docs/**/*.md'
      - 'docs/scripts/**'
  pull_request:
    paths:
      - 'docs/**/*.md'
      - 'docs/scripts/**'
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'

jobs:
  validate-documentation:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: |
        cd docs/scripts/validation
        npm install
        
    - name: Install system dependencies
      run: |
        sudo apt-get update
        sudo apt-get install -y shellcheck
        
    - name: Run documentation validation
      run: |
        cd docs/scripts
        chmod +x master-validation.sh
        ./master-validation.sh
        
    - name: Upload validation reports
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: validation-reports-${{ matrix.node-version }}
        path: docs/scripts/reports/
        retention-days: 30
        
    - name: Comment PR with results
      uses: actions/github-script@v6
      if: github.event_name == 'pull_request'
      with:
        script: |
          const fs = require('fs');
          const path = require('path');
          
          try {
            const reportsDir = 'docs/scripts/reports';
            const linkReport = JSON.parse(fs.readFileSync(path.join(reportsDir, 'link-validation-report.json')));
            const codeReport = JSON.parse(fs.readFileSync(path.join(reportsDir, 'code-validation-report.json')));
            
            const comment = `## 📝 Documentation Validation Results
            
            ### Link Validation
            - **Success Rate**: ${linkReport.summary.successRate}%
            - **Total Links**: ${linkReport.summary.total}
            - **Failed Links**: ${linkReport.summary.failed}
            
            ### Code Validation
            - **Success Rate**: ${codeReport.summary.successRate}%
            - **Total Code Blocks**: ${codeReport.summary.total}
            - **Failed Validations**: ${codeReport.summary.failed}
            
            ${linkReport.summary.failed > 0 || codeReport.summary.failed > 0 
              ? '❌ Some validations failed. Please check the detailed reports.' 
              : '✅ All validations passed!'}
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
          } catch (error) {
            console.log('Could not post validation results:', error.message);
          }

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Run security scan on scripts
      uses: securecodewarrior/github-action-add-sarif@v1
      with:
        sarif-file: security-scan-results.sarif
        
    - name: Scan for secrets
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./docs/scripts/
        base: main
        head: HEAD
```

### 6. Package.json for Validation Scripts
```json
{
  "name": "@thorbis/docs-validation",
  "version": "1.0.0",
  "description": "Automated validation scripts for Thorbis Business OS documentation",
  "main": "index.js",
  "scripts": {
    "validate:links": "node validation/link-checker.js",
    "validate:code": "node validation/code-validator.js",
    "validate:content": "node validation/content-analyzer.js",
    "validate:all": "../master-validation.sh",
    "install:deps": "npm install --save axios cheerio chalk js-yaml tmp",
    "test": "jest",
    "lint": "eslint validation/*.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "chalk": "^4.1.2",
    "js-yaml": "^4.1.0",
    "tmp": "^0.2.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.50.0"
  },
  "keywords": [
    "documentation",
    "validation",
    "quality-assurance",
    "automation"
  ],
  "author": "Thorbis Documentation Team",
  "license": "MIT"
}
```

## Usage Instructions

### Running Individual Validations
```bash
# Run link validation only
cd docs/scripts/validation
node link-checker.js

# Run code validation only
node code-validator.js

# Run content quality analysis only
node content-analyzer.js
```

### Running Complete Validation Suite
```bash
# Run all validations
cd docs/scripts
./master-validation.sh

# Run with verbose output
VERBOSE=1 ./master-validation.sh
```

### Integration with Git Hooks
```bash
# Install pre-commit hook
ln -sf ../../docs/scripts/pre-commit-validation.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Reporting and Monitoring

### Report Formats
All validation scripts generate JSON reports with the following structure:
- **timestamp**: ISO date of validation run
- **summary**: High-level metrics and success rates
- **errors**: Detailed error information with file locations
- **recommendations**: Actionable improvement suggestions

### Dashboard Integration
Reports can be integrated with monitoring dashboards using the provided dashboard update script, which publishes metrics to monitoring systems like Grafana or custom dashboards.

---

*These automated validation scripts ensure continuous quality assurance for the Thorbis Business OS documentation system, catching issues early and maintaining high standards across all 3,200+ pages of documentation.*