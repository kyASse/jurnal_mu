### Rekayasa Perangkat Lunak Menggunakan

### Laravel + JQuery

Buku Perkuliahan

© 2020-2025 Ardiansyah - Lab. Intelligence Software Engineering
Program Studi S1 Informatika - Universitas Ahmad Dahlan
_“Bring real-world experience into your class”_

#### Penjelasan Studi Kasus

Khusus studi kasus mata kuliah ini saya akan membangun sebuah aplikasi
yang dinamakan ERP (Enterprise Resource Planning).

#### Setup Environment

Ini adalah setup environment untuk versi Windows 10. Untuk pemakai Linux/Mac
silakan menyesuaikan.

###### Cek Instalasi PHP

Buka shell atau cmd di windows Anda, lalu ikuti perintah berikut:

Jika muncul pesan seperti di atas, berarti PHP sudah terpasang di Windows kamu.
Selanjutnya kamu bisa lanjut untuk **cek Compose** r.

Namun, jika pesan yang muncul menunjukkan PHP belum terpasang, berarti kamu harus
memasang PHP terlebih dahulu. Ikuti petunjuk berikut.

###### Instalasi PHP

1. Unduh folder PHP di sini.
2. Pindahkan folder php hasil unduhan ke direktori C:\ sehingga menjadi **C:\php**
3. Buka Edit The System Environment Variables. Caranya search windows bar dengan
    kata kunci “env”, lalu kli “Edit the system environment variables”.


4. Hasilnya akan terbuka window System Properties. Anda klik “ **Environment**
    **Variables...** ”
5. Hasilnya akan terbuka window **Environment Variables**. Pada kotak **System**
    **variables** , Anda klik **Path** , lalu klik tombol **Edit...**


6. Hasilnya akan terbuka window **Edit environment variable**. Anda klik tombol **New** ,
    lalu tulis **C:\php**. Akhiri dengan menekan tombol **OK**.


7. Klik OK pada window **Environment Variables** dan klik **Apply** serta **OK** pada window
    System Properties
8. Restart windows kamu
9. Cek Instalasi PHP seperti cara di atas sebelumnya

Aktifkan fileinfo di php.ini
Buka c:\php\php.ini
aktifkan extension=fileinfo
aktifkan extension=zip
aktifkan extension=mysqli
aktifkan extension=pdo_mysql

###### Intalasi Apache

Edit file httpd.conf

Unduh Apache di sini dan pindahkan ke folder C:\.

PS C:\Apache24\bin> .\httpd.exe -k install
Installing the 'Apache2.4' service
The 'Apache2.4' service is successfully installed.


Testing httpd.conf....
Errors reported here must be corrected before the service can be started.
AH00558: httpd.exe: Could not reliably determine the server's fully qualified domain name,
using fe80::ff1:9f57:4624:2fe5. Set the 'ServerName' directive globally to suppress this
message

###### Instalasi MySQL & MySQL Workbench

Unduh mysql di MySQL :: Download MySQL Installer
Pilih intalasi mysql dan mysql workbench
Ikuti proses intalasi keduanya hingga selesai

## Git/Github

Sebagaimana kita ketahui bahwa software terdiri dari program, prosedur, dokumentasi dan
data yang dibuat dalam sebuah tim. Mengembangkan software bukanlah pekerjaan individu,
melainkan pekerjaan tim. Ada yang khusus mengerjakan tampilan/antarmuka/interface, ada
yang mengerjakan bagian server, ada yang mengerjakan bagian database, ada yang khusus
menguji, dan ada yang bagian mendesain arsitektur sistem.
Coba Anda bayangkan, bagaimana semua anggota tim bekerjasama dan berkoordinasi
terhadap software yang sedang dibangun? Misalnya bagaimana programer X bisa tahu dan
mendapatkan class yang telah dibuat oleh programer Y? Bayangan kita paling sederhana
tinggal dishare lewat Google Drive atau via email dan diunduh bukan? Kelemahan cara
seperti ini adalah kita tidak tahu bagian mana saja yang telah diubah/ditambah beserta
historinya.
Oleh karena itulah mengapa pentingnya menguasai dan menggunakan software versioning
atau source version control. Salah satu tool yang tersedia dan banyak digunakan adalah
Git/Github. Bagaimana cara menggunakan Git/Github ini? Silakan ikuti petunjuknya sebagai
berikut.

**Instal Git**

