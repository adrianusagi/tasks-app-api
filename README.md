# tasks-app-api

### Stacks
- NodeJs
- TypeScript
- Express
- Postgres
- Docker


### Waktu pengerjaan
8 April 2026 09:00 - 14:00

### Cara menjalankan
Project berjalan dengan environment Docker, untuk menjalankannya menggunakan command
```
docker compose up --build
```
Sekaligus akan menjalankan 3 services
- Postgres database
- Backend API
- Test

Untuk menjalankan Test saja, menggunakan command
```
docker compose run task_test
```

### Alur API
Login -> Token Granted -> Request API

Untuk mendapatkan akses ke endpoints user diharuskan login menggunakan email dan password untuk mendapatkan akses token. Akses token ini yang akan berfungsi sebagai session dan harus disertakan pada setiap request.

List endpoint yang tersedia dan cara penggunaan tersedia di direktori Postman. 
1. Import collection dan environment ke Postman.
2. Send Request API v1/authentications/login
3. Copy token pada response ke environment task-app/token
4. API dapat digunakan

### Notes
Beberapa endpoint sengaja dibuat seolah tidak efisien pada tahapan ini, karena besar kemungkinan akan ditambahkan step baru dalam perkembangannya.
