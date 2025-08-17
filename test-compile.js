const { exec } = require('child_process');

console.log('Testing contract compilation...\n');

// Test compilation
exec('npx hardhat compile', (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Compilation failed:');
        console.error(error.message);
        return;
    }
    
    if (stderr) {
        console.error('⚠️  Compilation warnings:');
        console.error(stderr);
    }
    
    if (stdout) {
        console.log('✅ Compilation successful!');
        console.log(stdout);
    }
    
    console.log('\n🎉 All contracts compiled successfully!');
    console.log('You can now run: npm test');
});