1. Buat akun Git Anda di [http://github.com](http://github.com)
2. Download di https://git-scm.com/
3. Petunjuk lebih lanjut baca di https://www.petanikode.com/git-install/
4. Restart windows kamu

**Mengkonfigurasi Username dan Email**

1. Buka console windows menggunakan cmd Pada VS Code, klik menu **View >**
    **Terminal (Ctrl +)**
2. Muncul command prompt
    Windows PowerShell
    Copyright (C) Microsoft Corporation. All rights reserved.
    Try the new cross-platform PowerShell https://aka.ms/pscore
    PS C:\xampp\htdocs\prpl2021>


3. Ketik perintah:
    git config --global user.name "nama". Contoh:
    git config --global user.name "ardiansyah-sweng". Tekan **Enter**
    Usahakan **nama** yang digunakan sama dengan **username** pada akun Github Anda
4. Ketik perintah:
    git config --global user.email "email". Contoh:
    git config --global user.email “ardiansyah.2019@outlook.com”. Tekan
    **Enter**
    Usahakan **email** yang digunakan sama dengan **email** pada akun Github Anda
    Perhatian! Jika Anda salah menuliskan email, maka mengakibatkan profil Anda tidak
akan masuk sebagai kontributor di github.

**Setup Git untuk Masuk Repo**

1. Buka aplikasi **Visual Studio Code**. Jika belum punya, silakan download & instal
    terlebih dahulu.
2. Klik menu **Explorer**
3. Klik **Clone Repository**
4. Pada bagian **Provide repository URL or pick a repository source** , paste tautan ini
    https://github.com/ardiansyah-sweng/erp_rpl.git , atau
    https://github.com/ardiansyah-sweng/erp-pos.git , atau
    https://github.com/ardiansyah-sweng/erp-hris.git lalu tekan **Enter**.
5. Pilih folder htdocs

```
6.
```

```
Ketika muncul pertanyaan Would you like to open the cloned repository? pilih
Open atau Open in new window
```
7. Jika muncul seperti gambar berikut, berarti Anda sudah berhasil meng-clone
    repository erp_rpl, erp-hris, atau erp-pos.

###### Instalasi Composer

1. Unduh file **composer-setup.exe** di https://getcomposer.org/
2. Dobelklik file **composer-setup.exe** , lalu ikuti proses instalasi yang disediakan
3. Restart windows
4. Buka command shell windows dengan menggunakan cmd
5. Tulis perintah **D:\>erp_rpl\composer install**

Bagi yang diminta mengupdate composer, lakukan dengan perintah:
$ composer self-update --

###### Cek Composer

1. Buka shell atau cmd di windows Anda
2. Ketik perintah:
    **D:\>erp_rpl\composer --version**

###### Menyiapkan Environment dan Tes Aplikasi Aktif

1. Buka source code aplikasi **ERP_RPL, ERP-POS, atau ERP-HRIS** di Visual Studio
    Code
2. Copy file **.env.example** lalu ubah namanya menjadi **.env**
3. Buka file **.env**
4. Isi **DB_PASSWORD** dengan password root Anda ketika instalasi mysql sebelumnya
5. Buka console cmd
6. Masuk ke direktori proyek **erp_rpl, erp-pos, atau erp-hris**.
7. Ketik perintah **d:\erp_rpl\php artisan serve**
8. Buka browser lalu ketik [http://127.0.0.1:8000.](http://127.0.0.1:8000.) Jika keluar halaman Laravel, berarti
    instalasi sudah berhasil

###### Impor Skema Database

1. Buka console dan masuk ke direktori proyek. Lalu ketik perintah **d:\erp_rpl\php**
    **artisan db:create**


2. Kalau sukses berarti database **erp_rpl** sudah tercipta. Anda bisa cek menggunakan
    Workbench
3. Ketik perintah **d:\erp_rpl\php artisan migrate.** Hasilnya akan tercipta tabel-tabel.
    Silakan cek di MySQL Workbench
4. Ketik perintah **d:\erp_rpl\php artisan db:seed.** Hasilnya tabel akan diisi data
    dummy. Silakan cek di Workbench

=====Batas Setup Sampai Sini saja=====================

```
Impor Skema Khusus
```
1. Pull dari branch development
2. Jalankan **php artisan migrate:fresh –seed**
3. Tunggu sampai muncul pesan: **SQLSTATE[21000]: Cardinality violation: 1242**
    **Subquery returns more than 1 row**
4. Buka **MySQL Workbench**
5. Klik **File > Open SQL Script**
6. Pilih file **d:\erp_rpl\database\erp_rpl_assortment_production.sql**
7. Klik **Open**
8. Eksekusi skrip SQL tersebut (tekan ikon petir di workbench)
9. Jalankan perintah **d:\erp_rpl\php artisan db:seed --class=BOMSeeder**
10. Jika keluar pesan —SELESAI— berarti impor telah sukses

Penggunaan Git Pada Proyek ERP RPL

**Pembuatan dan Penamaan Branch**
Ketika Anda telah mengetahui tugas apa yang harus dikerjakan, selanjutnya buat branch
lokal di laptop Anda sesuai nama fungsi yang yang ditentukan.
Caranya:

1. Lihat nama fungsi yang ditentukan. Sebagai contoh pada gambar berikut, Narendra
    dengan tiga digit terakhir NIM 007 kelas D, ditugaskan untuk membuat fungsi
    getPurchaseOrder pada PurchaseOrderController. Artinya nama branch lokal yang
    dibuat menjadi **Narendra_222D_PurchaseOrderController_getPurchaseOrder**.


2. Untuk membuat branch lokal Ketik perintah: **git checkout -b**
    **Narendra_007D_PurchaseOrderController_getPurchaseOrder PurchaseOrder**
    Artinya, kita membuat branch bernama yang diambil dari branch PurchaseOrder.
    Mengapa dari branch PurchaseOrder? Karena memang tugas Anda masuk dalam
    fitur Purchase Order. Jadi pastikan Anda membuat branch dan mem-push ke branch
    remote yang sama.
3. Hasilnya muncul pesan: Switched to a new branch
    'Narendra_007D_PurchaseOrderController_getPurchaseOrder'

Menghapus branch lokal di laptop/pc.

1. Pastikan Anda checkout ke luar branch yang hendak dihapus
2. Ketik perintah: **git branch -d <nama branch>**
3. Contoh: **git branch -d 222_BranchModel_BranchController_D**
    Muncul pesan: warning: deleting branch '222_BranchModel_BranchController_D' that
    has been merged to
    'refs/remotes/origin/222_BranchModel_BranchController_D', but not yet merged to
    HEAD
    Deleted branch 222_BranchModel_BranchController_D (was 5598432).

**Menguji method menggunakan Tinker**

**Menguji Insert data di Model.**
Nama Class: SupplierPic

Method
**public static function addSupplierPIC($supplierID, $data)
{
$data['supplier_id'] = $supplierID;
return self::create($data);
}**


Lakukan:
PS D:\erp_rpl> php artisan tinker
Psy Shell v0.12.7 (PHP 8.3.8 — cli) by Justin Hileman

> use App\Models\SupplierPic;

> $data = ['supplier_id' => 'SUP003', 'name' => 'Ardie', 'email' => 'ardi@gmail.com',
'phone_number' => '33339483993', 'assigned_date' => '2024-11-12'];
= [
"supplier_id" => "SUP003",
"name" => "Ardie",
"email" => "ardi@gmail.com",
"phone_number" => "33339483993",
"assigned_date" => "2024-11-12",
]

> SupplierPic::addSupplierPIC("SUP003", $data);
= App\Models\SupplierPic {#
supplier_id: "SUP003",
name: "Ardie",
email: "ardi@gmail.com",
phone_number: "33339483993",
assigned_date: "2024-11-12",
updated_at: "2025-04-08 09:17:43",
created_at: "2025-04-08 09:17:43",
id: 0,
}

Lihat ke tabel supplier_pic, data baru mestinya sudah bertambah.

**Menguji method count di model**
Class: Category

Method
public static function countCategory()
{
return self::count();
}

Langkahnya:
PS D:\erp_rpl> php artisan tinker
Psy Shell v0.12.7 (PHP 8.3.8 — cli) by Justin Hileman
> use App\Models\Category;
> Category::countCategory();
= 44
Artinya ada 44 kategori pada tabel category

**Menguji model untuk pencarian**


PS D:\erp_rpl> php artisan tinker
Psy Shell v0.12.7 (PHP 8.3.8 — cli) by Justin Hileman

> $res = App\Models\PurchaseOrder::getPurchaseOrderByKeywords("PO0012");
= Illuminate\Pagination\LengthAwarePaginator {#
+onEachSide: 3,
}

> $res->items();
= [
App\Models\PurchaseOrder {#
po_number: "PO0012",
supplier_id: "SUP007",
total: 402276194,
branch_id: 3,
order_date: "2025-01-09",
status: "Revised",
created_at: "2025-03-27 20:57:14",
updated_at: "2025-03-27 20:57:14",
},
]

==========================

###### Upgrade XAMPP (bagi pengguna XAMPP)

Bagi yang belum pernah instal XAMPP, silakan instal dulu. Unduh XAMPP di
https://www.apachefriends.org/index.html. Jika yang sudah terinstal dan masih versi
lama, silakan upgrade ke XAMPP terbaru. Jika dirasa tidak perlu upgrade XAMPP
juga tidak apa-apa menggunakan versi yang ada sekarang.

```
A. Backup database pada XAMPP lama
a. Masuk ke folder instalasi XAMPP, biasanya di c:\xampp, lalu cari file
dengan nama xampp-control.exe;
b. Klik kanan file xampp-control, pilih Run as administrator, hingga
muncul XAMPP Control Panel;
c. Hidupkan Apache dan MySQL di XAMPP Control Panel;
d. Pada XAMPP Control Panel, klik tombol Shell
e. Di command promp Shell, jalankan perintah berikut:
```
```
mysqldump -u root -p --all-databases >
backup-db-20092020.sql
```

```
Pastikan username database sesuai. Contoh di atas username
database adalah root. File backup yang dibuat adalah
backup-db-20092020.sql, jadi bisa menyesuaikan dengan
kebutuhan Anda. Jika backup berhasil, file backup ini akan tersedia di
folder xampp.
f. Hentikan Apache dan MySQL melalui XAMPP Control Panel;
g. Klik tombol quit pada XAMPP Control Panel, dan tutup command
promp shell;
h. Ganti nama folder xampp menjadi xampp-old.
```
B. Instalasi XAMPP Versi Baru
a. Download versi terbaru XAMPP
b. Instal XAMPP yang telah diunduh pada folder yang sama dengan
xampp versi lama yang telah diubah nama folder-nya
c. Masuk ke folder xampp, lalu jalankan xampp control panel dengan run
as administrator
d. Klik tombol Start pada Apache dan MySQL
e. Cek Apache berjalan dengan membuka browser, lalu ketik
[http://localhost](http://localhost)
f. Cek database apakah berjalan baik dengan membuka browser lalu
ketik [http://localhost/phpmyadmin/,](http://localhost/phpmyadmin/,) atau melalui heidiSQL atau
tableplus
g. Copy folder htdocs dari folder xampp-old ke folder xampp agar
menimpa folder htdocs baru
h. Import database melalui CLI
i. Buka file xampp\php\php.ini menggunakan VSCode
j. Perbesar nilai opsi upload_max_filesize, memory_limit,
post_max_size. Nilai post_max_size dan memory_limit nilainya
harus lebih besar dari upload_max_filesize. Lalu simpan file.
k. Buka file xampp\phpMyAdmin\libraries\config.default.php. Cari opsi
$cfg[‘ExecTimeLimit’] = 300 , lalu ubah nilai dari 300 ke nilai
yang lebih tinggi misalnya 3000. Lalu simpan file tersebut
l. Restart Apache dan MySQL melalui XAMPP Cpanel
m. Buka phpmyadmin pada browser
n. Import file database backup-db-20092020.sql
o. Jika sukses akan tampil pesan _Import has been successfully finished_
p. Buka command prompt shell di Xampp Cpanel, lalu jalankan perintah
mysql_upgrade
q. Jika semua status OK, maka proses upgrade XAMPP dinyatakan
berhasil


###### Instalasi Laravel

1. Buka command prompt windows menggunakan cmd
2. Masuk ke folder c:\xampp\htdocs
3. Ketik perintah C:\xampp\htdocs>composer create-project --prefer-dist
    laravel/laravel <namaproyek>
    Keterangan:
       - create-project: perintah untuk membuat proyek baru
       - --prefer-dist: untuk memerintahkan download laravel versi yang
          direkomendasikan atau versi yang stabil (terbaru)
       - wealthrecord: nama proyek laravel yang ingin kita buat
4. Tekan enter
5. Tunggu proses instalasinya berlangsung beberapa menit, tergantung
    kecepatan koneksi internet masing-masing
6. Jika keluar tulisan Application key set successfully, berarti instalasi
    Laravel berhasil
7. Jika muncul pesan berikut:

```
> @php -r "file_exists('database/database.sqlite') ||
touch('database/database.sqlite');"
> @php artisan migrate --graceful --ansi
```
```
WARN could not find driver (Connection: sqlite, SQL: PRAGMA
foreign_keys = ON;).
```
```
Masalah yang Anda alami terjadi karena Laravel secara default mencoba
menggunakan SQLite untuk database, tetapi driver SQLite tidak tersedia di
konfigurasi PHP Anda. Jika Anda ingin menggunakan MySQL sebagai
database, Anda perlu melakukan beberapa langkah berikut:
```
```
a. Buka file .env di folder proyek erp_rpl
b. Ubah baris sesuai berikut
APP_NAME=RPL ERP UAD
```
```
APP_TIMEZONE="Asia/Jakarta"
```
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.
DB_PORT=
DB_DATABASE=erp_rpl
DB_USERNAME=erp_rpl
DB_PASSWORD=erp_rpl
```

```
c. Ubah baris sesuai berikut
SESSION_DRIVER=file
```
```
d. Ubah file config/database.php menjadi berikut
'default' => env('DB_CONNECTION', 'mysql'),
```
8. Masuk ke folder proyek yang telah dibuat yaitu wealthrecord dengan
    perintah C:\xampp\htdocs>cd wealthrecord
9. Instal composer (jika belum punya) dengan mengetik:
    composer install
10. ketik C:\xampp\htdocs\wealthrecord>php artisan serve, maka akan
    keluar tulisan:
    Starting Laravel development server: [http://127.0.0.1:](http://127.0.0.1:)
    [Sun Sep 20 09:29:20 2020] PHP 7.4.10 Development Server
    (http://127.0.0.1:8000) started
11. Buka browser lalu ketik localhost:8000 atau 127.0.0.1:8000, lalu tekan enter
12. Jika browser menampilkan **Laravel** , berarti laravel sudah aktif
13. Membuka proyek wealthrecord dengan mengetik
    [http://localhost/wealthrecord/public](http://localhost/wealthrecord/public)

###### Mengubah Home Route



Misalnya Anda ditugaskan menambah fitur **supplier PIC phone** pada feature/supplier,
maka:

1. Buat branch lokal sendiri berdasarkan feature/supplier
2. Caranya: **git checkout -b feature/supplier/supplier_pic_phone feature/supplier**
3. Silakan mulai membuat fitur tambahan
4. Jika selesai, lakukan push dan pull: **git push origin supplier_pic_phone**

**Membuat Branch Sendiri**
Branch ini penting agar Anda punya “rumah/repo” source code sendiri yang tidak
mengganggu source code milik orang lain, apalagi branch main/master/development.
Lakukan langkah berikut ini:

1. Lihat pojok kiri bawah ada tulisan main atau master atau development
2. Klik branch development atau master yang muncul, lalu tulis nama branch Anda
    dengan format (tulisan huruf kecil semua) **nama_kelas_nim**. Contoh:
    **yuliani_g_**.
3. Jika berhasil maka nama branch akan berubah menjadi seperti gambar berikut
4. Jika berhasil Anda bisa melihat branch Anda di Github


**Mengupdate source code project thesis pertama kali ke branch lokal Anda**
Untuk pertama kali menggunakan repository proyek prpl2021, maka harus di-pull
terlebih dahulu dari remote repository pada branch development/Anda. Untuk itu lakukan
langkah berikut:

1. Pastikan telah masuk ke _branch_ Anda
2. Buka terminal lalu ketik: git pull origin development
3. Jika berhasil, maka folder prpl2021 akan berisi seluruh folder dan file proyek
    prpl2021 dari main branch

**Mengirim source code ke branch remote Anda**
Di sepanjang perkuliahan ini, Anda akan diminta untuk membuat
program/function/method/class sesuai yang ditugaskan. Hasil penugasan harus
dikirim ke repo utama. Adapun cari mengirim source code Anda adalah sebagai
berikut:

1. Anda akan mulai bekerja memprogram fungsi-fungsi yang ditugaskan. Setiap kali
    ada perubahan dalam program, maka di VS Code akan tampil seperti di kolom
    bagian kiri.


2. Setelah selesai dan siap untuk dikirim, klik menu ikon **Source Control** atau tekan
    **CTRL + SHIFT + G**. Kemudian tekan tanda **+** untuk melakukan **Stage Changes**.
3. Klik ikon tanda centang untuk melakukan **Commit**

```
Selanjutnya wajib memberi komentar terkait perubahan yang dilakukan, misalnya
pada contoh ini saya telah membuat sebuah fungsi kuadrat.
```
4. Lakukan **push** ke branch Anda dengan mengklik ikon menu **Synchronize Changes**


5. Selanjutnya buka project thesis di github, akan muncul tampilan seperti di bawah.
    Lalu klik tombol **Compare & pull request**

```
atau Anda buka branch Anda sendiri lalu klik menu Pull request
```
6. Tentukan branch tujuan untuk dimerge. Misalnya pada gambar di bawah branch
    **ardiansyah_60030476** bermaksud ingin merge ke branch **development**.
    Kemudian tulis isi permintaan pull request pada tempat yang telah disediakan.
    Klik tombol **Create pull request**
7. Akhirnya pull request (PR) anda akan berstatus open dan siap direview oleh reviewer
    kode atau pemilik branch tujuan


Jadi setiap Ada perubahan source code yang Anda lakukan nantinya adalah:
a. Stage changes
b. Tulis komentar
c. Commit
d. Synchronize Changes

**Git Pull dan Fetch**
Perintah pull dan fetch akan sering Anda gunakan selama proyek. Pull berarti Anda
ingin menarik seluruh commit atau perubahan terbaru dari branch remote, dan pada branch
lokal Anda sedang tidak ada perubahan atau commit. Format perintahnya adalah:
git pull origin <nama_branch>. Contoh:

C:\xampp\htdocs\thesis-1> git pull origin development, lalu **Enter**
From https://github.com/ardiansyah-sweng/prpl
* branch development -> FETCH_HEAD
Merge made by the 'recursive' strategy.
README.md | 5 ++++-
bangun_ruang.php | 15 +++++++++++----
2 files changed, 15 insertions(+), 5 deletions(-)

Sedangkan bila di branch lokal Anda sudah ada perubahan atau commit, dan di remote
branch juga sudah ada perubahan maka git fetch akan lebih sesuai.


**Perintah-Perintah Dasar Pada Git**
git config --list

**Mengubah repo URL**
git config --get remote.origin.url
git remote set-url origin
https://github.com/ardiansyah-sweng/latihan.git

**Melihat riwayat perubahan**
git log

**Melihat status working tree**
git status

**Mengubah credential Github**
https://stackoverflow.com/questions/47465644/github-remote-permission-denied

**Periksa Branch Remote**
PS D:\erp_rpl> git fetch origin
PS D:\erp_rpl> git branch -r
origin/database/purchase_order
origin/feature/supplier
origin/main

**Membuat Branch Lokal**
PS D:\erp_rpl> git checkout -b database/purchase_order origin/database/purchase_order
branch 'database/purchase_order' set up to track 'origin/database/purchase_order'.
Switched to a new branch 'database/purchase_order'
PS D:\erp_rpl> git branch
* database/purchase_order
main

Mempush Branch Lokal ke Remote


## Dasar-Dasar Laravel 8

**Konfigurasi Dasar Laravel**

1. Mengamankan data menggunakan Application Key
    a. Ketik perintah C:\xampp\htdocs\wealthrecord>php artisan
       key:generate. Ini akan menghasilkan file .env pada direktori root. File
       berisi string dengan panjang 32 karakter
    b. Keluar pesan Application key set successfully yang menunjukkan key berhasil
       dibuat
2. Pengaturan untuk direktori public

**Direktori Proyek Laravel**
Buka aplikasi **Visual Studio Code** yang selanjutnya disingkat **VSCode** , lalu File>Open
Folder. Kemudian pilih folder wealthrecord.


**Hello World!**

Ketika berhasil menginstal laravel kita bisa lihat tampilannya seperti di
gambar berikut. Bagaimana cara kerjanya Laravel bisa menampilkan tampilan
tersebut?

Pertama-tama perhatikan kolom tautan localhost/wealthrecord/public. Lalu buka
file \wealthrecord\routes\web.php seperti berikut. Gunanya adalah sebagai
penunjuk/pengarah rute tautan yang akan digunakan.
Route::get('/', function () {

return view('welcome');

});

Kode di atas akan me- _return_ file welcome.blade.php yang ada pada folder
wealthrecord\resources\views. File welcome.blade.php inilah yang bertugas untuk

menampilkan output ke browser sehingga bisa dilihat pengguna.
Artinya, untuk menampilkan sesuatu ke browser, maka ada beberapa hal yang perlu
dipersiapkan yaitu:

1. Buat file nama_view.blade.php di folder views.
2. tentukan route-nya dan return nama file nama_view.blade.php

Setelah tahu caranya, sekarang sebagai rutinitas wajib ketika pertama kali belajar
pemrograman, kita akan coba menampilkan tulisan Hello world! ke browser.
Caranya:


1. Buat file hello.blade.php di folder views.
    Hello World!
2. Tentukan route-nya. Jika Anda tetap ingin di alamat
    [http://localhost/wealthrecord,](http://localhost/wealthrecord,) maka cukup ganti saja file :
    Route::get('/', function () {
    return view(welcome');
    });
    menjadi
    Route::get('/', function () {
    return view('greetings');
    });
    hasilnya:

```
Sedangkan jika Anda hendak menggunakan route lain, maka bisa
melakukannya dengan cara:
Route::get('/pertama', function () {
return view('greetings');
});
hasilnya:
```
Sekarang Anda sudah berhasil membuat tampilan pertama di web menggunakan
Laravel!


**Dashboard Wealth Record**
Dashboard adalah tampilan pertama kali yang muncul ketika menggunakan
aplikasi Wealth Record. Untuk itu kita akan lakukan langkah-langkah sbb:

1. **Pasang template bootstrap adminLTE atau SB Admin**. Pada buku ini saya
    akan menggunakan template SB Admin.
       a. Unduh SB Admin di https://startbootstrap.com/theme/sb-admin-2.
       b. Ekstrak file template di folder
          C:\xampp\htdocs\wealthrecord\wealthrecord\resources\ dan beri
          nama folder templatenya yaitu template.

```
c. Buka file index.html di browser dengan cara double klik. Hasilnya kita
akan lihat tampilan berikut.
```

d. Buat folder baru
C:\xampp\htdocs\wealthrecord\wealthrecord\resources\views\layo
uts
e. Salin file index.html tadi ke folder layouts tersebut.
f. Ubah nama file index.html menjadi template.blade.php.

g. Buka file \wealthrecord\routes\web.php, lalu ubah menjadi
Route::get('/', function () {
return view('layouts.template');
});
Ini dikarenakan kita akan membuka dashboard di halaman pertama
ketika user membuka aplikasi WR.
h. Selanjutnya coba buka kembali tautan aplikasi di browser, maka akan
tampil seperti berikut


```
Sampai sini kita sudah berhasil memanggil template dashboard.
Namun tampilannya masih belum friendly, karena css nya belum aktif. Untuk
itu kita perlu memodifikasi lebih lanjut.
```
**2. Modifikasi template**
    Buka file \wealthrecord\resources\views\layouts\template.blade.php.
    Lalu ubahlah:


bagian:
<link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet"

type="text/css">

menjadi
<link href="{{ url('template/vendor/fontawesome-free/css/all.min.css')
}}" rel="stylesheet" type="text/css">

bagian:
<link href="css/sb-admin-2.min.css" rel="stylesheet">

menjadi
<link href="{{ url('template/css/sb-admin-2.min.css') }}"

rel="stylesheet">

bagian:
<img class="sidebar-card-illustration mb-2" src="img/undraw_rocket.svg"
alt="">

menjadi
<img class="sidebar-card-illustration mb-2" src="{{

url('template/img/undraw_rocket.svg') }}" alt="">

bagian:
<img class="rounded-circle" src="img/undraw_profile_1.svg"

alt="">

menjadi
<img class="rounded-circle" src="{{

url('templateimg/undraw_profile_1.svg') }}"

alt="">

bagian:
<img class="rounded-circle" src="img/undraw_profile_2.svg"

alt="">

menjadi
<img class="rounded-circle" src="{{
url('templateimg/undraw_profile_2.svg') }}"

alt="">

bagian:
<img class="rounded-circle" src="img/undraw_profile_3.svg"
alt="">

menjadi
<img class="rounded-circle" src="{{
url('template/img/undraw_profile_3.svg') }}"

alt="">

bagian:
<img class="img-profile rounded-circle"
src="img/undraw_profile.svg">

menjadi


<img class="img-profile rounded-circle"
src="{{

url('template/img/undraw_profile.svg') }}">

bagian:
<img class="img-fluid px-3 px-sm-4 mt-3 mb-4" style="width: 25rem;"

src="img/undraw_posting_photo.svg" alt="">

menjadi
<img class="img-fluid px-3 px-sm-4 mt-3 mb-4" style="width: 25rem;"

src="{{

url('template/img/undraw_posting_photo.svg') }}" alt="">

bagian:
<!-- Bootstrap core JavaScript-->

<script src="vendor/jquery/jquery.min.js"></script>

<script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

<!-- Core plugin JavaScript-->

<script src="vendor/jquery-easing/jquery.easing.min.js"></script>

<!-- Custom scripts for all pages-->

<script src="js/sb-admin-2.min.js"></script>

<!-- Page level plugins -->

<script src="vendor/chart.js/Chart.min.js"></script>

<!-- Page level custom scripts -->

<script src="js/demo/chart-area-demo.js"></script>

<script src="js/demo/chart-pie-demo.js"></script>

menjadi
<!-- Bootstrap core JavaScript-->

<script src="{{ url('template/vendor/jquery/jquery.min.js')

}}"></script>
<script src="{{

url('template/vendor/bootstrap/js/bootstrap.bundle.min.js')

}}"></script>

<!-- Core plugin JavaScript-->

<script src="{{
url('template/vendor/jquery-easing/jquery.easing.min.js') }}"></script>

<!-- Custom scripts for all pages-->
<script src="{{ url('template/js/sb-admin-2.min.js') }}"></script>


```
<!-- Page level plugins -->
<script src="{{ url('template/vendor/chart.js/Chart.min.js')
}}"></script>
```
```
<!-- Page level custom scripts -->
<script src="{{ url('template/js/demo/chart-area-demo.js')
}}"></script>
<script src="{{ url('template/js/demo/chart-pie-demo.js')
}}"></script>
```
```
buka kembali tautan aplikasi http://localhost/wealthrecord/public
sehingga tampilannya menjadi:
```
Yes!, akhirnya kita berhasil memasang template dasbhoard aplikasi di
halaman utama.


**Membuat Database Menggunakan Eloquent**

**Cara Instalasi proyek laravel di local**

1. Pastikan sistem anda sudah terinstal composer

**Menampilkan gambar berasal dari database di laravel**

Pada file img di tabel pastikan menyertakan nama folder.

Ketik perintah:
php artisan storage:link, lalu keluar repons
The [C:\xampp\htdocs\tugas_akhir\public\storage] link has been
connected to [C:\xampp\htdocs\tugas_akhir\storage\app/public].

Pada file xxx.blade.php, cara menampilkannya seperti berikut:
<img src="{{ url($item->avatar) }}">


**Routes**
Route berguna mengatur lalu lintas request dari URL yang diminta pengguna ke **controller**.
Untuk mengubah-ubah routes ada di file routes/web.php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

use App\Http\Controllers\TopikController;

use App\Http\Controllers\LoginController;

/*

|--------------------------------------------------------------------------

| Web Routes
|--------------------------------------------------------------------------

|

| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which

| contains the "web" middleware group. Now create something great!

|
*/

Route::get('/Dashboard', [DashboardController::class, 'index']);

Route::post('/Topik', [TopikController::class, 'store']);
Route::get('/Topik/Add', [TopikController::class, 'index']);

Route::get('/Topik/All', [TopikController::class, 'all']);

Route::get('/', [LoginController::class, 'index']);
Route::post('/aksiLogin', [LoginController::class, 'aksiLogin']);

Setiap kali Anda membuat controller, jangan lupa untuk ditambahkan pada file
routes/web.php tersebut. Misalnya:
use App\Http\Controllers\NamaController;

Contoh kasus untuk menampilkan seluruh topik tugas akhir, maka saya
menambahkan route baru yaitu:
Route::get('/Topik/All', [TopikController::class, 'all']);

berarti akan menyiapkan route ke /Topik/All ketika ada request dalam bentuk

GET dari user. Request ini akan diteruskan/ditangani oleh controller

TopikController di fungsi/method all.


127.0.0.1:8000/supplier routenya:
Route::get('/supplier', [SupplierController::class,

'getSuppliers'])->name('supplier.index');

Jadi, /supplier itu URL, supplier.index nama yang mewakili /supplier

Pada SupplierController ada method getSuppliers()
public function getSuppliers($responseType = 'web')

Jadi, **‘getSuppliers’** pada route merupakan nama method **getSuppliers()** pada controller.

Agar bisa tampil di web, returnnya
return view('suppliers', [

'suppliers' => $suppliers,

'encryptedSupplierIds' => $encryptedSupplierIds,
'encryptedNames' => $encryptedNames,

'nextPONumbers' => $nextPONumbers

]);

view( **'suppliers'** ) merupakan file blade dari **suppliers** .blade.php.

name('supplier.index');

digunakan untuk dipanggil pada blade URL. Contoh:
<a href="{{ route('supplier.index') }}">New Supplier</a>


**Controller**
Perhatikan file controller TopikController.php berikut ini. Ada tiga method di dalamnya
yaitu index, all, dan store. Semua method ini sudah disiapkan di file routes/web.php
sebelumnya. Perhatikan pada method all. Di dalamnya berisi query untuk menampilkan
seluruh topik tugas akhir yang disort berdasarkan nama dosen yang sedang sign in saat ini
(dengan mengambil Session saat itu berupa nipy). Hasil query disimpan dalam variabel
$alltopikTA yang diredict ke bagian view dengan nama file
resources/views/all-topik.blade.php. Di controller dipanggil dengan menulis
all-topik saja.
<?php

namespace App\Http\Controllers;

use App\Models\Topik;

use App\Models\TopikTugasAkhir;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;

class TopikController extends Controller

{

public function index()
{

$topik = Topik::orderBy('topik_bidang', 'asc')->get();

return view('topik', compact('topik'));
}

# Query seluruh topik tugas akhir
public function all()

{

$nipy = Session::get('nipy');

$allTopikTA = DB::select('SELECT topik_bidang.topik_bidang,

dosen.nama, topik.judul_topik, topik.deskripsi, topik.status,

topik.nim_terpilih_fk, COUNT(ambil.topik_tugas_akhir_id) AS jumlah_pendaftar
FROM topik_tugas_akhir topik

JOIN dosen ON dosen.nipy = topik.nipy_fk_nipy

JOIN topik_bidang ON topik_bidang.id = topik.topik_bidang_fk_id


LEFT OUTER JOIN ambil_topik_tugas_akhir ambil ON
ambil.topik_tugas_akhir_id = topik.id

GROUP BY topik.id

ORDER BY dosen.nipy = '.$nipy.' DESC');

return view('all-topik')->with("allTopikTA", $allTopikTA);

}

# memvalidasi inputan data dan menyimpannya ke tabel

public function store(Request $request)
{

$request->validate([

'topik_bidang' => 'required',

'judul' => 'required|min:5',
'deskripsi' => 'required|min:5',

]);

if ($request) {

$store = new TopikTugasAkhir;

$store->nipy_fk_nipy = Session::get('nipy');
$store->topik_bidang_fk_id = $request->topik_bidang;

$store->judul_topik = $request->judul;

$store->deskripsi = $request->deskripsi;
$store->nim_terpilih_fk;

$store->save();

return redirect('/Topik/All')->with('success', 'Topik tugas akhir

berhasil di tambahkan');;

} else {
return redirect('/Topik/Add');

}

}

}

**View**
File all-topik.blade.php ini yang bertugas menampilkan seluruh hasil query pada
TopikController.php bagian method all ke laman web.
@extends('layouts.master')

@section('content')
<div class="content-wrapper">

<!-- Content Header (Page header) -->

@include('flash-message')


<section class="content-header">
<div class="container-fluid">

<div class="row mb-2">

<div class="col-sm-6">
<h1>Daftar Topik Skripsi</h1>

</div>

<div class="col-sm-6">
<ol class="breadcrumb float-sm-right">

<li class="breadcrumb-item"><a href="#">Topik</a></li>

<li class="breadcrumb-item active">Add</li>
</ol>

</div>

</div>

</div><!-- /.container-fluid -->
</section>

<a href="/Topik/Add">[Tambah topik]</a>
<br>

@foreach($allTopikTA as $item)

<?php
if ($item->status == 0 ){ $status = 'Open'; } # Konversi status menjadi

label {0 = Open, 1 = Closed}

if ($item->status == 1 ){ $status = 'Closed'; }
if ($item->nim_terpilih_fk == 0 ){ $mahasiswaTerpilih = 'Belum ada'; }

if ($item->jumlah_pendaftar == 0 ){ $jumlah_pendaftar = 'Belum ada'; }

if ($item->jumlah_pendaftar != 0 ){ $jumlah_pendaftar =
$item->jumlah_pendaftar; }

?>

Judul: {{ $item->judul_topik }} &nbsp;
Dosen: {{ $item->nama }} &nbsp;

Bidang: {{ $item->topik_bidang }} &nbsp;

Pendaftar: {{ $jumlah_pendaftar }} &nbsp;

Status: {{ $status }} &nbsp;
Terpilih: {{ $mahasiswaTerpilih }} &nbsp;

Aksi: view | edit | hapus <br>

@endforeach

@endsection

**Membuat Controller, Model, dan Action/Function**

1. Buka console lalu, masuk ke folder c:\xampp\htdocs\tatif


2. Buat controller dengan perintah
    php artisan make:controller ContentsController
3. Lihat direktori /app/Http/Controllers, maka akan muncul satu controller baru
    bernama ContentsController.php
    <?php

```
namespace App\Http\Controllers;
```
```
use Illuminate\Http\Request;
```
```
class ContentsController extends Controller
{
//
}
```
4. Selanjutnya buat Content untuk mapping dengan database. Inilah yang disebut
    ORM. Dengan ORM, kita tidak harus membuat kode SQL native (select * dll) di
    program yang dibuat, melainkan dengan menggunakan fungsi-fungsi PHP yang
    sudah disediakan oleh Laravel, sehingga kita tidak kesulitan jika database kita
    mengalami perubahan nama tabel, nama database, bahkan tipe RDBMS.
5. Buat model dengan menggunakan artisan dengan command:
    php artisan make:model Content
6. Lihat direktori /app/Models, maka akan tercipta satu file baru dengan nama
    Dosen.php yang jika dibuka seperti ini
    <?php

```
namespace App\Models;
```
```
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
```
```
class Dosen extends Model
{
use HasFactory;
}
```
**Konfigurasi Database di Laravel**
Buka file .env, lalu ganti untuk bagian yang perlu disesuaikan.
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=thesis
DB_USERNAME=root


DB_PASSWORD=

#### Membuat Tabel dengan Migration

Misalnya kita akan membuat tabel dosen, maka gunakan perintah:
C:\xampp\htdocs\tatif>php artisan make:migration create_dosen_table
Jika berhasil akan keluar pesan:
Created Migration: 2020_09_20_085807_create_dosen_table
Hasilnya bisa dilihat di folder:
\app\database\2020_09_20_085807_create_dosen_table.php.
Di dalam file terdapat dua method yaitu up() dan down(). Method up() untuk membuat
tabel, sedangkan down() untuk menghapus tabel atau _rollback_.
Secara default sudah ada dua kolom atau _field_ yang akan dibuat yaitu id dan
timestamps.
$table->id() untuk membuat id.
$table->timestamps() untuk membuat kolom atau field created_at dan update_at
secara otomatis.

Untuk membuat kolom/field lainnya, berikut daftar perintahnya:

$table->increments(‘id’) (^) membuat kolom yang menggunakan auto
increment dengan tipe int
$table->bigIncrements(‘id’) (^) membuat kolom dengan tipe BigInt
secara auto increment
$table->bigInteger(‘votes’) (^) membuat kolom vote dengan tipe BigInt
$table->boolean(‘confirmed’) (^) membuat kolom confirmed dengan tipe
boolean (TRUE atau FALSE)
$table->char(‘name’, 100) (^) membuat kolom name bertipe char dengan
panjang 100 karakter
$table->date(‘created_at’) (^) membuat kolom created_at bertipe date
$table->dateTime(‘create_at’) (^) membuat kolom created_at bertipe
datetime
$table->decimal(‘amount’, 8, 2) (^) membuat kolom amount bertipe decimal
$table->integer(‘votes’) (^) membuat kolom votes bertipe integer/int
$table->string(‘name’, 100) (^) membuat kolom name bertipe varchar dan
berukuran 100
$table->longText(‘description’) (^) membuat kolom dengan description bertipe
text yang panjang


$table->text(‘description’) (^) membuat kolom description bertipe text
$table->year(‘birth_year’) (^) membuat kolom birth_year bertipe year
Daftar perintah secara lengkap bisa diakses di
https://laravel.com/docs/8.x/migrations#columns
Setelah cukup, maka untuk mulai membuat tabel beserta kolom. Namun sebelumnya hapus
dulu ketiga file dalam folder migrations yang merupakan bawaan default setelah
menginstal Laravel. Setelah siap gunakan perintah:
C:\xampp\htdocs\tatif>php artisan migrate
Jika sukses keluar tulisan:
Migration table created successfully.
**Membatalkan Migration**
php artisan migrate:rollback
atau
php artisan migrate:reset
**Mengubah nama tabel**
Format perintah:
php artisan make:migration change_namatabellama_to_namatabelbaru_table
Contoh:
php artisan make:migration change_dosen_to_dosentif_table
Jika berhasil maka keluar pesan:
Created Migration:
2020_09_20_100439_change_dosen_to_dosentif_table
Tercipta file change_dosen_to_dosentif_table di dalam folder
/app/database/migrations. Lalu buka file tersebut.
Di function up() tambahkan baris kode berikut:
Schema::rename(‘dosen’, ‘dosentif’)
Kemudian ketik pada command shell perintah:
C:\xampp\htdocs\tatif>php artisan migrate
Migrating: 2020_09_20_100439_change_dosen_to_dosentif_table
Migrated: 2020_09_20_100439_change_dosen_to_dosentif_table (32.01ms)
Cek PHPMyadmin dan lihat perubahan nama tabel tersebut.
**Mengubah Default Value Suatu Kolom/Field MySQL**
Jika diperhatikan, default value kolom created_at dan updated_at setiap kali berhasil
membuat tabel adalah NULL. Padahal kebutuhan kita adalah setiap kali insert data baru
otomatis berisi data TIMESTAMP. Untuk itu lakukan langkah berikut:

1. Ketik perintah:
    C:\xampp\htdocs\thesis-1> php artisan make:migration
    dosen_set_created_at_default_value
    Created Migration: 2020_09_22_091259_dosen_set_created_at_default_value


2. Pada file yang terbentuk beri kode berikut:
3. Pada bagian atas berikan baris berikut:
    use Illuminate\Support\Facades\DB;
a. lalu di fungsi up()
public function up()
{
DB::statement("ALTER TABLE dosen CHANGE created_at
created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP");
}

```
b. di fungsi down()
public function down()
{
Schema::table('dosen', function (Blueprint $table) {
```
```
$table->timestamp('created_at')->default(NULL)->change();
});
}
```
4. Akhiri dengan php artisan migrate
5. Ikuti cara yang sama untuk mengubah default value updated_at

**Menambah Field/Kolom Baru di Sebuah Tabel**

1. Ketik perintah:
    C:\xampp\htdocs\thesis-1> php artisan make:migration
    add_jabfung_to_dosen_table --table=dosen
    Created Migration: 2020_09_22_075114_add_jabfung_to_dosen_table
2. Edit file yang tercipta sbb:
    public function up()
    {
    Schema::table('dosen', function (Blueprint $table) {
    $table->char('jabfung');
    });
    }
    dan
    public function down()
    {
    Schema::table('dosen', function (Blueprint $table) {
    $table->dropColumn('jabfung');
    });
    }
3. Akhiri dengan perintah:
    PS C:\xampp\htdocs\thesis-1> php artisan migrate
    Migrating: 2020_09_22_075114_add_jabfung_to_dosen_table


```
Migrated: 2020_09_22_075114_add_jabfung_to_dosen_table (15.64ms)
```
**Insert Data ke Tabel (Seeder)**
Kita bisa menginsert serangkaian data ke tabel langsung melalui codingan di Laravel.
Caranya:

1. Ketik perintah: php artisan make:seeder DosenSeeder
    Tercipta folder **seeder** dengan file DatabaseSeeder dan DosenSeeder di
    dalamnya
2. Pada file DatabaseSeeder di fungsi run(), ketik perintah:
    public function run()
    {
    $this->call(DosenSeeder::class);
    }
3. Pada file DosenSeeder di fungsi run(), ketik perintah:
    public function run()
    {
    DB::table('dosen')->insert([
    'nipy' => '001',
    'nama' => 'Eko Aribowo, S.T., M.Kom.',
    'jabfung' => 'LK',
    ]);

```
DB::table('dosen')->insert([
'nipy' => '002',
'nama' => 'Ali Tarmuji, S.T., M. Cs.',
'jabfung' => 'AA',
]);
```
```
DB::table('dosen')->insert([
'nipy' => '003',
'nama' => 'Fiftin Noviyanto S.T., M. Cs.',
'jabfung' => 'L',
]);
...
dst....
}
```
4. Jalankan **seeder** dengan perintah:
    a. Ketik composer dump-autoload, ketik Enter
    b. Ketik php artisan db:seed, lalu Enter
Dinyatakan berhasil bila keluar pesan:
Seeding: Database\Seeders\DosenSeeder
Seeded: Database\Seeders\DosenSeeder (22.32ms)
Database seeding completed successfully.
    c. Periksa tabel di PHPMyadmin, seharusnya sudah berisi data baru.


**Migrate tabel tertentu**
php artisan migrate:refresh
--path=/database/migrations/2021_06_21_003813_create_otp_table.php

**Migrate seeder tertentu**
php artisan db:seed --class=<nameOfSeeder>
contoh:
php artisan db:seed --class=OTPSeeder

###### Membuat Data Dummy Menggunakan Faker

Data lokal
use Faker\Factory as Faker;

$faker = Faker::create('id_ID');

**Membangkitkan alfabet A-Z**
for($i= 65 ; $i <= 90 ; $i++){

echo chr($i)."\n";
}

**Nomor Telepon**
$faker->phonenumber

**Membuat angka terformat**
$formattedPhone = $faker->numerify('(###) ###-####');

**Membuat Factory**
PS C:\xampp\htdocs\thesis-1> php artisan make:factory TopikFactory
Factory created successfully.

**Menggunakan tinker**
C:\xampp\htdocs\thesis-1> php artisan tinker, tekan **Enter**

**Referensi:
6 Tips About Data Seeding in Laravel - Laravel Daily**

Psy Shell v0.10.4 (PHP 7.4.10 — cli) by Justin Hileman
>>> Topik::factory()->count(5)->create();
[!] Aliasing 'Topik' to 'App\Models\Topik' for this Tinker
session.
=> Illuminate\Database\Eloquent\Collection {#3280
all: [
App\Models\Topik {#3284


topik_bidang: "Sed reprehenderit ratione voluptates
maiores vitae quod necessitatibus. Alias beatae omnis dolor.",
updated_at: "2020-10-09 04:01:27",
created_at: "2020-10-09 04:01:27",
id: 18,
},
App\Models\Topik {#3285
topik_bidang: "Non id qui qui et dolores odit. Nesciunt
esse ullam aut id
praesentium. Qui quo eius eum quisquam.",
updated_at: "2020-10-09 04:01:27",
created_at: "2020-10-09 04:01:27",
id: 19,
},
App\Models\Topik {#3286
topik_bidang: "Atque sit voluptatem occaecati debitis ea.
Aut in veritatis iusto velit est laborum.",
updated_at: "2020-10-09 04:01:27",
created_at: "2020-10-09 04:01:27",
id: 20,
},
App\Models\Topik {#3287
topik_bidang: "Cum magnam et minus voluptas et ducimus.
In quod quia hic.
Omnis quo harum laborum nulla.",
created_at: "2020-10-09 04:01:27",
id: 21,
},
App\Models\Topik {#3288
topik_bidang: "Voluptas dicta ipsa atque ipsa quasi.
Eaque vero delectus totam.",
updated_at: "2020-10-09 04:01:27",
created_at: "2020-10-09 04:01:27",
id: 22,
},
],
}

Kita bakal sering membuat tabel, seeder khusus tabel tertentu. Untuk itu cukup dilakukan:
php artisan migrate:fresh, dilanjutkan dengan
php artisan db:seed

**Memberi Foreign Key (FK) suatu field**
Misalnya ada ada dua tabel yaitu dosen (field: nipy PK) dan topik_ta (field: nipy_fk FK).
Kita hendak memberi FK ke field nipy_fk, maka lakukan:

Pertama Anda harus beri index dulu ke field yang akan berjenis FK


$table->index(‘nipy_fk’);

Buat FK dengan action on cascade
$table->foreign(‘nipy_fk’)->reference(‘nipy’)->on(‘dosen’)->onDele
te(‘cascade’);

**Membuat Primary Key (PK) Ketika bersamaan membuat tabel**
$table->string('nipy', 3 )->primary();

**Mereset seluruh skema tabel beserta seeder**
php artisan migrate:fresh

**Mengaktifkan Clause GROUP BY**
Ketika ada query Anda yang menggunakan clause GROUP BY, dan muncul error kurang
lebih sepert ini:
SQLSTATE[42000]: Syntax error or access violation: 1055
'sbrtpt.loading.id' isn't in GROUP BY (SQL: select * from loading
where id in (14, 15, 16) group by vehicle_no)
Cara mengatasinya adalah dengan membuka file config\database.php
Cari bagian strict, kemudian ubah nilai true menjadi false. Lalu simpan filenya.
'mysql' => [

'driver' => 'mysql',
'url' => env('DATABASE_URL'),

'host' => env('DB_HOST', '127.0.0.1'),

'port' => env('DB_PORT', '3306'),
'database' => env('DB_DATABASE', 'forge'),

'username' => env('DB_USERNAME', 'forge'),

'password' => env('DB_PASSWORD', ''),

'unix_socket' => env('DB_SOCKET', ''),
'charset' => 'utf8mb4',

'collation' => 'utf8mb4_unicode_ci',

'prefix' => '',
'prefix_indexes' => true,

'strict' => false,

'engine' => null,
'options' => extension_loaded('pdo_mysql')? array_filter([

PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),

]) : [],
],

**Membuat Form**
Jika mengalami error begini:


Class 'Form' not found (View:
C:\xampp\htdocs\thesis-1\resources\views\details_tugas_akhir.blade
.php)
maka lakukan perintah berikut:
composer require laravelcollective/html
atau composer update laravelcollective/html

Jangan lupa tambahkan script @csrf di bawah form action
<form role="form" method="POST" action="/Topik/Decision/">

@csrf

**Mengirim email**
Setting laravel di file .env menyediakan pilihan mengirim email lewat **mailtrap.io atau
temp-mail.org**. Untuk itu buat akun di mailtrap.io. Lalu setelah sukses membuat akun, Anda
buka Demo Inbox. Lalu ubah konfirugasi .env mengikuti yang disediakan oleh mailtrap.io.

Buka file .env dan edit bagian di bawah dengan isian yang sudah disiapkan.
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=4a5e58f13c1bb5
MAIL_PASSWORD=ef21db41701237
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="admin@siatif.uad.ac.id"
MAIL_FROM_NAME="Siatif UAD"

Selanjutnya buat class Mailable di laravel. Ketik perintah
php artisan make:mail EmailMahasiswaTerpilih
--markdown=Email.EmailMahasiswaTerilih, ketik enter. Akan tercipta class


mailable EmailMahasiswaTerpilih.php yang terletak di
app/Mail/EmailMahasiswaTerpilih.php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;

use Illuminate\Contracts\Queue\ShouldQueue;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmailMahasiswaTerpilih extends Mailable
{

use Queueable, SerializesModels;

/**

* Create a new message instance.

*

* @return void
*/

public function __construct()

{
//

}

/**

* Build the message.

*
* @return $this

*/

public function build()
{

return $this->markdown('Email.EmailMahasiswaTerilih');

}

}

Buat route baru pada routes/web.php dengan menambahkan:
Route::get(‘/kirimemail’, [TopikController::Class,’’]

Python
Menjalankan server
python .\run.py



**Semua tentang Data di Laravel**

**print_r()**
Array ( [0] => stdClass Object ( [nilaiKekayaan] => 578343355
[periodeWealth] => 2020-12-02 ) [1] => stdClass Object ( [nilaiKekayaan]
=> 588666302 [periodeWealth] => 2020-12-16 ) )

**var_dump()**
array(2) { [0]=> object(stdClass)#273 (2) { ["nilaiKekayaan"]=> string(9)
"578343355" ["periodeWealth"]=> string(10) "2020-12-02" } [1]=>
object(stdClass)#278 (2) { ["nilaiKekayaan"]=> string(9) "588666302"
["periodeWealth"]=> string(10) "2020-12-16" } }

**dd()**
array:2 [▼
0 => {#273 ▼ +"nilaiKekayaan": "578343355" +"periodeWealth":
"2020-12-02" }
1 => {#278 ▼ +"nilaiKekayaan": "588666302" +"periodeWealth":
"2020-12-16" }
]

**JSON
Data bentuk objek dikonversi ke JSON
[{"namaAkun":"BCA","jenisAkun":"Aset Bank"},{"namaAkun":"BPD Syariah
Nining","jenisAkun":"Aset Bank"},{"namaAkun":"BPD Nining","jenisAkun":"Aset
Bank"},{"namaAkun":"BPD Syariah Ardi","jenisAkun":"Aset Bank"},{"namaAkun":"BPD
Ardi","jenisAkun":"Aset Bank"},{"namaAkun":"RDN IPOT","jenisAkun":"Aset
Bank"},{"namaAkun":"BBNI","jenisAkun":"Aset Saham"},{"namaAkun":"BRPT","jenisAkun":"Aset
Saham"},{"namaAkun":"PTBA","jenisAkun":"Aset Saham"},{"namaAkun":"Sucorinvest
RDPU","jenisAkun":"Aset Reksadana"},{"namaAkun":"Mandiri RDPU","jenisAkun":"Aset
Reksadana"},{"namaAkun":"Bahana RDPU","jenisAkun":"Aset Reksadana"},{"namaAkun":"BNI-AM
RDPU","jenisAkun":"Aset Reksadana"}]**

data dari JSON diubah ke bentuk array

Konversi ke array
print_r( json_decode( json_encode($this->model->getNilaiKekayaanEachPeriod()),

true ));

Hasilnya:
Array ( [0] => Array ( [nilaiKekayaan] => 578343355 [periodeWealth] =>
2020-12-02 ) [1] => Array ( [nilaiKekayaan] => 588666302 [periodeWealth]
=> 2020-12-16 ) )

Agar list data berupa objek bisa diubah menjadi string, maka diubah dengan perintah
json_encode($obj->data). Ini biasanya nanti digu

$array = array_map(function ($v) { return (array) $v ; // convert to array }, $array);


**Membuat Helpers**

Terkadang kita membutuhkan fungsi yang bersifat generik. Artinya fungsi
tersebut bisa digunakan dari mana saja alias global. Misalnya menghitung
persentase, menghitung tingkat pertumbuhan, konversi nilai tertentu, memformat
tampilan, dan seterusnya. Di sinilah kita memerlukan helper. Untuk membuat helper
di Laravel adalah sebagai berikut.

1. Buat file helper di folder \wealthrecord\app\helper.php
2. Buat fungsi-fungsi yang dibutuhkan
    <?php

```
/**
* Hitung tingkat pertumbuhan dalam persen
*/
function helperHitungTingkatPertumbuhan($nilaiAwal, $nilaiAkhir)
{
return ($nilaiAkhir - $nilaiAwal) / $nilaiAwal * 100 ;
}
```
```
/**
* Hitung persentase
*/
function helperHitungPersentase($nilaiPembilang, $nilaiPenyebut)
{
return $nilaiPembilang / $nilaiPenyebut * 100 ;
}
```
3. Buka file \wealthrecord\composer.json. Lihat bagian autoload
    "autoload": {
    "psr-4": {
    "App\\": "app/",
    "Database\\Factories\\": "database/factories/",
    "Database\\Seeders\\": "database/seeders/"
    }
    },
    tambahkan file helper seperti berikut
    "autoload": {
    "psr-4": {
    "App\\": "app/",
    "Database\\Factories\\": "database/factories/",
    "Database\\Seeders\\": "database/seeders/"
    },
    "files": [
    "app/helper.php"


```
]
},
```
4. Aktifkan helper dengan perintah
    PS C:\xampp\htdocs\wealthrecord> composer dump-autoload
    Generating optimized autoload files
    > Illuminate\Foundation\ComposerScripts::postAutoloadDump
    > @php artisan package:discover --ansi
    Discovered Package: facade/ignition
    Discovered Package: fideloper/proxy
    Discovered Package: fruitcake/laravel-cors
    Discovered Package: laravel/sail
    Discovered Package: laravel/tinker
    Discovered Package: nesbot/carbon
    Discovered Package: nunomaduro/collision
    Package manifest generated successfully.
    Generated optimized autoload files containing 4619 classes
5. Panggil langsung fungsi helper pada controller seperti contoh berikut
    /**
    * Menampilkan nilai kekayaan terbaru ke Dashboard
    */
    function displayKekayaanKeDashboard()
    {
       ...
    ...
    return view('index', [
       ...
    number_format(helperHitungTingkatPertumbuhan($nilaiKekayaanAwal,
    $nilaiKekayaanSekarang), 2 ),
    'potensiHasilInvestasi' =>
    number_format($nilaiInvestasiSekarang),
    'persentaseHasilInvestasi' =>
    number_format(helperHitungPersentase($nilaiInvestasiSekarang,
    $nilaiKekayaanAwal), 2 ),
       ...
    ]);
    }


**Application Programming Interface (API)**

1. Unduh dan instal chrome extention Postman di
    https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbn
    cdddomop?hl=id
2. Buka Postman, lalu pilih GET request, kemudian copy-paste tautan berikut
    https://reqres.in/api/users, lalu tekan tombol Send. Hasilnya akan
    ditampilkan seperti berikut.

Sekarang kita coba membuat API sendiri. Lakukan langkah sebagai berikut:

1. Buat controller misalnya APIController dengan perintah php artisan
    make:controller APIController
2. Tambahkan use App\Models\WealthModel; lalu buat fungsi konstruktor dan
    sebuah fungsi API.


```
<?php
```
```
namespace App\Http\Controllers;
```
```
use Illuminate\Http\Request;
use App\Models\WealthModel;
```
```
class APIController extends Controller
{
public function __construct(WealthModel $model)
{
$this->model = $model;
}
```
```
function getAPIKekayaan()
{
return
json_encode($this->model->hitungNilaiInvestasiSekarang());
}
}
```
3. Kemudian jalankan API menggunakan Postman, hasilnya akan menjadi
    seperti berikut


**Mengakses API dari luar menggunakan HTTPClient**
Pastikan kita sudah tahu endpoint atau tautan API nya dan juga tentu API
Key. API Key diperoleh biasanya ketika melakukan pendaftaran. Sebagai contoh
saya menggunakan API stock quotes dari https://fcsapi.com/api-v3/stock/

1. Buat controller. Saya akan membuat StockController dengan perintah php
    artisan make:controller StockController
2. Buka dan edit file \app\Http\Controllers\StockController.php
    <?php

```
namespace App\Http\Controllers;
```
```
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
class StockController extends Controller
{
function index()
{
$API_KEY = 'API_KEY_ANDA';
$kodeEmiten = ['EKAD','HRTA','KLBF','ICBP','BULL'];
$kodeEmitenInJson = implode(",",$kodeEmiten);
```
```
$collLatestPrice =
Http::get("https://fcsapi.com/api-v3/stock/latest?symbol=$kodeEmitenInJ
son&access_key=$API_KEY");
```
```
return
view('stock',['collection'=>$collLatestPrice['response']]);
}
}
```
3. Buka dan edit file \routes\web.php. Tambahkan skrip
    use App\Http\Controllers\StockController;
    Route::get("stock", [StockController::class, 'index']);
4. Tampilkan ke view dengan membuat file
    \resources\views\stock.blade.php. Lalu buat skrip tabel
    <table border="1">
    <tr>
    <td><strong>Kode</strong></td>
    <td><strong>Last Price</strong></td>
    </tr>
    @foreach($collection as $item)
    <tr>


```
<td>{{$item['s']}}</td>
<td>{{$item['c']}}</td>
</tr>
@endforeach
</table>
```
##### AJAX

AJAX sesuai digunakan untuk:
Form validation
Light box
Sort atau filter
Vote atau rating
Chat website
Blog comments
Captcha
Details dynamic data in modal
Alert or warning

**Setup Laravel Project**

1. Clone proyek di repo lokal pada laptop
2. Install dependencies menggunakan composer
C:\xampp\htdocs\tugas_akhir> composer install
3. Salin file .env
cp .env.example .env
4. Bulat kunci aplikasi
C:\xampp\htdocs\tugas_akhir> php artisan key:generate

Application key set successfully.

5. Buat database baru
6. Modifikasi file .env

DB_CONNECTION=mysql

DB_HOST=127.0.0.1

DB_PORT=3306

DB_DATABASE=laravel

DB_USERNAME=root

DB_PASSWORD=

pada bagian DB_DATABASE diubah menjadi nama database Anda. Contoh:


DB_DATABASE = simtakhir

7. Lakukan migrate database

C:\xampp\htdocs\tugas_akhir> php artisan migrate

8. Lakukan seed database (jika menggunakan seeder)

C:\xampp\htdocs\tugas_akhir> php artisan db:seed

**Deploy Source Code dari Github ke Hosting**

1. Buat folder ./github/workflows
2. Di dalam folder workflow tersebut, buat dua file .yml:
    - master.yml, untuk server production
    - development.yml, untuk server development
3. Isi file master.yml
Sebelumnya pastikan dulu membuat folder public_html/simtakhir
on:

push:

branches:

- master

name: 🚀 Deploy website on push
jobs:

web-deploy:

name: 🎉 Deploy


runs-on: ubuntu-latest
steps:

- name: 🚚 Get latest code

uses: actions/checkout@v2

- name: 📂 Sync files

uses: SamKirkland/FTP-Deploy-Action@4.1.0
with:

server: ${{ secrets.server }}

username: ${{ secrets.ftp_username }}
password: ${{ secrets.ftp_password }}

server-dir: /public_html/simtakhir/

4. Isi file development.yml
Sebelumnya pastikan dulu membuat folder public_html/development.simtakhir
on:

push:
branches:

- development

name: 🚀 Deploy website on push

jobs:

web-deploy:
name: 🎉 Deploy

runs-on: ubuntu-latest

steps:

- name: 🚚 Get latest code

uses: actions/checkout@v2

- name: 📂 Sync files

uses: SamKirkland/FTP-Deploy-Action@4.1.0

with:
server: ${{ secrets.server }}

username: ${{ secrets.ftp_username }}

password: ${{ secrets.ftp_password }}

server-dir: /public_html/development.simtakhir/

C:\xampp\htdocs\sinau-php> git add.


C:\xampp\htdocs\tugas_akhir> git commit -m "Add yaml github workflows"
[master f1657be] Add yaml github workflows
2 files changed, 44 insertions(+)
create mode 100644 .github/workflows/development.yml
create mode 100644 .github/workflows/master.yml

Masuk ke folder aplikasi public_html/simtakhir
Instal dependensi file dengan composer install


**DEPLOY LARAVEL KE HEROKU**

1. Buat akun heroku di heroku.com
    Gunakan **email** dan **username** github kamu untuk akun di heroku.
2. Buat app baru di heroku
3. Beri nama aplikasi yang diinginkan, misalnya proyek-laravel, atau relata, atau yang
    lain sesuai yang kamu inginkan. Lalu klik **Create app**
4. Jika sukses, akan muncul tampilkan berikut
5. Download dan instal Heroku CLI
    https://devcenter.heroku.com/articles/heroku-command-line


6. Setelah sukses instal Heroku CLI, kemudian buka console di windows menggunakan
    cmd, lalu masuk ke folder htdocs
7. Periksa apakah Heroku CLI sudah sukses terinstal dengan perintah
    C:\xampp\htdocs>heroku --version
    Keluar respon:
    heroku/7.56.0 win32-x64 node-v14.15.3
8. Login ke heroku
    C:\xampp\htdocs>heroku login
    hasilnya:
    heroku login
    heroku: Press any key to open up the browser to login or q to exit:
    tampil juga di browser seperti ini:

```
Klik Log In
```

```
Di console juga akan muncul:
Opening browser to
https://cli-auth.heroku.com/auth/cli/browser/werwer243234wfrwer
Logging in... done
Logged in as username@outlook.com
```
9. Setelah berhasil login ke heroku, masuk ke folder proyek laravel yang telah dibuat
    sebelumnya. Sebagai contoh proyek laravel yang digunakan adalah proyek relata.
    C:\xampp\htdocs>cd relata

```
Catatan:
Kamu harus menginstal laravel terlebih dahulu. Jika lupa silakan baca dan coba di
buku ini bagian Instalasi Laravel di halaman 6.
```
10. Initialisasi git dengan perintah:
    C:\xampp\htdocs\relata>git init
    Hasilnya:
    Initialized empty Git repository in C:/xampp/htdocs/relata/.git/
11. Lihat key proyek laravel dengan perintah:
    C:\xampp\htdocs\relata>php artisan key:generate --show
    akan muncul:
    base64:123412341wewrwer424234=
12. Lihat daftar apps yang sudah kamu miliki di heroku dengan perintah:
    C:\xampp\htdocs\relata>heroku apps
    keluar hasil:
    === username@outlook.com Apps
    calm-meadow-10251
    proyek-laravel
    relata
13. Konfirugasi key ke heroku dengan perintah


```
C:\xampp\htdocs\relata>heroku config:set APP_KEY=2342werw23424234= --app
relata
keluar hasil:
Setting APP_KEY and restarting ⬢ relata... done, v3
APP_KEY: base64:2341234werqwer241234123+hs=
```
14. Buat remote git dengan perintah
    C:\xampp\htdocs\relata>heroku git:remote -a relata
    hasilnya:
    set git remote heroku to https://git.heroku.com/relata.git
15. Mulai deploy dengan perintah:
    C:\xampp\htdocs\relata>git add.
    kemudian
    C:\xampp\htdocs\relata>git commit -am “proyek deploy pertama”
    akhiri dengan perintah
    C:\xampp\htdocs\relata>git push heroku master
    Tunggu proses, hingga hasil akhirnya seperti ini:
    remote: Verifying deploy... done.
    To https://git.heroku.com/relata.git
    * [new branch] master -> master
16. Buka kembali web heroku di apps yang sudah dibuat, misalnya relata, maka akan
    tampil seperti ini
17. Klik **Open app** , dan selamat! proyek laravel anda sudah sukses dideploy ke server
    heroku


Jika awalnya muncul tampilkan
**Forbidden**
You don't have permission to access this resource.

maka cukup tambahkan di url **relata.herokuapp.com/public** lalu enter.

**Clone private repository github**

1. Buka


$ cat ~/.ssh/id_rsa.pub
ssh-rsa
AAAAB3NzaC1yc2EAAAADAQABAAABgQC3gYeWbIffUtfEvzNW4aJQHp4zUtSuAE9apK+
QrA8KOd4hNwP0Sts1paRMCAHrlhANu7Pm4rLp6TjTp2m1plO/CP9/i5hNJqe4I31HW9dY0v
+N6PxOyqury91THFvcm832RW4wcooHczZ0SfV+CNkhK+3ckgAME4PInZxmj+wHCsVNxeS
z/QwUCVdhvbAqz2SKWRlDBjgFGn4XpvuX0zR2XGqlBiIIXg1AFmN/aUsm5r+QpsnBZ+w6w
H2tizkzPODCF6+A3Sqw0fxrVdA6FhRP8RcZ2rQ18cs6QzZ2WrFq2FZ2LZEQ9eoheAUlrzjhE
l7PieknXDUt3o084o8dn/wOSSY7qDTj6lS2vXxDwXxz/NBtzTrLN8nMxk3OH8jCirPdCJdyLdJ
8dBCoMI2LDsvJ0wSaApDKEemAAkGQgjCi/XWLLlLvY4srxUj1


$ git clone git@github.com:ardiansyah-sweng/relata.git
Cloning into 'relata'...


Setiap selepas instalasi Laravel dan akan mencoba route baru, pastikan bahwa Anda telah
membuang tanda comment pada config/app.php
/*
* Application Service Providers...

*/

App\Providers\AppServiceProvider::class,
App\Providers\AuthServiceProvider::class,

// App\Providers\BroadcastServiceProvider::class,

App\Providers\EventServiceProvider::class,
App\Providers\RouteServiceProvider::class,

menjadi
/*
* Application Service Providers...

*/

App\Providers\AppServiceProvider::class,
App\Providers\AuthServiceProvider::class,

App\Providers\BroadcastServiceProvider::class,

App\Providers\EventServiceProvider::class,

App\Providers\RouteServiceProvider::class,

**Autosave pada Visual Studio Code**
File > Autosave



##### Membaca file Excel di PHP

Helper yang digunakan adalah PHPSpreadsheet

Instal menggunakan composer. Jika belum instal composer silakan baca di bagian Instalasi
Composer di buku ini
C:\xampp\htdocs\kuper> composer require phpoffice/phpspreadsheet


###### CRUD Laravel

```
A. Create
a. Membuat form
b. Validasi form
i. Empty field
ii. Minimum entry required
iii. Mencegah repost
iv. Mencegah unselect
v. Alert validation bootstrap
c. Proteksi form
d. Submit form
i. Flash alert success/error
```
1. Buat file flash di view.
2. Taruh potongan kode flash di halaman yang hendak
    ditampilkan flashnya
3. Check create new record is success
B. Read
C. Update
D. Delete

###### Summernote Editor

```
● Instalasi
● Pemakaian di Laravel
● Preview hasil editor
● Menyimpan file
● Mengedit
```
###### Error Handling

HTTP
Database

Perbedaan composer dump-autoload dan composer update

Membuat autoloading PSR
Autoloading di PHP dan Implementasinya menggunakan PSR-4 | by Wahyudi Wibowo |
Koding Kala Weekend | Medium

Form validation di Modal
javascript - How to correctly validate a modal form - Stack Overflow

##### Composer Init

PS C:\xampp\htdocs\seeval> composer init

Welcome to the Composer config generator


This command will guide you through creating your composer.json config.

Package name (<vendor>/<name>) [1/seeval]: seeval/optimizer-composer
Description []: Teknik optimasi metaheuristik
Author [ardiansyah-sweng <ardiansyah.2019@outlook.com>, n to skip]: Ardiansyah
<ardiansyah@tif.uad.ac.id>
Minimum Stability []:
Package Type (e.g. library, project, metapackage, composer-plugin) []: project
License []: GPL

Define your dependencies.

Would you like to define your dependencies (require) interactively [yes]? no
Would you like to define your dev dependencies (require-dev) interactively
[yes]? no
Add PSR-4 autoload mapping? Maps namespace "Seeval\OptimizerComposer" to the
entered relative path. [src/, n to skip]:

{
"name": "seeval/optimizer-composer",
"description": "Teknik optimasi metaheuristik",
"type": "project",
"license": "GPL",
"autoload": {
"psr-4": {
"Seeval\\OptimizerComposer\\": "src/"
}
},
"authors": [
{
"name": "Ardiansyah",
"email": "ardiansyah@tif.uad.ac.id"
}
],
"require": {}
}

Do you confirm generation [yes]? yes
Generating autoload files
Generated autoload files
PSR-4 autoloading configured. Use "namespace Seeval\OptimizerComposer;" in src/
Include the Composer autoloader with: require 'vendor/autoload.php';


##### Message Broker

Instalasi RabbitMQ Server

Instal Erlang
Instal RabbitMQ

Aktifkan GUI

C:\Program Files\RabbitMQ Server\rabbitmq_server-3.8.25\sbin>rabbitmq-plugins enable
rabbitmq_management
Enabling plugins on node rabbit@dwpr:
rabbitmq_management
The following plugins have been configured:
rabbitmq_management
rabbitmq_management_agent
rabbitmq_web_dispatch
Applying plugin configuration to rabbit@dwpr...
The following plugins have been enabled:
rabbitmq_management
rabbitmq_management_agent
rabbitmq_web_dispatch

started 3 plugins.

**RabbitMQ Delayed Message**

Unduh plugin berekstensi .ez dari:
https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/3.9.0/r
abbitmq_delayed_message_exchange-3.9.0.ez


Aktifkan
C:\Program Files\RabbitMQ Server\rabbitmq_server-3.8.25\sbin>rabbitmq-plugins enable
rabbitmq_delayed_message_exchange
Enabling plugins on node rabbit@dwpr:
rabbitmq_delayed_message_exchange
The following plugins have been configured:
rabbitmq_delayed_message_exchange
rabbitmq_management
rabbitmq_management_agent
rabbitmq_web_dispatch
Applying plugin configuration to rabbit@dwpr...
The following plugins have been enabled:
rabbitmq_delayed_message_exchange

started 1 plugins.


Tambah Exchange

Tambah Queue



Referensi:
https://www.onlinetutorialspoint.com/windows/how-to-install-rabbitmq-on-windows-10.html
Delayed Job menggunakan RabbitMQ. Seperti problem yang sebelumnya pernah... | by Eko
Kurniawan Khannedy | Programmer Zaman Now | Medium


**MySQL**

**Masuk ke shell command menggunakan port tertentu**
PS C:\WINDOWS\system32> mysql -u root -p -P 3307
Enter password: ***************
Welcome to the MySQL monitor. Commands end with ; or \g.
Your MySQL connection id is 12
Server version: 8.0.37 MySQL Community Server - GPL

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

**Membuat database baru**
mysql> create DATABASE erp_procurement;
Query OK, 1 row affected (0.01 sec)

**Instalasi PHP**
Unduh file zip php dari php.org
Buat folder c:\php
ekstrak ke folder tersebut
setup environment variable direktori

restart windows
Buka shell
C:\Users\Lenovo>php -v
PHP 8.3.8 (cli) (built: Jun 4 2024 18:52:30) (ZTS Visual C++ 2019 x64)
Copyright (c) The PHP Group
Zend Engine v4.3.8, Copyright (c) Zend Technologies


## Docker Container

Periksa apakah sudah Docker sudah terinstal
c:> docer –version

Unduh dan instal docker dari [http://www.docker.com](http://www.docker.com)

## MySQL

Unduh di MySQL :: Download MySQL Installer

# React JS

## Cek Instalasi Node

C:\Users\Lenovo>node -v
v22.13.0
Jika muncul nama versi, berarti di PC kamu sudah ada Node

## Instalasi

1. Unduh Node.js di https://nodejs.org/ (unduh versi LTS - Long Term Support)
2. Jalankan installer Node yang dinduh, ikuti langkahnya hingga sukse
3. Cek Instalasi Node
4. Tambahkan environment variable


5. Restart Windows
6. Buka PowerShell dan jalankan sebagai Administrator
7. Ketik PS C:\Windows\system32> Set-ExecutionPolicy -Scope CurrentUser
    -ExecutionPolicy RemoteSigned

```
Akan muncul
Execution Policy Change
The execution policy helps protect you from scripts that you do not trust. Changing
the execution policy might expose you to the security
risks described in the about_Execution_Policies help topic at
https:/go.microsoft.com/fwlink/?LinkID=135170. Do you want to change the
execution policy?
[Y] Yes [A] Yes to All [N] No [L] No to All [S] Suspend [?] Help (default is "N"):
```
8. Ketik Y
9. Ketik C:\Windows\system32> Get-ExecutionPolicy -Scope CurrentUser
    Muncul RemoteSigned
10. Masuk ke folder root proyek laravel
11. Ketik D:\duweet> npm install
    Tunggu proses instalasi
    Jika sukses akan muncul


```
Bearti kita berhasi menginstal dependencies Laravel Mix
```
12. Instal react dan react DOM
13. Instal laravel-mix

14.


