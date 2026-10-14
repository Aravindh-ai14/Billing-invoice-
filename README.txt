INVOICE APP SETUP (Windows)
1. Put your original single-file invoice HTML anywhere, then run in this folder:
     npm install
     node tools/extract-assets.js "C:\path\to\original-invoice.html"
   (this creates public/images/logo-left.png, logo-right.jpg, signature.png)
2. Optional PostgreSQL: set PGPASSWORD (host localhost, port 5434, db postersdb, user postgres).
     set PGPASSWORD=yourpassword
3. npm start  ->  open http://localhost:3000
Without PostgreSQL the app still works and saves in the browser.
