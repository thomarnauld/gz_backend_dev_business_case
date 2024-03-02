** INSTALL DEPENDENCIES **
cd server && yarn install
cd gz_webtracker && yarn install
cd gz_webdriver && yarn install
cd gz_webadmin && yarn install

** START SERVER **
cd server && yarn start --port 3000

** START FRONT **
cd gz_webtracker && ng serve --port 42000
cd gz_webdriver && ng serve --port 42001
cd gz_webadmin && ng serve --port 42002
