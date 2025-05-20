# Rush Hour Solver

## Penjelasan Singkat Program
Rush Hour Solver adalah program berbasis JavaScript yang mengimplementasikan berbagai algoritma pencarian (Greedy Best-First Search, Uniform Cost Search, A*, dan Iterative Deepening Depth-First Search) untuk menyelesaikan permainan Rush Hour. Program ini memungkinkan pengguna memuat konfigurasi level, menjalankan algoritma pencarian, dan menampilkan langkah-demi-langkah solusi dalam format teks polos yang dapat disimpan ke file. Program ini menggunakan p5.js untuk visualisasi papan permainan dan dirancang untuk dijalankan di browser.

## Requirement dan Instalasi
- Node.js: Pastikan Node.js (versi 14 atau lebih baru) telah terinstal di sistem Anda. Unduh dari [nodejs.org](https://nodejs.org/) dan instal sesuai petunjuk.
- Dependensi Proyek: Setelah mengklon repositori, instal dependensi yang diperlukan dengan menjalankan:
  npm install
  Dependensi utama meliputi p5.js untuk visualisasi dan Vite sebagai pengembang server.
- Perangkat Lunak Tambahan (Opsional):
  - Untuk menampilkan struktur direktori: Instal tree (Linux/Mac: sudo apt install tree atau brew install tree; Windows: gunakan Git Bash atau Chocolatey).
  - Untuk transpilasi tambahan: Instal Babel (npm install --save-dev @babel/core @babel/cli @babel/preset-env).

## Cara Mengkompilasi Program
Program ini tidak memerlukan kompilasi tradisional seperti bahasa yang menghasilkan file biner (misalnya, .class di Java), karena JavaScript diinterpretasikan. Namun, Anda dapat menghasilkan file hasil transpilasi/bundling untuk dokumentasi atau distribusi:
1. Pastikan dependensi terinstal dengan npm install.
2. Jalankan perintah build menggunakan Vite untuk menghasilkan folder dist/:
   npm run build
   - Ini akan menghasilkan file JavaScript yang dioptimalkan di folder dist/, seperti dist/assets/index-*.js.
3. (Opsional) Jika ingin transpilasi manual dengan Babel:
   - Konfigurasi babel.config.json dengan {"presets": ["@babel/preset-env"]}.
   - Jalankan: npx babel src --out-dir dist.

## Cara Menjalankan dan Menggunakan Program
1. Jalankan Server Pengembangan:
   - Pastikan Anda berada di direktori root proyek.
   - Jalankan perintah berikut untuk memulai server lokal:
     npm run dev
   - Buka browser dan akses http://localhost:3000. Jika terdapat web lain yang berjalan pada localhost:3000, maka akan ada pada localhost:3001 dan seterusnya.
2. Gunakan Program:
   - Masukkan nama file konfigurasi (misalnya, "level1") di input teks dan klik "Load Config" untuk memuat papan permainan.
   - Pilih algoritma pencarian (Greedy, UCS, A*, atau IDDFS) dan heuristik (jika tersedia) dari dropdown.
   - Klik "Solve" untuk memulai pencarian. Langkah-langkah solusi akan ditampilkan di area output, dan file solusi (misalnya, level1solution.txt) akan diunduh secara otomatis.
   - (Opsional) Jika animasi solusi aktif, tunggu hingga selesai untuk pembaruan file solusi.

## Author / Identitas Pembuat
- Nama : Boye Mangaratua Ginting
- NIM  : 13523127
- Tanggal Pembuatan: 20 Mei 2025
