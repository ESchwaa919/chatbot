#!/bin/bash

echo "CHE Chat Application Installation Script"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "Error: Node.js version $NODE_VERSION is too old. Please install Node.js 16+ first."
    exit 1
fi

echo "✓ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"

# Build widget
echo "Building chat widget..."
cd widget
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "Error: Failed to build chat widget"
    exit 1
fi

cd ..
echo "✓ Chat widget built"

# Copy widget files
echo "Copying widget files..."
mkdir -p public/widget/dist
cp widget/dist/* public/widget/dist/

echo "✓ Widget files copied"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "IMPORTANT: Please edit .env file and set your OpenAI API key:"
    echo "OPENAI_API_KEY=your_api_key_here"
    echo ""
fi

echo "Installation complete!"
echo ""
echo "To start the application:"
echo "1. Set your OpenAI API key in .env file"
echo "2. Run: npm start"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For development mode:"
echo "Run: npm run dev"