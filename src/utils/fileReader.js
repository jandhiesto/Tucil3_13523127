// Membaca file .txt dari assets/inputs/ berdasarkan nama file
function readConfigFile(fileName, callback) {
    const filePath = `assets/inputs/${fileName}.txt`;
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`File ${fileName}.txt not found in assets/inputs/`);
            }
            return response.text();
        })
        .then(content => {
            console.log('File content:', content); // Debug: Cetak konten file
            callback(content);
        })
        .catch(error => {
            alert('Error reading config file: ' + error.message);
            console.error('Fetch error:', error);
        });
}